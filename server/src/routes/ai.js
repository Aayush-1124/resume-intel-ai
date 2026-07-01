import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';
import crypto from 'crypto';
import cache from '../utils/cache.js';

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
      cb(new Error('Only DOCX, DOC, or PDF files are allowed'));
    }
  },
});

/* ── Gemini factory (cached singleton) ───────────────────────────── */
let geminiInstance = null;
const getGemini = () => {
  if (geminiInstance) return geminiInstance;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY not configured');
  }
  geminiInstance = new GoogleGenAI({ apiKey });
  return geminiInstance;
};

/* ── 30-second timeout wrapper for AI calls ──────────────────────── */
const AI_TIMEOUT_MS = 30_000;

function withTimeout(promise, ms = AI_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`AI call timed out after ${ms / 1000}s`)), ms)
    ),
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
3. PROJECTS vs EXPERIENCE: Treat all personal, academic, and freelance projects as "experience". Do NOT create a separate projects array. Put them inside the "experience" array. Use the project name as the "title" and "Academic Project" or "Personal Project" as the "company".
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

/* ── Helper: strip unnecessary fields from experience for AI ─────── */
function stripExperienceForAI(experience) {
  if (!Array.isArray(experience)) return experience;
  return experience.map(({ id, current, location, ...rest }) => {
    const stripped = { ...rest };
    // Only keep location if it's non-empty
    if (location && location.trim()) {
      stripped.location = location;
    }
    // Only keep current if it's true
    if (current === true) {
      stripped.current = true;
    }
    return stripped;
  });
}

/* ────────────────────────────────────────────────────────────────────
   POST /api/ai/parse-doc   — accepts DOCX or PDF
   ──────────────────────────────────────────────────────────────────── */
router.post('/parse-doc', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const mime = req.file.mimetype;
    const name = req.file.originalname?.toLowerCase() || '';
    let rawText = '';

    const isDoc = name.endsWith('.doc') && !name.endsWith('.docx');
    const isDocx = mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || name.endsWith('.docx');
    const isPdf = mime === 'application/pdf' || name.endsWith('.pdf');

    // Specific check for .doc files — mammoth only supports .docx
    if (isDoc) {
      return res.status(400).json({
        error: 'Legacy .doc format is not supported. Please convert your file to .docx (Word 2007+) or PDF and try again.',
      });
    }

    if (isDocx) {
      /* ─ DOCX via mammoth ─ */
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      rawText = result.value || '';
    } else if (isPdf) {
      /* ─ PDF via pdf-parse (lazy import) ─ */
      const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
      const pdfData = await pdfParse(req.file.buffer);
      rawText = pdfData.text || '';
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Upload a DOCX or PDF.' });
    }

    if (!rawText || rawText.trim().length < 30) {
      return res.status(400).json({
        error: 'Could not extract readable text. Make sure the file is a text-based DOCX/PDF (not a scanned image).',
      });
    }

    /* ─ Send to Gemini ─ */
    const ai = getGemini();
    const prompt = buildParsePrompt(rawText.slice(0, 15000)); // cap to avoid token overflow
    const result = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })
    );
    const responseText = result.text;

    let parsed;
    try {
      parsed = safeParseJson(responseText);
    } catch {
      return res.status(422).json({
        error: 'AI returned malformed JSON. Please try again.',
        preview: responseText.slice(0, 300),
      });
    }

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('parse-doc error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const TAXONOMY = {
  // Languages
  "python": "Languages", "javascript": "Languages", "js": "Languages", "typescript": "Languages", "ts": "Languages", "java": "Languages", "c++": "Languages", "c#": "Languages", "c": "Languages", "ruby": "Languages", "php": "Languages", "go": "Languages", "golang": "Languages", "rust": "Languages", "swift": "Languages", "kotlin": "Languages", "sql": "Languages", "html": "Languages", "css": "Languages", "html5": "Languages", "css3": "Languages", "r": "Languages", "bash": "Languages", "shell": "Languages", "perl": "Languages", "scala": "Languages", "dart": "Languages",
  // Frameworks & Libraries
  "react": "Frameworks & Libraries", "react.js": "Frameworks & Libraries", "reactjs": "Frameworks & Libraries", "node.js": "Frameworks & Libraries", "nodejs": "Frameworks & Libraries", "node": "Frameworks & Libraries", "express": "Frameworks & Libraries", "express.js": "Frameworks & Libraries", "next.js": "Frameworks & Libraries", "nextjs": "Frameworks & Libraries", "vue": "Frameworks & Libraries", "vue.js": "Frameworks & Libraries", "vuejs": "Frameworks & Libraries", "angular": "Frameworks & Libraries", "angularjs": "Frameworks & Libraries", "django": "Frameworks & Libraries", "flask": "Frameworks & Libraries", "spring boot": "Frameworks & Libraries", "spring": "Frameworks & Libraries", "bootstrap": "Frameworks & Libraries", "tailwind": "Frameworks & Libraries", "tailwindcss": "Frameworks & Libraries", "jquery": "Frameworks & Libraries", "redux": "Frameworks & Libraries", "laravel": "Frameworks & Libraries", "ruby on rails": "Frameworks & Libraries", "rails": "Frameworks & Libraries", "asp.net": "Frameworks & Libraries", ".net": "Frameworks & Libraries", "flutter": "Frameworks & Libraries", "react native": "Frameworks & Libraries", "pandas": "Frameworks & Libraries", "numpy": "Frameworks & Libraries", "tensorflow": "Frameworks & Libraries", "pytorch": "Frameworks & Libraries", "scikit-learn": "Frameworks & Libraries",
  // Tools & Platforms
  "git": "Tools & Platforms", "github": "Tools & Platforms", "gitlab": "Tools & Platforms", "bitbucket": "Tools & Platforms", "docker": "Tools & Platforms", "kubernetes": "Tools & Platforms", "k8s": "Tools & Platforms", "aws": "Tools & Platforms", "amazon web services": "Tools & Platforms", "azure": "Tools & Platforms", "gcp": "Tools & Platforms", "google cloud": "Tools & Platforms", "firebase": "Tools & Platforms", "vercel": "Tools & Platforms", "heroku": "Tools & Platforms", "netlify": "Tools & Platforms", "linux": "Tools & Platforms", "unix": "Tools & Platforms", "jira": "Tools & Platforms", "jenkins": "Tools & Platforms", "postman": "Tools & Platforms", "figma": "Tools & Platforms", "webpack": "Tools & Platforms", "vite": "Tools & Platforms", "mongodb": "Tools & Platforms", "mysql": "Tools & Platforms", "postgresql": "Tools & Platforms", "postgres": "Tools & Platforms", "redis": "Tools & Platforms", "sqlite": "Tools & Platforms", "oracle": "Tools & Platforms", "sql server": "Tools & Platforms", "elasticsearch": "Tools & Platforms", "kafka": "Tools & Platforms", "rabbitmq": "Tools & Platforms", "nginx": "Tools & Platforms", "apache": "Tools & Platforms",
  // Concepts & Roles
  "rest": "Concepts", "rest api": "Concepts", "rest apis": "Concepts", "graphql": "Concepts", "microservices": "Concepts", "agile": "Concepts", "scrum": "Concepts", "ci/cd": "Concepts", "tdd": "Concepts", "machine learning": "Concepts", "ai": "Concepts", "artificial intelligence": "Concepts", "data science": "Concepts", "object-oriented programming": "Concepts", "oop": "Concepts", "mvc": "Concepts", "cloud computing": "Concepts", "devops": "Concepts", "system design": "Concepts", "data structures": "Concepts", "algorithms": "Concepts", "continuous integration": "Concepts", "continuous deployment": "Concepts", "frontend developer": "Concepts", "backend developer": "Concepts", "fullstack": "Concepts", "full stack": "Concepts", "software engineer": "Concepts",
  // Responsive/Design/Web
  "responsive design": "Concepts", "ui/ux": "Concepts", "accessibility": "Concepts", "seo": "Concepts", "web development": "Concepts", "api": "Concepts", "apis": "Concepts", "restful": "Concepts", "responsive": "Concepts"
};

/* ────────────────────────────────────────────────────────────────────
   POST /api/ai/tailor   — HYBRID: rewrite only weak bullets
   ──────────────────────────────────────────────────────────────────── */
router.post('/tailor', async (req, res) => {
  try {
    const { experience, skills, jobDescription } = req.body;
    if (!experience || !jobDescription) {
      return res.status(400).json({ error: 'experience and jobDescription are required' });
    }

    // Check cache first
    const cacheKey = hashKey({ route: 'tailor-v2', experience, skills, jobDescription });
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const jdLower = jobDescription.toLowerCase();

    // ── Step 1: Extract JD keywords using our taxonomy ──
    const jdKeywords = Object.keys(TAXONOMY).filter(kw => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-z0-9])(${escaped})([^a-z0-9]|$)`, 'i');
      return regex.test(jdLower);
    });

    // ── Step 2: Score each bullet — does it already contain JD keywords? ──
    const analyzedExperience = experience.map((role, roleIdx) => {
      const bulletAnalysis = (role.bullets || []).map((bullet, bulletIdx) => {
        const bulletLower = bullet.toLowerCase();
        const matchedKws = jdKeywords.filter(kw => {
          const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(^|[^a-z0-9])(${escaped})([^a-z0-9]|$)`, 'i');
          return regex.test(bulletLower);
        });
        return {
          roleIdx,
          bulletIdx,
          text: bullet,
          matchCount: matchedKws.length,
          needsRewrite: matchedKws.length < 2, // weak if fewer than 2 JD keywords
        };
      });
      return { role, bulletAnalysis };
    });

    // ── Step 3: Collect only weak bullets for Gemini ──
    const weakBullets = [];
    analyzedExperience.forEach(({ role, bulletAnalysis }) => {
      bulletAnalysis.forEach(ba => {
        if (ba.needsRewrite) {
          weakBullets.push({
            roleTitle: role.title,
            company: role.company,
            originalBullet: ba.text,
            roleIdx: ba.roleIdx,
            bulletIdx: ba.bulletIdx,
          });
        }
      });
    });

    let rewrittenMap = {}; // key: "roleIdx-bulletIdx" → rewritten text

    if (weakBullets.length > 0) {
      // ── Step 4: Send ONLY weak bullets to Gemini (minimal tokens!) ──
      const ai = getGemini();

      const bulletList = weakBullets.map((wb, i) =>
        `[${i}] Role: "${wb.roleTitle}" at "${wb.company}" → "${wb.originalBullet}"`
      ).join('\n');

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

Return ONLY a raw JSON array of rewritten strings, in the same order as the input. No markdown, no explanation.
Example: ["Rewritten bullet 1", "Rewritten bullet 2"]`;

      const result = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        }),
        45_000 // slightly longer timeout for safety
      );

      let rewritten;
      try {
        rewritten = safeParseJson(result.text);
        if (!Array.isArray(rewritten)) {
          rewritten = Object.values(rewritten).flat();
        }
      } catch {
        // If AI fails, fall back to original bullets
        rewritten = weakBullets.map(wb => wb.originalBullet);
      }

      // Map rewritten bullets back to their positions
      weakBullets.forEach((wb, i) => {
        if (rewritten[i] && typeof rewritten[i] === 'string') {
          rewrittenMap[`${wb.roleIdx}-${wb.bulletIdx}`] = rewritten[i];
        }
      });
    }

    // ── Step 5: Merge — keep strong bullets as-is, swap in rewritten weak ones ──
    const finalExperience = experience.map((role, roleIdx) => ({
      ...role,
      bullets: (role.bullets || []).map((bullet, bulletIdx) => {
        const key = `${roleIdx}-${bulletIdx}`;
        return rewrittenMap[key] || bullet; // use rewritten if available, else keep original
      }),
    }));

    // ── Step 6: Organize skills locally using TAXONOMY (no Gemini needed!) ──
    let finalSkills = null;
    if (skills) {
      const parsedCategories = {
        'Languages': [],
        'Frameworks & Libraries': [],
        'Tools & Platforms': [],
        'Concepts': []
      };

      // Parse existing skills
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

      // We no longer automatically inject jdKeywords here.
      // Injection is strictly handled by the /organize-skills (Smart Inject) route.

      const newTechnical = [];
      for (const [cat, items] of Object.entries(parsedCategories)) {
        if (items.length > 0) {
          newTechnical.push(`${cat}: ${items.join(', ')}`);
        }
      }

      finalSkills = { technical: newTechnical };
    }

    const response = { success: true, data: finalExperience };
    if (finalSkills) response.skills = finalSkills;

    // Cache the successful response
    cache.set(cacheKey, response);

    res.json(response);
  } catch (err) {
    console.error('tailor error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


/* ────────────────────────────────────────────────────────────────────
   POST /api/ai/ats-score   — keyword match algorithm
   ──────────────────────────────────────────────────────────────────── */
router.post('/ats-score', async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData || !jobDescription) {
      return res.status(400).json({ error: 'resumeData and jobDescription are required' });
    }

    // Build searchable resume text
    const resumeText = [
      resumeData.personal?.fullName || '',
      resumeData.personal?.summary || '',
      ...(resumeData.experience || []).flatMap((e) => [
        e.title || '', e.company || '', ...(e.bullets || []),
      ]),
      ...(resumeData.skills?.technical || []),
      ...(resumeData.skills?.soft || []),
      ...(resumeData.skills?.languages || []),
      ...(resumeData.skills?.certifications || []),
      ...(resumeData.education || []).flatMap((e) => [
        e.degree || '', e.field || '', e.institution || '',
      ]),
    ]
      .join(' ')
      .toLowerCase();

    const jdLower = jobDescription.toLowerCase();

    // Extract legitimate tech keywords from the JD using our taxonomy
    const allTerms = Object.keys(TAXONOMY).filter(kw => {
      // Escape for regex, except for special cases if needed.
      const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Use word boundaries. For things ending in ++ or #, \b might fail.
      // A safe boundary check is either start of string/whitespace, or word boundary.
      const regex = new RegExp(`(^|[^a-z0-9])(${escapedKw})([^a-z0-9]|$)`, 'i');
      return regex.test(jdLower);
    });

    const matched = allTerms.filter(kw => {
      const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-z0-9])(${escapedKw})([^a-z0-9]|$)`, 'i');
      return regex.test(resumeText);
    });

    const missing = allTerms.filter(kw => !matched.includes(kw));

    // ── AUTHENTIC ATS SCORING ALGORITHM ──
    
    // 1. Keyword Match Rate (Base Score) - 50 points
    // Did they have the keywords anywhere in the resume?
    const keywordScore = allTerms.length > 0 ? (matched.length / allTerms.length) * 50 : 50;

    // 2. Contextual Keyword Match (Experience Bullets) - 20 points
    // Real ATS systems weight keywords found in work experience heavier than a dumped skills list.
    const allBullets = (resumeData.experience || []).flatMap((e) => e.bullets || []);
    const bulletsText = allBullets.join(' ').toLowerCase();
    
    const contextualMatched = matched.filter(kw => {
      const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-z0-9])(${escapedKw})([^a-z0-9]|$)`, 'i');
      return regex.test(bulletsText);
    });
    // If they matched keywords, how many were actually used in context?
    const contextualScore = matched.length > 0 ? (contextualMatched.length / matched.length) * 20 : 0;
    const finalContextualScore = allTerms.length === 0 ? 20 : contextualScore;

    // 3. Measurable Metrics - 15 points
    // Real resumes need quantifiable achievements (%, $, 10x, etc.)
    const metricsRegex = /\b(\d+%|\d+x|\$\d+|\d+\+?)\b|\d{2,}/i;
    const bulletsWithMetrics = allBullets.filter(b => metricsRegex.test(b)).length;
    // Ideally, at least 30% of bullets should contain some metric
    const metricsRatio = allBullets.length > 0 ? (bulletsWithMetrics / allBullets.length) : 0;
    const metricsScore = allBullets.length > 0 ? Math.min(15, (metricsRatio / 0.3) * 15) : 0;

    // 4. Action Verbs & Length Density - 15 points
    // Checks for strong action-oriented language and sufficient content length
    const actionVerbs = ['led', 'managed', 'developed', 'created', 'designed', 'improved', 'increased', 'reduced', 'implemented', 'built', 'architected', 'delivered', 'spearheaded', 'orchestrated', 'optimized', 'engineered'];
    const verbsFound = actionVerbs.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(bulletsText)).length;
    // Ideally find at least 5 different strong action verbs across the resume
    const verbsScore = Math.min(10, (verbsFound / 5) * 10);
    
    const wordCount = resumeText.split(/\s+/).length;
    // Ideal length is 250+ words to not trigger a "thin content" penalty
    const lengthScore = Math.min(5, (wordCount / 250) * 5);
    const finalVerbsScore = verbsScore + lengthScore;

    // Final Calculation
    const rawScore = keywordScore + finalContextualScore + metricsScore + finalVerbsScore;
    const finalScore = Math.min(99, Math.max(15, Math.round(rawScore)));

    // ── ACTIONABLE IMPROVEMENTS ──
    const improvements = [];
    if (finalScore < 90) {
      if (metricsScore < 10) {
        improvements.push("Add quantifiable metrics (%, $, numbers) to your experience bullets to prove your impact.");
      }
      if (finalContextualScore < 15 && matched.length > 0) {
        improvements.push("Weave your matched keywords naturally into your experience bullets, rather than just listing them in the Skills section.");
      }
      if (verbsScore < 8) {
        improvements.push("Start more of your bullet points with strong action verbs (e.g., Led, Architected, Engineered).");
      }
      if (lengthScore < 4) {
        improvements.push("Your resume is a bit short. Add more detail to aim for at least 250 words.");
      }
    }

    res.json({
      success: true,
      score: finalScore,
      matched: matched.length,
      total: allTerms.length,
      missingKeywords: missing,
      improvements: improvements
    });
  } catch (err) {
    console.error('ats-score error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ────────────────────────────────────────────────────────────────────
   POST /api/ai/organize-skills   — Manual Keyword Injection
   ──────────────────────────────────────────────────────────────────── */
router.post('/organize-skills', async (req, res) => {
  try {
    const { currentSkills, missingKeywords } = req.body;
    if (!currentSkills || !missingKeywords) {
      return res.status(400).json({ error: 'currentSkills and missingKeywords are required' });
    }

    const parsedCategories = {
      'Languages': [],
      'Frameworks & Libraries': [],
      'Tools & Platforms': [],
      'Concepts': []
    };

    // 1. Parse user's existing technical skills
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

    // 2. Inject missing keywords from Job Description
    if (Array.isArray(missingKeywords)) {
      missingKeywords.forEach(keyword => {
        const lowerKw = keyword.toLowerCase().trim();
        const targetCategory = TAXONOMY[lowerKw];
        
        if (targetCategory) {
          // If we found a valid tech term in our dictionary, inject it!
          if (!parsedCategories[targetCategory].some(existing => existing.toLowerCase() === lowerKw)) {
            // Capitalize properly using the original keyword, or fallback
            parsedCategories[targetCategory].push(keyword);
          }
        }
      });
    }

    // 3. Rebuild the final array
    const newTechnical = [];
    for (const [cat, items] of Object.entries(parsedCategories)) {
      if (items.length > 0) {
        newTechnical.push(`${cat}: ${items.join(', ')}`);
      }
    }

    res.json({ success: true, technical: newTechnical });
  } catch (err) {
    console.error('organize-skills error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
