import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';
import crypto from 'crypto';
import { z } from 'zod';
import cache from '../utils/cache.js';
import { withInflight } from '../utils/inflightCache.js';
import { fetchWithRetry } from '../utils/fetchWithRetry.js';
import { validateRequest } from '../middleware/validate.js';
import { ApiError } from '../middleware/errorHandler.js';
import { heavyAiLimiter, parseLimiter, lightLimiter } from '../middleware/rateLimiter.js';
import logger from '../utils/logger.js';

/* ── Cache TTLs (seconds) per endpoint ───────────────────────────── */
const TTL = {
  parseDoc:          24 * 60 * 60,  // 24 h — same file rarely changes
  tailor:            60 * 60,       // 1 h
  recruiterReview:   60 * 60,       // 1 h
  coverLetter:       60 * 60,       // 1 h
  interviewQuestions:60 * 60,       // 1 h
  atsScore:          10 * 60,       // 10 min — user edits resume frequently
};

const router = express.Router();

/* ── multer: accept DOCX + PDF ───────────────────────────────────── */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/pdf',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith('.docx') || file.originalname.endsWith('.doc')) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'INVALID_FILE_TYPE', 'Only DOCX, DOC, or PDF files are allowed', false));
    }
  },
});

/* ── Gemini factory (cached singleton) ───────────────────────────── */
let geminiInstance = null;
const getGemini = () => {
  if (geminiInstance) return geminiInstance;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new ApiError(500, 'MISSING_API_KEY', 'GEMINI_API_KEY not configured', false);
  }
  geminiInstance = new GoogleGenAI({ apiKey });
  return geminiInstance;
};

/* ── 30-second timeout wrapper for AI calls ──────────────────────── */
const AI_TIMEOUT_MS = 30_000;
function withTimeout(promise, ms = AI_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const err = new Error(`AI call timed out after ${ms / 1000}s`);
      err.code = 'ETIMEDOUT';
      setTimeout(() => reject(err), ms);
    })
  ]);
}

/* ── Cache key helpers ───────────────────────────────────────────── */
function hashKey(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Normalise a job description before hashing so minor whitespace
 * differences don't create unnecessary cache misses.
 *
 * We intentionally keep punctuation (/, +, #, .) because tech terms
 * like "C++", "C#", "CI/CD", "Node.js" must remain distinct.
 * Only collapse runs of whitespace and fold case.
 */
function normaliseJD(jd = '') {
  return (jd || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')  // collapse whitespace only
    .trim()
    .slice(0, 2000);        // cap length — tail rarely changes scoring
}

/**
 * Build a stable cache key for AI endpoints.
 * Hashes only the semantically meaningful parts, not raw formatting.
 */
function aiCacheKey(route, resumeData, jd, extras = {}) {
  // Condense resume to the parts that actually affect AI output
  const resumeFingerprint = {
    name:       resumeData?.personal?.fullName || '',
    summary:    (resumeData?.personal?.summary || '').slice(0, 100),
    expTitles:  (resumeData?.experience || []).map(e => e.title + e.company).join('|'),
    skills:     (resumeData?.skills?.technical || []).join('|'),
    projTitles: (resumeData?.projects || []).map(p => p.title).join('|'),
    eduDegrees: (resumeData?.education || []).map(e => e.degree + e.institution).join('|'),
  };
  return hashKey({ route, resume: resumeFingerprint, jd: normaliseJD(jd), ...extras });
}

/* ── Raw text pre-processing before sending to Gemini ────────────── */
function preprocessResumeText(rawText) {
  let text = rawText;

  // 1. Normalize line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Remove excessive blank lines (more than 2 in a row → 2)
  text = text.replace(/\n{3,}/g, '\n\n');

  // 3. Normalize bullet/list chars to a plain dash so Gemini reads them uniformly
  text = text.replace(/^[•‣◦⁃∙·▪▫•◦▪▫–—]\s*/gm, '- ');

  // 4. Collapse runs of spaces/tabs inside a line (common from PDF column merging)
  text = text.replace(/[ \t]{3,}/g, '  ');

  // 5. Remove null bytes and non-printable characters
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 6. Deduplicate adjacent identical lines (PDF sometimes outputs each line twice)
  const lines = text.split('\n');
  const dedupedLines = lines.filter((line, i) => i === 0 || line.trim() !== lines[i - 1].trim());
  text = dedupedLines.join('\n');

  // 7. Normalize common Unicode typography
  text = text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–/g, '-')
    .replace(/—/g, '--');

  return text.trim();
}

/* ── Shared Gemini resume-parse prompt ───────────────────────────── */
const buildParsePrompt = (rawText) => `You are an expert resume parser. Your ONLY output is a single valid JSON object — no markdown fences, no backticks, no comments, no explanation.

═══════════════════════════════ PARSING RULES ═══════════════════════════════

SECTION RECOGNITION — Accept ALL common variants of each section heading:
• Personal/Contact: "Contact", "Contact Information", "Personal Details", "About", "Profile"
• Summary: "Summary", "Objective", "Professional Summary", "Career Summary", "About Me", "Profile", "Overview"
• Experience: "Experience", "Work Experience", "Professional Experience", "Employment", "Work History", "Career History", "Employment History", "Positions Held"
• Projects: "Projects", "Personal Projects", "Academic Projects", "Side Projects", "Portfolio", "Key Projects", "Selected Projects"
• Education: "Education", "Academic Background", "Educational Qualifications", "Academics", "Schooling"
• Skills: "Skills", "Technical Skills", "Core Competencies", "Competencies", "Technologies", "Tech Stack", "Expertise", "Key Skills"
• Certifications: "Certifications", "Certificates", "Licenses", "Professional Certifications", "Credentials", "Accreditations"
• Awards: "Awards", "Honors", "Achievements", "Recognition", "Accomplishments"

MULTI-COLUMN PDF — Text extraction often interleaves left and right columns. Signs:
• Short snippets of contact info (email/phone/location) appearing in the middle of skills or experience
• Section headings appearing out-of-order
• Skill tags appearing inline with job descriptions
Reconstruct each logical section by collecting ALL its content regardless of where it appears.

SKILLS NORMALIZATION — Convert ALL skill representations into these 3–4 category lines:
• "Languages: Python, JavaScript, TypeScript, Java, SQL, ..."
• "Frameworks & Libraries: React, Node.js, Django, Spring Boot, ..."
• "Tools & Platforms: Git, Docker, AWS, Kubernetes, MongoDB, ..."
• "Concepts: REST APIs, Microservices, CI/CD, Agile, System Design, ..."
Even if the resume lists skills as a comma-separated paragraph, a flat tag list, proficiency bars, or a single bullet — normalize to this format.

DATES — Preserve as-is (e.g. "Jan 2022", "2021–2023", "Present", "Current"). Set "current": true when endDate is "Present", "Current", "Now", or empty with an ongoing role.

PHONE — Accept all formats: +91-9876543210, (555) 123-4567, 9876543210, +44 20 7946 0958. Preserve exactly as written.

LINKS — linkedin field: any URL containing "linkedin.com". website field: GitHub URL or personal portfolio. If both GitHub and another website exist, use the portfolio for website and GitHub goes in a separate note (or website if no other site).

BULLETS — Each bullet must be a complete sentence or fragment. Do NOT split a single bullet into multiple if it runs long. Do NOT merge separate bullets into one.

PROJECTS vs EXPERIENCE — A "Project" is something built personally (academic, freelance, open-source, side project). "Experience" is paid employment or official internship at a company. When ambiguous, prefer Projects.

CERTIFICATIONS — Extract as plain strings: "AWS Certified Solutions Architect – Associate (2023)".

DUPLICATE REMOVAL — If any text block appears twice (common in PDF extraction), keep only one instance.

═══════════════════════════════ OUTPUT SCHEMA ═══════════════════════════════

{
  "personal": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string (city, state/country)",
    "website": "string (GitHub or portfolio URL)",
    "linkedin": "string (LinkedIn URL or username)",
    "summary": "string (full paragraph, not truncated)"
  },
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string (or 'Present')",
      "current": false,
      "bullets": ["string"]
    }
  ],
  "projects": [
    {
      "title": "string",
      "role": "string (subtitle or tech stack line if present)",
      "link": "string (GitHub/demo URL if mentioned)",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string (e.g. B.Tech, B.Sc, M.S.)",
      "field": "string (e.g. Computer Science)",
      "graduationYear": "string",
      "achievements": "string (GPA, honours, relevant coursework — blank string if none)"
    }
  ],
  "skills": {
    "technical": ["Languages: ...", "Frameworks & Libraries: ...", "Tools & Platforms: ...", "Concepts: ..."],
    "soft": ["string"],
    "languages": ["string (spoken languages, e.g. English, Hindi)"],
    "certifications": ["string"]
  },
  "awards": ["string"]
}

═══════════════════════════════ RESUME TEXT ══════════════════════════════════

${rawText}`;

/* ── Helper: safe JSON parse (strips fences) ─────────────────────── */
function safeParseJson(raw) {
  const clean = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(clean);
}

/* ────────────────────────────────────────────────────────────────────
   POST /api/ai/parse-doc   — accepts DOCX or PDF
   ──────────────────────────────────────────────────────────────────── */
router.post('/parse-doc', parseLimiter, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'MISSING_FILE', 'No file uploaded', false);

    const mime = req.file.mimetype;
    const name = req.file.originalname?.toLowerCase() || '';
    let rawText = '';

    const isDoc = name.endsWith('.doc') && !name.endsWith('.docx');
    const isDocx = mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || name.endsWith('.docx');
    const isPdf = mime === 'application/pdf' || name.endsWith('.pdf');

    if (isDoc) {
      throw new ApiError(400, 'UNSUPPORTED_FORMAT', 'Legacy .doc format is not supported. Please convert your file to .docx (Word 2007+) or PDF.', false);
    }

    if (isDocx) {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      rawText = result.value || '';
    } else if (isPdf) {
      const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
      const pdfData = await pdfParse(req.file.buffer);
      rawText = pdfData.text || '';
    } else {
      throw new ApiError(400, 'UNSUPPORTED_FORMAT', 'Unsupported file type. Upload a DOCX or PDF.', false);
    }

    if (!rawText || rawText.trim().length < 30) {
      throw new ApiError(400, 'UNREADABLE_FILE', 'Could not extract readable text. Make sure the file is a text-based DOCX/PDF.', false);
    }

    // Cache parse results by a fingerprint of the file content
    // (first 500 + last 200 chars + total length — stable across uploads)
    const cleanText = preprocessResumeText(rawText).slice(0, 16000);
    const parseKey  = hashKey({
      route:       'parse-doc-v2',
      textLen:     cleanText.length,
      textHead:    cleanText.slice(0, 500),
      textTail:    cleanText.slice(-200),
    });
    const cachedParse = cache.get(parseKey);
    if (cachedParse) return res.json(cachedParse);

    const ai = getGemini();
    const prompt = buildParsePrompt(cleanText);

    const result = await withInflight(parseKey, () =>
      fetchWithRetry(() =>
        withTimeout(ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt })),
        'Gemini_ParseDoc', 2
      )
    );

    let parsed;
    try {
      parsed = safeParseJson(result.text);
    } catch {
      throw new ApiError(422, 'AI_PARSE_ERROR', 'AI returned malformed JSON. Please try again.', true);
    }

    const parseResponse = { success: true, data: parsed };
    cache.set(parseKey, parseResponse, TTL.parseDoc);
    res.json(parseResponse);
  } catch (err) {
    next(err);
  }
});

const TAXONOMY = {
  "python": "Languages", "javascript": "Languages", "js": "Languages", "typescript": "Languages", "java": "Languages", "c++": "Languages", "c#": "Languages", "ruby": "Languages", "php": "Languages", "go": "Languages", "rust": "Languages", "swift": "Languages", "kotlin": "Languages", "sql": "Languages", "html": "Languages", "css": "Languages", "r": "Languages", "bash": "Languages",
  "react": "Frameworks & Libraries", "node.js": "Frameworks & Libraries", "express": "Frameworks & Libraries", "next.js": "Frameworks & Libraries", "vue": "Frameworks & Libraries", "angular": "Frameworks & Libraries", "django": "Frameworks & Libraries", "flask": "Frameworks & Libraries", "spring boot": "Frameworks & Libraries", "tailwind": "Frameworks & Libraries", "flutter": "Frameworks & Libraries", "react native": "Frameworks & Libraries", "pandas": "Frameworks & Libraries", "tensorflow": "Frameworks & Libraries", "pytorch": "Frameworks & Libraries",
  "git": "Tools & Platforms", "docker": "Tools & Platforms", "kubernetes": "Tools & Platforms", "aws": "Tools & Platforms", "azure": "Tools & Platforms", "gcp": "Tools & Platforms", "firebase": "Tools & Platforms", "linux": "Tools & Platforms", "jira": "Tools & Platforms", "mongodb": "Tools & Platforms", "postgresql": "Tools & Platforms", "redis": "Tools & Platforms",
  "rest": "Concepts", "graphql": "Concepts", "microservices": "Concepts", "agile": "Concepts", "ci/cd": "Concepts", "machine learning": "Concepts", "ai": "Concepts", "data science": "Concepts", "oop": "Concepts", "devops": "Concepts", "system design": "Concepts",
};

const TailorSchema = z.object({
  body: z.object({
    experience: z.array(z.any()),
    skills: z.any().optional(),
    jobDescription: z.string().min(1, 'Job description is required'),
  })
});

/* ────────────────────────────────────────────────────────────────────
   POST /api/ai/tailor   — HYBRID: rewrite only weak bullets
   ──────────────────────────────────────────────────────────────────── */
router.post('/tailor', heavyAiLimiter, validateRequest(TailorSchema), async (req, res, next) => {
  try {
    const { experience, skills, jobDescription } = req.body;

    // Normalise JD before hashing — minor formatting differences shouldn't miss cache
    const cacheKey = hashKey({
      route: 'tailor-v2',
      expTitles: experience.map(e => (e.title || '') + (e.company || '')).join('|'),
      bullets: experience.flatMap(e => e.bullets || []).join('|'),
      jd: normaliseJD(jobDescription),
    });
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const jdLower = jobDescription.toLowerCase();
    const jdKeywords = Object.keys(TAXONOMY).filter(kw => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^a-z0-9])(${escaped})([^a-z0-9]|$)`, 'i').test(jdLower);
    });

    const analyzedExperience = experience.map((role, roleIdx) => {
      const bulletAnalysis = (role.bullets || []).map((bullet, bulletIdx) => {
        const bulletLower = bullet.toLowerCase();
        const matchedKws = jdKeywords.filter(kw => {
          const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return new RegExp(`(^|[^a-z0-9])(${escaped})([^a-z0-9]|$)`, 'i').test(bulletLower);
        });
        return {
          roleIdx, bulletIdx, text: bullet,
          needsRewrite: matchedKws.length < 2, 
        };
      });
      return { role, bulletAnalysis };
    });

    const weakBullets = [];
    analyzedExperience.forEach(({ role, bulletAnalysis }) => {
      bulletAnalysis.forEach(ba => {
        if (ba.needsRewrite) {
          weakBullets.push({ roleTitle: role.title, company: role.company, originalBullet: ba.text, roleIdx: ba.roleIdx, bulletIdx: ba.bulletIdx });
        }
      });
    });

    let rewrittenMap = {};

    if (weakBullets.length > 0) {
      const ai = getGemini();
      const bulletList = weakBullets.map((wb, i) => `[${i}] Role: "${wb.roleTitle}" at "${wb.company}" → "${wb.originalBullet}"`).join('\n');
      const prompt = `You are an expert resume writer. Rewrite ONLY these specific bullet points to naturally incorporate keywords from the job description.
RULES:
1. DO NOT fabricate metrics, achievements, or technologies not implied by the original
2. Incorporate relevant JD keywords naturally into the text
3. Use strong action verbs (Led, Architected, Engineered, Spearheaded, etc.)
4. KEEP EACH BULLET TO MAXIMUM 20 WORDS. Be extremely concise.
5. Maintain factual accuracy — enhance language only, do not invent
KEY JD KEYWORDS TO INCORPORATE WHERE RELEVANT:
${jdKeywords.join(', ')}
BULLETS TO REWRITE:
${bulletList}
JOB DESCRIPTION (for context):
${jobDescription.slice(0, 3000)}
Return ONLY a raw JSON array of rewritten strings, in the same order as the input. No markdown, no explanation.`;

      const result = await withInflight(cacheKey + '_tailor', () =>
        fetchWithRetry(() =>
          withTimeout(
            ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }),
            45_000
          ),
          'Gemini_Tailor', 2
        )
      );

      let rewritten;
      try {
        rewritten = safeParseJson(result.text);
        if (!Array.isArray(rewritten)) rewritten = Object.values(rewritten).flat();
      } catch {
        rewritten = weakBullets.map(wb => wb.originalBullet);
      }

      weakBullets.forEach((wb, i) => {
        if (rewritten[i] && typeof rewritten[i] === 'string') {
          rewrittenMap[`${wb.roleIdx}-${wb.bulletIdx}`] = rewritten[i];
        }
      });
    }

    const finalExperience = experience.map((role, roleIdx) => ({
      ...role,
      bullets: (role.bullets || []).map((bullet, bulletIdx) => {
        return rewrittenMap[`${roleIdx}-${bulletIdx}`] || bullet;
      }),
    }));

    let finalSkills = null;
    if (skills) {
      const parsedCategories = { 'Languages': [], 'Frameworks & Libraries': [], 'Tools & Platforms': [], 'Concepts': [] };
      if (Array.isArray(skills.technical)) {
        skills.technical.forEach(line => {
          const [cat, ...rest] = line.split(':');
          if (cat && rest.length > 0) {
            const categoryName = cat.trim();
            const items = rest.join(':').split(',').map(i => i.trim()).filter(Boolean);
            let mappedCat = categoryName;
            if (categoryName.includes('Language')) mappedCat = 'Languages';
            else if (categoryName.includes('Framework') || categoryName.includes('Librar')) mappedCat = 'Frameworks & Libraries';
            else if (categoryName.includes('Tool') || categoryName.includes('Platform')) mappedCat = 'Tools & Platforms';
            else if (categoryName.includes('Concept')) mappedCat = 'Concepts';
            
            if (!parsedCategories[mappedCat]) parsedCategories[mappedCat] = [];
            items.forEach(item => {
              if (!parsedCategories[mappedCat].some(e => e.toLowerCase() === item.toLowerCase())) {
                parsedCategories[mappedCat].push(item);
              }
            });
          }
        });
      }
      const newTechnical = [];
      for (const [cat, items] of Object.entries(parsedCategories)) {
        if (items.length > 0) newTechnical.push(`${cat}: ${items.join(', ')}`);
      }
      finalSkills = { technical: newTechnical };
    }

    const response = { success: true, data: finalExperience };
    if (finalSkills) response.skills = finalSkills;

    cache.set(cacheKey, response, TTL.tailor);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

const AtsScoreSchema = z.object({
  body: z.object({
    resumeData: z.any(),
    jobDescription: z.string().min(1),
  })
});

/* ────────────────────────────────────────────────────────────────────
   POST /api/ai/ats-score   — keyword match algorithm
   ──────────────────────────────────────────────────────────────────── */
router.post('/ats-score', lightLimiter, validateRequest(AtsScoreSchema), async (req, res, next) => {
  try {
    const { resumeData, jobDescription } = req.body;
    const resumeText = [
      resumeData.personal?.fullName || '', resumeData.personal?.summary || '',
      ...(resumeData.experience || []).flatMap((e) => [e.title || '', e.company || '', ...(e.bullets || [])]),
      ...(resumeData.skills?.technical || []), ...(resumeData.skills?.soft || []),
      ...(resumeData.education || []).flatMap((e) => [e.degree || '', e.field || '', e.institution || '']),
    ].join(' ').toLowerCase();

    const jdLower = jobDescription.toLowerCase();
    const allTerms = Object.keys(TAXONOMY).filter(kw => {
      const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^a-z0-9])(${escapedKw})([^a-z0-9]|$)`, 'i').test(jdLower);
    });

    const matched = allTerms.filter(kw => {
      const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^a-z0-9])(${escapedKw})([^a-z0-9]|$)`, 'i').test(resumeText);
    });

    const missing = allTerms.filter(kw => !matched.includes(kw));

    const keywordScore = allTerms.length > 0 ? (matched.length / allTerms.length) * 50 : 50;
    const allBullets = (resumeData.experience || []).flatMap((e) => e.bullets || []);
    const bulletsText = allBullets.join(' ').toLowerCase();
    const contextualMatched = matched.filter(kw => {
      const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^a-z0-9])(${escapedKw})([^a-z0-9]|$)`, 'i').test(bulletsText);
    });
    const contextualScore = matched.length > 0 ? (contextualMatched.length / matched.length) * 20 : 0;
    const finalContextualScore = allTerms.length === 0 ? 20 : contextualScore;

    const metricsRegex = /\b(\d+%|\d+x|\$\d+|\d+\+?)\b|\d{2,}/i;
    const bulletsWithMetrics = allBullets.filter(b => metricsRegex.test(b)).length;
    const metricsRatio = allBullets.length > 0 ? (bulletsWithMetrics / allBullets.length) : 0;
    const metricsScore = allBullets.length > 0 ? Math.min(15, (metricsRatio / 0.3) * 15) : 0;

    const actionVerbs = ['led', 'managed', 'developed', 'created', 'designed', 'improved', 'increased', 'reduced', 'implemented', 'built', 'architected', 'delivered', 'spearheaded', 'orchestrated', 'optimized', 'engineered'];
    const verbsFound = actionVerbs.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(bulletsText)).length;
    const verbsScore = Math.min(10, (verbsFound / 5) * 10);
    const wordCount = resumeText.split(/\s+/).length;
    const lengthScore = Math.min(5, (wordCount / 250) * 5);
    const finalVerbsScore = verbsScore + lengthScore;

    const rawScore = keywordScore + finalContextualScore + metricsScore + finalVerbsScore;
    const finalScore = Math.min(99, Math.max(15, Math.round(rawScore)));

    const improvements = [];
    if (finalScore < 90) {
      if (metricsScore < 10) improvements.push("Add quantifiable metrics (%, $, numbers) to your experience bullets to prove your impact.");
      if (finalContextualScore < 15 && matched.length > 0) improvements.push("Weave your matched keywords naturally into your experience bullets, rather than just listing them in the Skills section.");
      if (verbsScore < 8) improvements.push("Start more of your bullet points with strong action verbs (e.g., Led, Architected, Engineered).");
      if (lengthScore < 4) improvements.push("Your resume is a bit short. Add more detail to aim for at least 250 words.");
    }

    res.json({
      success: true,
      score: finalScore,
      matched: matched.length,
      total: allTerms.length,
      missingKeywords: missing,
      improvements
    });
  } catch (err) {
    next(err);
  }
});

const OrganizeSkillsSchema = z.object({
  body: z.object({
    currentSkills: z.any(),
    missingKeywords: z.array(z.string()),
  })
});

/* ────────────────────────────────────────────────────────────────────
   POST /api/ai/organize-skills   — Manual Keyword Injection
   ──────────────────────────────────────────────────────────────────── */
router.post('/organize-skills', lightLimiter, validateRequest(OrganizeSkillsSchema), async (req, res, next) => {
  try {
    const { currentSkills, missingKeywords } = req.body;
    const parsedCategories = { 'Languages': [], 'Frameworks & Libraries': [], 'Tools & Platforms': [], 'Concepts': [] };

    if (currentSkills && Array.isArray(currentSkills.technical)) {
      currentSkills.technical.forEach(line => {
        const [cat, ...rest] = line.split(':');
        if (cat && rest.length > 0) {
          const categoryName = cat.trim();
          const items = rest.join(':').split(',').map(i => i.trim()).filter(Boolean);
          let mappedCat = categoryName;
          if (categoryName.includes('Language')) mappedCat = 'Languages';
          else if (categoryName.includes('Framework') || categoryName.includes('Librar')) mappedCat = 'Frameworks & Libraries';
          else if (categoryName.includes('Tool') || categoryName.includes('Platform')) mappedCat = 'Tools & Platforms';
          else if (categoryName.includes('Concept')) mappedCat = 'Concepts';
          
          if (!parsedCategories[mappedCat]) parsedCategories[mappedCat] = [];
          items.forEach(item => {
             if (!parsedCategories[mappedCat].some(existing => existing.toLowerCase() === item.toLowerCase())) {
                 parsedCategories[mappedCat].push(item);
             }
          });
        }
      });
    }

    if (Array.isArray(missingKeywords)) {
      missingKeywords.forEach(keyword => {
        const lowerKw = keyword.toLowerCase().trim();
        const targetCategory = TAXONOMY[lowerKw];
        if (targetCategory) {
          if (!parsedCategories[targetCategory].some(existing => existing.toLowerCase() === lowerKw)) {
            parsedCategories[targetCategory].push(keyword);
          }
        }
      });
    }

    const newTechnical = [];
    for (const [cat, items] of Object.entries(parsedCategories)) {
      if (items.length > 0) newTechnical.push(`${cat}: ${items.join(', ')}`);
    }

    res.json({ success: true, technical: newTechnical });
  } catch (err) {
    next(err);
  }
});

/* ════════════════════════════════════════════════════════════════════
   KEYWORD EXPLANATION DATA — "why this keyword matters" taxonomy
   ════════════════════════════════════════════════════════════════════ */
const KEYWORD_WHY = {
  // Languages
  "python":     "High-demand language for backend, ML/AI, and data science roles.",
  "javascript": "Core language of the web; required for virtually every frontend/fullstack role.",
  "js":         "Core language of the web; required for virtually every frontend/fullstack role.",
  "typescript": "Adds type safety to JS — increasingly required in production codebases.",
  "java":       "Enterprise standard; widely used in fintech, healthcare, and large-scale systems.",
  "c++":        "Critical for systems programming, gaming, and performance-sensitive applications.",
  "c#":         ".NET ecosystem staple for enterprise apps, game dev (Unity), and Azure workloads.",
  "ruby":       "Widely used in startups via Rails; signals rapid-prototyping capability.",
  "php":        "Backs a large portion of the web (WordPress, Laravel); common in web agencies.",
  "go":         "Growing demand for high-performance microservices and cloud-native tooling.",
  "rust":       "Systems programming with memory safety; increasingly valued in infra/cloud roles.",
  "swift":      "Required for native iOS/macOS development; Apple ecosystem staple.",
  "kotlin":     "Modern Android development standard; interoperates with Java.",
  "sql":        "Universal data-querying language; expected in any data-touching role.",
  "html":       "Foundation of web content; baseline requirement for any web role.",
  "css":        "Controls visual styling; paired with HTML for all web roles.",
  "r":          "Standard in statistical computing and academic data science.",
  "bash":       "Shell scripting for automation and DevOps pipelines.",
  // Frameworks & Libraries
  "react":         "Most popular frontend library; in high demand across startups and enterprises.",
  "node.js":       "Enables JS on the server; central to fullstack JS and API development.",
  "express":       "Lightweight Node.js framework; the backbone of many REST APIs.",
  "next.js":       "React meta-framework for SSR and full-stack apps; growing rapidly in demand.",
  "vue":           "Progressive JS framework; popular in Europe and mid-size companies.",
  "angular":       "Enterprise-grade frontend framework; common in large orgs and corporate stacks.",
  "django":        "Python's batteries-included web framework; fast to prototype secure apps.",
  "flask":         "Lightweight Python web framework; flexible for APIs and microservices.",
  "spring boot":   "Java enterprise standard; critical for large-scale backend microservices.",
  "tailwind":      "Utility-first CSS framework; signals modern frontend workflow efficiency.",
  "flutter":       "Cross-platform mobile UI framework from Google; growing fast.",
  "react native":  "Build native iOS/Android apps with React; bridges mobile + web skills.",
  "pandas":        "Essential data-manipulation library for Python data roles.",
  "tensorflow":    "Industry-standard deep learning framework; key for ML engineer roles.",
  "pytorch":       "Research-first deep learning; growing adoption in production ML.",
  // Tools & Platforms
  "git":        "Non-negotiable version control; foundational for all collaborative coding.",
  "docker":     "Containerisation standard; expected for any modern DevOps or backend role.",
  "kubernetes": "Orchestrates Docker at scale; highly valued for cloud/platform engineer roles.",
  "aws":        "Market-leading cloud; AWS skills open doors across nearly every tech sector.",
  "azure":      "Microsoft's cloud; dominant in enterprise and government workloads.",
  "gcp":        "Google's cloud; in demand especially for ML/data workloads.",
  "firebase":   "Google's BaaS; common in mobile and rapid-prototyping contexts.",
  "linux":      "The OS of servers and cloud; expected knowledge for backend and DevOps.",
  "jira":       "Industry-standard project tracking; signals Agile team experience.",
  "mongodb":    "Leading NoSQL database; ubiquitous in MERN stack and document-oriented apps.",
  "postgresql": "Most advanced open-source SQL DB; favoured for relational data workloads.",
  "redis":      "In-memory data store for caching and queues; key for high-performance systems.",
  // Concepts
  "rest":            "REST APIs are the standard interface between services; universally expected.",
  "graphql":         "Query language for APIs; valued in product companies for flexible data fetching.",
  "microservices":   "Architectural pattern for scalable, independently deployable services.",
  "agile":           "Dominant software development methodology; signals team collaboration skills.",
  "ci/cd":           "Continuous integration/delivery; signals modern DevOps mindset.",
  "machine learning":"Core AI/ML competency; critical for data science and ML engineer roles.",
  "ai":              "Broad AI literacy signals modern technical relevance.",
  "data science":    "Data-driven decision-making skill set; cross-industry demand.",
  "oop":             "Object-oriented design is foundational to most production codebases.",
  "devops":          "Culture of combined dev + ops; highly valued for shipping fast and safely.",
  "system design":   "Ability to architect scalable systems; tested heavily in senior interviews.",
};

/* ════════════════════════════════════════════════════════════════════
   POST /api/ai/keyword-explain  — returns ATS keyword breakdown
   (No Gemini — purely based on TAXONOMY + KEYWORD_WHY)
   ════════════════════════════════════════════════════════════════════ */
const KeywordExplainSchema = z.object({
  body: z.object({
    resumeData:      z.any(),
    jobDescription:  z.string().min(1),
  })
});

router.post('/keyword-explain', lightLimiter, validateRequest(KeywordExplainSchema), async (req, res, next) => {
  try {
    const { resumeData, jobDescription } = req.body;

    const resumeText = [
      resumeData.personal?.summary || '',
      ...(resumeData.experience || []).flatMap((e) => [e.title || '', e.company || '', ...(e.bullets || [])]),
      ...(resumeData.skills?.technical || []),
      ...(resumeData.education || []).flatMap((e) => [e.degree || '', e.field || '']),
    ].join(' ').toLowerCase();

    const jdLower = jobDescription.toLowerCase();

    const categorised = { Languages: [], 'Frameworks & Libraries': [], 'Tools & Platforms': [], Concepts: [] };
    const missing = { Languages: [], 'Frameworks & Libraries': [], 'Tools & Platforms': [], Concepts: [] };

    Object.entries(TAXONOMY).forEach(([kw, cat]) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const inJD     = new RegExp(`(^|[^a-z0-9])(${escaped})([^a-z0-9]|$)`, 'i').test(jdLower);
      if (!inJD) return; // keyword not in JD — skip

      const inResume = new RegExp(`(^|[^a-z0-9])(${escaped})([^a-z0-9]|$)`, 'i').test(resumeText);
      const entry    = { keyword: kw, category: cat, why: KEYWORD_WHY[kw] || '' };

      if (inResume) categorised[cat]?.push(entry);
      else          missing[cat]?.push(entry);
    });

    res.json({ success: true, matched: categorised, missing });
  } catch (err) {
    next(err);
  }
});

/* ════════════════════════════════════════════════════════════════════
   POST /api/ai/recruiter-review  — qualitative resume feedback
   ════════════════════════════════════════════════════════════════════ */
const RecruiterReviewSchema = z.object({
  body: z.object({
    resumeData:     z.any(),
    jobDescription: z.string().optional(),
  })
});

router.post('/recruiter-review', heavyAiLimiter, validateRequest(RecruiterReviewSchema), async (req, res, next) => {
  try {
    const { resumeData, jobDescription } = req.body;

    const cacheKey = aiCacheKey('recruiter-review-v2', resumeData, jobDescription);
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const ai = getGemini();

    // Send only what the recruiter cares about — trim bullets to 15 words each
    const trimBullet = (b) => b.split(' ').slice(0, 15).join(' ');
    const resumeSummary = JSON.stringify({
      personal:   { ...resumeData.personal, summary: (resumeData.personal?.summary || '').slice(0, 200) },
      experience: (resumeData.experience || []).slice(0, 4).map(e => ({
        title: e.title, company: e.company, startDate: e.startDate, endDate: e.endDate,
        bullets: (e.bullets || []).slice(0, 4).map(trimBullet),
      })),
      skills:     resumeData.skills,
      education:  (resumeData.education || []).slice(0, 2).map(e => ({ institution: e.institution, degree: e.degree, field: e.field })),
      projects:   (resumeData.projects || []).slice(0, 2).map(p => ({ title: p.title, bullets: (p.bullets || []).slice(0, 2).map(trimBullet) })),
    });

    const prompt = `You are a senior technical recruiter. Review this resume honestly and specifically. Return ONLY a valid JSON object — no markdown, no explanation.
${jobDescription ? `\nTarget role / JD excerpt:\n${jobDescription.slice(0, 1500)}` : ''}

Resume (JSON):
${resumeSummary.slice(0, 3000)}

JSON schema to return:
{
  "overallVerdict": "string — 1-2 sentences: your honest gut reaction as a recruiter",
  "score": number — 1-10 overall rating,
  "sections": [
    {
      "title": "string — e.g. Professional Summary / Experience Quality / Skills / Impact & Metrics / ATS Readiness",
      "status": "strong" | "good" | "needs-work" | "missing",
      "feedback": "string — 2-3 specific, honest sentences (no fluff)",
      "tip": "string — one concrete action to take right now"
    }
  ],
  "redFlags": ["string — up to 3 things that would make you skip this resume"],
  "greenFlags": ["string — up to 3 things that stand out positively"],
  "topPriority": "string — the single most impactful change they should make today"
}`;

    const result = await withInflight(cacheKey, () =>
      fetchWithRetry(() =>
        withTimeout(ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }), 30_000),
        'Gemini_RecruiterReview', 2
      )
    );

    let review;
    try {
      review = safeParseJson(result.text);
    } catch {
      throw new ApiError(422, 'AI_PARSE_ERROR', 'AI returned malformed response. Please try again.', true);
    }

    const response = { success: true, ...review };
    cache.set(cacheKey, response, TTL.recruiterReview);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

/* ════════════════════════════════════════════════════════════════════
   POST /api/ai/cover-letter  — generate tailored cover letter
   ════════════════════════════════════════════════════════════════════ */
const CoverLetterSchema = z.object({
  body: z.object({
    resumeData:     z.any(),
    jobDescription: z.string().min(10, 'Job description is required'),
    tone:           z.enum(['professional', 'enthusiastic', 'concise']).optional(),
  })
});

router.post('/cover-letter', heavyAiLimiter, validateRequest(CoverLetterSchema), async (req, res, next) => {
  try {
    const { resumeData, jobDescription, tone = 'professional' } = req.body;

    const cacheKey = aiCacheKey('cover-letter-v2', resumeData, jobDescription, { tone });
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const ai = getGemini();

    const toneGuide = {
      professional:  'formal, polished, measured confidence',
      enthusiastic:  'warm, energetic, genuine passion for the role',
      concise:       'direct, succinct — 3 tight paragraphs, no fluff',
    };

    const prompt = `You are an expert career coach who writes exceptional cover letters. Write a tailored cover letter for this candidate.

TONE: ${toneGuide[tone]}

CANDIDATE:
- Name: ${resumeData.personal?.fullName || 'Candidate'}
- Role: ${resumeData.personal?.role || ''}
- Summary: ${resumeData.personal?.summary || ''}
- Top experience: ${resumeData.experience?.slice(0, 2).map(e => `${e.title} at ${e.company}`).join(', ') || ''}
- Key skills: ${resumeData.skills?.technical?.slice(0, 3).join('; ') || ''}

JOB DESCRIPTION:
${jobDescription.slice(0, 2500)}

RULES:
1. 3-4 paragraphs: hook → value proposition → fit evidence → call-to-action
2. Reference specific details from the JD (company name if present, required skills, role responsibilities)
3. Do NOT start with "I am writing to apply for..."
4. Include real achievements from experience with numbers if available
5. End professionally with a strong call-to-action
6. Total: 250-350 words

Return ONLY a JSON object (no markdown):
{
  "subject": "string (email subject line)",
  "body": "string (the full cover letter — use \\n for line breaks between paragraphs)",
  "highlights": ["string"] (3 key selling points you emphasised)
}`;

    const result = await withInflight(cacheKey, () =>
      fetchWithRetry(() =>
        withTimeout(ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }), 30_000),
        'Gemini_CoverLetter', 2
      )
    );

    let letter;
    try {
      letter = safeParseJson(result.text);
    } catch {
      throw new ApiError(422, 'AI_PARSE_ERROR', 'AI returned malformed response. Please try again.', true);
    }

    const response = { success: true, ...letter };
    cache.set(cacheKey, response, TTL.coverLetter);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

/* ════════════════════════════════════════════════════════════════════
   POST /api/ai/interview-questions  — generate interview prep questions
   ════════════════════════════════════════════════════════════════════ */
const InterviewQuestionsSchema = z.object({
  body: z.object({
    resumeData:     z.any(),
    jobDescription: z.string().min(10, 'Job description is required'),
  })
});

router.post('/interview-questions', heavyAiLimiter, validateRequest(InterviewQuestionsSchema), async (req, res, next) => {
  try {
    const { resumeData, jobDescription } = req.body;

    const cacheKey = aiCacheKey('interview-q-v2', resumeData, jobDescription);
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const ai = getGemini();

    const prompt = `You are a senior technical interviewer who has conducted 1000+ interviews at top tech companies. Generate tailored interview preparation material for this candidate.

CANDIDATE PROFILE:
- Role: ${resumeData.personal?.role || 'Software Engineer'}
- Experience: ${resumeData.experience?.slice(0, 3).map(e => `${e.title} at ${e.company}`).join(', ') || ''}
- Skills: ${resumeData.skills?.technical?.slice(0, 4).join('; ') || ''}
- Summary: ${resumeData.personal?.summary?.slice(0, 200) || ''}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

Return ONLY a valid JSON object (no markdown):
{
  "behavioral": [
    {
      "question": "string",
      "why": "string (why interviewers ask this — 1 sentence)",
      "hint": "string (what a strong answer looks like — 1-2 sentences)",
      "star": "string (suggested STAR framework starter — optional)"
    }
  ],
  "technical": [
    {
      "question": "string",
      "difficulty": "easy" | "medium" | "hard",
      "why": "string (why this is relevant to the role)",
      "hint": "string (key concepts to cover in your answer)"
    }
  ],
  "roleSpecific": [
    {
      "question": "string",
      "context": "string (what aspect of the JD this tests)"
    }
  ],
  "questionsToAsk": ["string"] (3-4 smart questions the candidate should ask the interviewer)
}

Generate: 4 behavioral, 4 technical, 3 role-specific questions. Make them specific to this role and candidate — not generic.`;

    const result = await withInflight(cacheKey, () =>
      fetchWithRetry(() =>
        withTimeout(ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }), 30_000),
        'Gemini_InterviewQ', 2
      )
    );

    let questions;
    try {
      questions = safeParseJson(result.text);
    } catch {
      throw new ApiError(422, 'AI_PARSE_ERROR', 'AI returned malformed response. Please try again.', true);
    }

    const response = { success: true, ...questions };
    cache.set(cacheKey, response, TTL.interviewQuestions);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
