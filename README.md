# ResumeIntel AI — The Complete AI Job-Search Toolkit

> **From resume to offer-ready in four steps.** Upload your resume, score it against any job description, tailor every bullet with AI, generate a cover letter, prep for interviews, and download a pixel-perfect PDF — no account required.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google)](https://aistudio.google.com/)

---

## ✨ Features

### ⚡ Instant Tools — No AI Quota Consumed

| Feature | Description |
|---|---|
| **ATS Compatibility Score** | Weighted 0–100 score across keyword match (50 pts), contextual bullet placement (20 pts), quantified metrics (15 pts), and action verb quality (15 pts). Auto-rescores with a 1 s debounce as you edit. |
| **Keyword Breakdown** | Every JD keyword categorised — Languages · Frameworks & Libraries · Tools & Platforms · Concepts — each with a plain-English explanation of why it matters to recruiters. Zero AI calls. |
| **AI Diff Preview** | Side-by-side before/after view for every AI-tailored bullet. Accept all, reject all, or cherry-pick and edit individual changes before committing to your resume. |
| **Version History** | Auto-snapshots saved to MongoDB on every PDF/DOC export. Browse a timestamped timeline, label key versions (e.g. "Before AI tailor"), and restore any snapshot in one click. Capped at 20 versions per resume. |
| **Smart Skill Inject** | One-click injection of missing JD keywords into your Skills section, automatically categorised by the built-in tech taxonomy (100+ terms). |
| **6 Resume Templates** | Classic · Modern · Minimal · Executive · Tech · Compact — live preview, instant switching via the template shuffler FAB, all ATS-safe with print-optimised layouts. |
| **Dual Export** | Download as **PDF** (browser print engine — crisp vector text, selectable content) or **DOCX** for every template. |
| **Auto-Save** | All edits debounced 500 ms and persisted to `localStorage`. No auth required. |

### 🤖 AI-Powered Features — Google Gemini

| Feature | Description |
|---|---|
| **AI Resume Parser** | Upload any PDF or DOCX (≤ 10 MB). Pre-processes raw text (normalises bullets, deduplicates lines, strips control chars) before sending to Gemini. Handles multi-column layouts, 6+ section-heading aliases per section, international phone formats, and cleanly separates projects from work experience. |
| **AI Tailor Engine** | Paste a JD → AI identifies weak bullets (< 2 keyword matches) and rewrites only those, naturally incorporating JD keywords while preserving your authentic voice and real achievements. |
| **AI Recruiter Review** | Qualitative feedback from a simulated senior recruiter: overall verdict + 1–10 score, section-by-section grades (Summary · Experience · Impact · ATS Readiness), green flags, red flags, and a single top-priority action to take today. On-demand only — never auto-fires. |
| **Cover Letter Generator** | One click produces a JD-tailored cover letter in your chosen tone (Professional · Enthusiastic · Concise). Includes a suggested email subject line and the 3 key selling points emphasised. Edit inline, copy, or download as `.txt`. |
| **Interview Question Generator** | Role-specific question bank: Behavioral (with STAR starters + why interviewers ask it), Technical (with difficulty rating + key concepts to cover), Role-Specific, and 4 smart questions to ask your interviewer. |
| **Find Jobs** | Integrated job search (SerpApi) with popular role suggestions, 5 graceful error states, and server-side LRU caching. |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))
- **Google Gemini API key** — [Get one free](https://aistudio.google.com/app/apikey)
- *(Optional)* **SerpApi key** — for the Find Jobs feature ([serpapi.com](https://serpapi.com))

### 1. Clone & Install

```bash
git clone https://github.com/Aayush-1124/resume-intel-ai.git
cd resume-intel

# Install all dependencies (root + server + client)
npm run install:all
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
SERP_API_KEY=YOUR_SERPAPI_KEY        # optional — needed for Find Jobs
FRONTEND_URL=http://localhost:5173
```

> **⚠️ SRV DNS Issue?** Some ISPs block SRV DNS lookups. If you see `querySrv ECONNREFUSED`:
> - In MongoDB Atlas → **Connect** → **Drivers** → copy the non-SRV connection string, or
> - Switch your DNS to `8.8.8.8` (Google) / `1.1.1.1` (Cloudflare)

### 3. Run Development Servers

```bash
# Starts backend (:5000) and frontend (:5173) concurrently
npm run dev
```

Open **http://localhost:5173**

---

## ☁️ Deployment (Render + Vercel)

### Backend → Render

1. Push to GitHub
2. New **Web Service** on [Render](https://render.com) — Root: `server`, Build: `npm install`, Start: `npm start`
3. Add env vars: `MONGODB_URI`, `GEMINI_API_KEY`, `SERP_API_KEY`, `FRONTEND_URL` (your Vercel URL)

### Frontend → Vercel

1. Import repo on [Vercel](https://vercel.com), set Root Directory to `client`
2. Add env var:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
3. Deploy — auto-builds on every push

### Keep the Server Warm (Free Tier)

Render free-tier services spin down after 15 min of inactivity (~30 s cold start). Prevent it:

1. [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) — both free
2. Point to: `https://your-backend.onrender.com/api/health`
3. Interval: **every 14 minutes**

---

## 🏗️ Architecture

```
resume-intel/
├── server/                              # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── index.js                     # Express entry, CORS, MongoDB connect
│   │   ├── models/
│   │   │   └── Resume.js                # Mongoose schema — resume + versions[]
│   │   ├── routes/
│   │   │   ├── ai.js                    # 8 AI/analysis endpoints (see API ref)
│   │   │   ├── resume.js                # 6 resume + version-history endpoints
│   │   │   └── jobs.js                  # SerpApi job search + LRU cache
│   │   ├── middleware/
│   │   │   ├── errorHandler.js          # Centralised structured error responses
│   │   │   ├── validate.js              # Zod request validation middleware
│   │   │   └── rateLimiter.js           # 3-tier in-memory rate limiter (no deps)
│   │   └── utils/
│   │       ├── cache.js                 # LRU cache — per-entry TTL, max 200 entries
│   │       ├── inflightCache.js         # In-flight request deduplication
│   │       ├── logger.js                # Pino structured logger
│   │       └── fetchWithRetry.js        # Exponential backoff retry (1 s → 2 s → 4 s)
│   ├── .env.example
│   └── package.json
│
└── client/                              # React 18 + Vite + Tailwind CSS
    ├── index.html
    ├── tailwind.config.js               # Design token → Tailwind colour mapping
    └── src/
        ├── App.jsx                      # Root router + theme + localStorage + lazy pages
        ├── index.css                    # Material 3-inspired design tokens (dark + light)
        ├── pages/
        │   ├── LandingPage.jsx          # Hero, upload zone, stats, feature grids, CTA
        │   ├── DashboardPage.jsx        # 3-panel editor (sidebar + form + preview)
        │   └── JobsPage.jsx             # Integrated job search
        ├── components/
        │   ├── Navbar.jsx               # Responsive nav + mobile hamburger + theme toggle
        │   ├── FormSidebar.jsx          # Step progress + download + version history (CSS-only active state)
        │   ├── ResumePreview.jsx        # 6 live template renderers (memo-ised, print-safe)
        │   ├── ATSScoreWidget.jsx       # Animated SVG ring score overlay (memo-ised)
        │   ├── TemplateShuffler.jsx     # Floating template switcher FAB
        │   ├── TemplateModal.jsx        # Full template selection modal
        │   ├── DiffPreview.jsx          # Per-bullet AI diff accept/reject UI (lazy-loaded)
        │   ├── KeywordBreakdownPanel.jsx # Categorised keyword analysis (no AI)
        │   ├── RecruiterReviewPanel.jsx  # AI recruiter feedback panel (on-demand)
        │   ├── CoverLetterModal.jsx      # AI cover letter generator + editor (lazy-loaded)
        │   ├── InterviewQuestionsModal.jsx # AI interview question bank (lazy-loaded)
        │   ├── VersionHistoryPanel.jsx   # Timeline browser + restore (lazy-loaded)
        │   ├── JobSuccessModal.jsx       # Post-download job search prompt (lazy-loaded)
        │   ├── ToastContainer.jsx        # Global toasts with Retry button
        │   ├── ErrorBoundary.jsx         # Per-page React error boundary
        │   └── form-steps/
        │       ├── PersonalForm.jsx      # sanitizeUrl for links, sanitizeTextarea for summary
        │       ├── ExperienceForm.jsx
        │       ├── ProjectsForm.jsx      # sanitizeUrl on project link field
        │       ├── EducationForm.jsx     # sanitizeTextarea on achievements field
        │       ├── SkillsForm.jsx
        │       └── AIOptimizerForm.jsx  # Tabbed: ATS Optimizer · Keywords · Review
        ├── hooks/
        │   ├── useLocalStorage.js       # Debounced localStorage persistence
        │   └── useTheme.js              # System theme detection + toggle
        └── utils/
            ├── api.js                   # Typed API helper — all 14 client methods
            ├── apiClient.js             # Fetch wrapper — every error → friendly message
            ├── docxExport.js            # DOCX export utility
            └── validation.js            # Sanitizers + form validators
```

---

## 🔌 API Reference

### AI Routes (`/api/ai`)

| Method | Endpoint | Rate Limit | Description | AI? |
|---|---|---|---|---|
| `POST` | `/api/ai/parse-doc` | 10/min | Upload PDF/DOCX (≤ 10 MB) → structured resume JSON. Results cached 24 h by content fingerprint. | ✅ Gemini |
| `POST` | `/api/ai/tailor` | 20/min | `{ experience, skills, jobDescription }` → tailored bullets. Only weak bullets sent to Gemini. | ✅ Partial |
| `POST` | `/api/ai/ats-score` | 60/min | `{ resumeData, jobDescription }` → weighted score 0–100 + missing keywords | ❌ Local |
| `POST` | `/api/ai/organize-skills` | 60/min | `{ currentSkills, missingKeywords }` → categorised skills injection | ❌ Local |
| `POST` | `/api/ai/keyword-explain` | 60/min | `{ resumeData, jobDescription }` → matched/missing keywords with category + why | ❌ Local |
| `POST` | `/api/ai/recruiter-review` | 20/min | `{ resumeData, jobDescription? }` → qualitative recruiter-style feedback. Cached 1 h. | ✅ Gemini |
| `POST` | `/api/ai/cover-letter` | 20/min | `{ resumeData, jobDescription, tone }` → subject + body + highlights. Cached 1 h. | ✅ Gemini |
| `POST` | `/api/ai/interview-questions` | 20/min | `{ resumeData, jobDescription }` → behavioral + technical + role Q&A bank. Cached 1 h. | ✅ Gemini |

> **Rate limits** are per IP, per 60-second sliding window. Exceeded requests return `429` with `Retry-After` and `X-RateLimit-*` headers.

### Resume Routes (`/api/resumes`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/resumes/:localId` | Fetch saved resume |
| `POST` | `/api/resumes/save` | Upsert resume by localId + push version snapshot |
| `GET` | `/api/resumes/:localId/versions` | List version summaries (newest first, no snapshots) |
| `GET` | `/api/resumes/:localId/versions/:versionId` | Fetch full version snapshot for restore |
| `PATCH` | `/api/resumes/:localId/versions/:versionId/label` | Rename a version label |
| `DELETE` | `/api/resumes/:localId` | Delete resume + all versions |

### Job Routes (`/api/jobs`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs?query=role&location=city` | SerpApi job search with server-side LRU cache |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | `{ status: "ok", timestamp }` — used by keep-alive pings |

---

## 🎨 Error Handling

Every error — network, server, AI quota — maps to a human-readable message. Users **never see raw HTTP codes**.

| Status / Code | User-Facing Message |
|---|---|
| 429 / `RATE_LIMIT_EXCEEDED` | 🚦 "Too many requests — please wait a moment and try again" |
| 429 / `RESOURCE_EXHAUSTED` | 🚦 "AI quota reached — wait 60 s and retry. ATS scoring and keywords never consume quota." |
| 500 / `INTERNAL_SERVER_ERROR` | 🛠️ "Server error — we're on it, your data is safe" |
| 502 / 503 / 504 | 🚧 "Server under heavy traffic — try again shortly" |
| AI timeout | ⏱️ "AI is taking too long — try again shortly" |
| Offline | 📡 "No internet connection — check your network" |
| Network failure | 🌐 "Can't reach the server — possibly heavy traffic" |

Retryable errors show a **"Try Again"** button inside the toast.

---

## 🎨 Design System — "Digital Architect"

Material 3-inspired token system with full dual-theme support and smooth transitions.

| Token | Dark | Light |
|---|---|---|
| `--background` | `#090f1e` | `#f4f6fb` |
| `--primary` | `#a5a2ff` (Lavender) | `#3829d0` (Indigo) |
| `--primary-container` | `#4f46e5` | `#4f46e5` |
| `--on-primary` | `#ffffff` | `#ffffff` |
| `--tertiary` | `#3dd9a0` (Mint) | `#00553a` (Forest) |
| `--surface-container` | `#162030` | `#e8eaf2` |
| `--on-surface` | `#e2e8ff` | `#14181f` |

**Principles:**
- **Glassmorphism** — floating panels use `backdrop-filter: blur` + semi-transparent backgrounds
- **ATS-safe fonts** — all templates use `Arial / Calibri / Helvetica Neue`
- **Print-safe layouts** — multi-column templates use `display: table` for reliable page-breaks
- **Spring animations** — Framer Motion (`stiffness: 300, damping: 30`)
- **Accessibility** — `aria-live`, `role="alert"`, `aria-pressed`, `aria-label` on all interactive elements
- **High-contrast buttons** — `--on-primary: #ffffff` ensures readable text on all gradient buttons in both themes
- **44 px touch targets** — all interactive elements meet mobile accessibility minimum on small screens

**CSS utilities:**
- `.skeleton` — shimmer loading placeholder
- `.fade-in` — entrance animation for lazily mounted panels
- `.step-active` — responsive sidebar active indicator (CSS-only, no `window.innerWidth`)
- `.focus-ring` — keyboard navigation highlight

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 + custom CSS design tokens |
| Animation | Framer Motion |
| Icons | Lucide React |
| Backend | Node.js 18 + Express.js |
| Database | MongoDB Atlas + Mongoose |
| AI Engine | Google Gemini 2.5 Flash (`@google/genai`) |
| Document Parsing | `mammoth` (DOCX) + `pdf-parse` (PDF) |
| PDF Export | `react-to-print` (browser print engine) |
| DOCX Export | `docx` npm package |
| Job Search | SerpApi |
| Logging | Pino (structured JSON) |
| Validation | Zod (server-side) + custom sanitizers (client-side) |
| State Persistence | `localStorage` (client) + MongoDB (server) |

---

## ⚡ Performance

| Optimisation | Detail |
|---|---|
| **Code splitting** | `React.lazy` for pages + 5 heavy panels (`DiffPreview`, `JobSuccessModal`, `VersionHistoryPanel`, `CoverLetterModal`, `InterviewQuestionsModal`) — none loaded until opened |
| **Component memoisation** | `ResumePreview` and `ATSScoreWidget` wrapped in `React.memo` — skip re-renders when unrelated state changes |
| **Stable callbacks** | All event handlers in `DashboardPage` wrapped in `useCallback` — prevent child re-renders on every parent update |
| **Debounced ATS scorer** | 1 s debounce + content-only fingerprint — compares only resume fields, not metadata, so storing the ATS score back doesn't trigger a second API call |
| **Debounced saves** | `localStorage` writes debounced 500 ms |
| **Per-route cache TTLs** | `parse-doc: 24 h` · AI endpoints `1 h` · `ats-score: 10 min` — was a flat 5 min for every endpoint |
| **Parse-doc caching** | Same resume file cached 24 h by content fingerprint (length + head + tail) — repeat uploads never hit Gemini |
| **Normalised cache keys** | JD whitespace collapsed before hashing — minor copy-paste differences don't create cache misses |
| **In-flight deduplication** | `withInflight()` — simultaneous requests with the same key share one Gemini call instead of firing duplicates |
| **Hybrid AI tailor** | Only weak bullets (< 2 keyword matches) sent to Gemini — 50–70% fewer tokens per tailor call |
| **Granular error boundaries** | Per-page `ErrorBoundary` — one crash can't take down the whole app |
| **Non-blocking version saves** | Version snapshots saved async after export — never blocks the download |

---

## 🔒 Security

- **No auth required** — a UUID `localId` in `localStorage` identifies each session
- **API keys server-side only** — Gemini and SerpApi keys never reach the client
- **CORS** — only `localhost:*`, `*.vercel.app`, and `FRONTEND_URL` are allowed
- **File limits** — PDF/DOCX uploads hard-capped at 10 MB server-side (Multer)
- **Structured errors** — server never leaks stack traces to the client
- **Input validation** — all request bodies validated with Zod before processing
- **Input sanitization** — client-side sanitizers strip HTML tags and the three HTML-breaking characters (`<`, `>`, backtick) while preserving apostrophes and quotes in real names and sentences
- **URL sanitization** — `sanitizeUrl` blocks `javascript:`, `data:`, and `vbscript:` scheme injection on all URL-type fields (website, LinkedIn, project links)
- **URL validation** — `validatePersonal` rejects malformed website and LinkedIn URLs before form submission
- **Rate limiting** — three-tier in-memory limiter (no external dep): heavy AI 20/min · parse 10/min · light endpoints 60/min per IP. Returns standard `X-RateLimit-*` + `Retry-After` headers.
- **`.env` gitignored** — only `.env.example` is committed

---

## 🗺️ Roadmap

**Shipped ✅**
- [x] PDF/DOCX parsing — multi-column, deduplication, 6+ section-heading aliases, international phone formats
- [x] PDF pre-processing — bullet normalisation, control-char stripping, adjacent-line deduplication
- [x] 6 resume templates with live preview + shuffler FAB
- [x] AI tailor with per-bullet diff preview (accept / reject / edit)
- [x] ATS scoring — weighted 4-factor algorithm, debounced auto-score (content-only fingerprint)
- [x] Smart Skill Inject — one-click keyword injection via built-in taxonomy
- [x] **Keyword Breakdown** — categorised keyword analysis with recruiter context (no AI)
- [x] **Version History** — auto-snapshot on export, timeline UI, restore in one click
- [x] **AI Recruiter Review** — qualitative section grades + green/red flags + top priority (on-demand)
- [x] **Cover Letter Generator** — JD-tailored, 3 tones, inline editor, copy + download
- [x] **Interview Question Generator** — behavioral + technical + role-specific + questions to ask
- [x] Job search with 5 graceful error states
- [x] Dual export — PDF + DOCX for every template
- [x] Friendly error system — no raw HTTP codes, Retry buttons
- [x] Dark / Light theme + system preference detection
- [x] Fully responsive — CSS-only active states, 44 px touch targets, mobile Editor/Preview switcher
- [x] Code splitting (React.lazy) + component memoisation + stable callbacks
- [x] Per-route cache TTLs + parse-doc caching + in-flight deduplication
- [x] Three-tier rate limiting (heavy · parse · light) with standard headers
- [x] Input sanitization — HTML-safe sanitizers preserving real punctuation; URL scheme injection blocked
- [x] Granular error boundaries

**Planned 🔜**
- [ ] Authentication (Clerk or NextAuth) + per-user resume storage
- [ ] LinkedIn profile import
- [ ] Multi-resume management per account
- [ ] Resume score history chart (track improvement over time)
- [ ] Collaborative editing / share-a-resume-link

---

## 🐛 Known Issues & Workarounds

| Issue | Workaround |
|---|---|
| Render backend cold start (~30 s) | Use a keep-alive ping service (see [Keep the Server Warm](#keep-the-server-warm-free-tier)) |
| Scanned PDFs return empty data | Use a text-based PDF; scanned image-PDFs are not yet supported |
| MongoDB SRV DNS blocked | Use direct connection string or switch DNS to `8.8.8.8` |
| Gemini quota exceeded | Free tier has per-minute limits — wait 60 s and retry. Keyword Breakdown and ATS Scoring never consume quota. |

---

*Built with ❤️ by [Aayush](https://github.com/Aayush-1124) ·
