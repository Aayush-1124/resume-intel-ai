import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';
import crypto from 'crypto';
import { z } from 'zod';
import cache from '../utils/cache.js';
import { fetchWithRetry } from '../utils/fetchWithRetry.js';
import { validateRequest } from '../middleware/validate.js';
import { ApiError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

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

/* ── Simple hash helper for cache keys ───────────────────────────── */
function hashKey(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/* ── Shared Gemini resume-parse prompt ───────────────────────────── */
const buildParsePrompt = (rawText) => `You are a precise resume parser with expertise in handling various resume formats. Extract ALL information from the following resume text and return ONLY a valid JSON object. Do not include markdown code blocks, backticks, or any explanation — just raw JSON.

IMPORTANT PARSING INSTRUCTIONS:
1. MULTI-COLUMN DETECTION: The text may come from a multi-column layout. Watch for interleaved content from side-by-side columns (e.g. contact info mixed with skills). Reconstruct logical sections even if text is jumbled.
2. DUPLICATE REMOVAL: If the same text appears multiple times (common with PDF extraction), keep only one instance.
3. PROJECTS: Extract personal, academic, and freelance projects into a separate "projects" array. DO NOT mix them with work experience. For each project, extract the project name as "title", the role or sub-title as "role", any URL as "link", and the details as "bullets".
4. SKILLS FORMAT: Extract skills as 3-4 category lines in "Category: item1, item2, item3" format:
   - "Languages: Python, JavaScript, ..."
   - "Frameworks & Libraries: React.js, Node.js, ..."
   - "Tools & Platforms: Git, Docker, AWS, ..."
   - "Concepts: REST APIs, Microservices, Agile, ..." (optional 4th line)
5. LINKS: Preserve LinkedIn URLs (linkedin field) and GitHub URLs (website field if no other website).
6. CERTIFICATIONS and AWARDS: Extract these as distinct arrays if present.

JSON schema:
{
  "personal": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "website": "string",
    "linkedin": "string",
    "summary": "string"
  },
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": false,
      "bullets": ["string"]
    }
  ],
  "projects": [
    {
      "title": "string",
      "role": "string",
      "link": "string",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduationYear": "string",
      "achievements": "string"
    }
  ],
  "skills": {
    "technical": ["Languages: ...", "Frameworks & Libraries: ...", "Tools & Platforms: ...", "Concepts: ..."],
    "soft": ["string"],
    "languages": ["string"],
    "certifications": ["string"]
  },
  "awards": ["string"]
}

Resume text:
${rawText}`;

/* ── Helper: safe JSON parse (strips fences) ─────────────────────── */
function safeParseJson(raw) {
  const clean = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(clean);
}

/* ────────────────────────────────────────────────────────────────────
   POST /api/ai/parse-doc   — accepts DOCX or PDF
   ──────────────────────────────────────────────────────────────────── */
router.post('/parse-doc', upload.single('resume'), async (req, res, next) => {
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

    const ai = getGemini();
    const prompt = buildParsePrompt(rawText.slice(0, 15000));
    
    const result = await fetchWithRetry(async () => {
      return await withTimeout(
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        })
      );
    }, 'Gemini_ParseDoc', 2);

    let parsed;
    try {
      parsed = safeParseJson(result.text);
    } catch {
      throw new ApiError(422, 'AI_PARSE_ERROR', 'AI returned malformed JSON. Please try again.', true);
    }

    res.json({ success: true, data: parsed });
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
router.post('/tailor', validateRequest(TailorSchema), async (req, res, next) => {
  try {
    const { experience, skills, jobDescription } = req.body;

    const cacheKey = hashKey({ route: 'tailor-v2', experience, skills, jobDescription });
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

      const result = await fetchWithRetry(async () => {
        return await withTimeout(
          ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }),
          45_000
        );
      }, 'Gemini_Tailor', 2);

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

    cache.set(cacheKey, response);
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
router.post('/ats-score', validateRequest(AtsScoreSchema), async (req, res, next) => {
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
router.post('/organize-skills', validateRequest(OrganizeSkillsSchema), async (req, res, next) => {
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

export default router;
