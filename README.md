# ResumeIntel AI — Production-Ready AI Resume Builder

> **Surgical Precision for your Career Path.** Upload your resume, tailor it to any job description with AI, and download a pixel-perfect, ATS-optimised PDF or DOCX — in seconds.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google)](https://aistudio.google.com/)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Universal File Parser** | Upload any resume — PDF or DOCX, up to **10 MB**. Every file type is parsed accurately via Gemini AI. |
| **6 Resume Templates** | Classic, Modern, Minimal, Executive, Tech (Impact), Compact — live preview, instant switching, template shuffler FAB |
| **Multi-Step Form Editor** | 6-step editor — Personal · Experience · Projects · Education · Skills · AI Optimizer |
| **AI Tailor Engine** | Paste a job description → AI rewrites weak bullets to match JD keywords (hybrid approach: 50–70% fewer tokens) |
| **ATS Scorer (Debounced)** | 0–100% weighted ATS score + missing keyword list + actionable remarks. Auto-rescores with a 1-second debounce to avoid API spam |
| **Smart Skill Inject** | One-click injection of missing JD keywords into Skills using a built-in tech taxonomy |
| **Diff Preview** | Inline accept/reject individual AI-tailored bullets before committing |
| **Dual Export** | Download your resume as **PDF** (print engine) or **DOCX** for every template |
| **Find Jobs + Match Resume** | Integrated job search (SerpApi) with 5 smart error states (offline, rate limit, 404, 500, no results) and popular role suggestions |
| **Friendly Error System** | Every API error (404, 429, 500, 502, 503, 505) shows a human-readable popup with a Retry button — no raw codes ever shown |
| **Dark / Light Theme** | Full dual-theme with system preference detection and smooth transitions |
| **Auto-Save** | All edits debounced 500ms and persisted to `localStorage` — no auth required |
| **Code-Split Pages** | LandingPage, DashboardPage, JobsPage are lazily loaded (React.lazy + Suspense) — faster initial load |
| **Granular Error Boundaries** | Each page wrapped in its own ErrorBoundary — one crash can't take down the whole app |
| **Fully Responsive** | Mobile-first layout with Editor / Preview tab switcher on small screens |

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

> **⚠️ SRV DNS Issue?** Some ISPs (especially in India) block SRV DNS lookups. If you see `querySrv ECONNREFUSED`:
> 1. In MongoDB Atlas → **Connect** → **Drivers** → copy the non-SRV connection string
> 2. Or switch your DNS to `8.8.8.8` (Google) / `1.1.1.1` (Cloudflare)

### 3. Run Development Servers

```bash
# Starts backend (:5000) and frontend (:5173) concurrently
npm run dev
```

Then open **http://localhost:5173**

---

## ☁️ Deployment (Render + Vercel)

### Backend → Render

1. Push to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set **Root Directory** to `server`, **Build Command** to `npm install`, **Start Command** to `npm start`
4. Add environment variables: `MONGODB_URI`, `GEMINI_API_KEY`, `SERP_API_KEY`, `FRONTEND_URL` (your Vercel URL)

### Frontend → Vercel

1. Import your GitHub repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `client`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
4. Deploy — Vercel auto-builds on every push

### Keep the Server Warm (Free Tier)

Render free-tier services spin down after 15 minutes of inactivity. The first request after spin-down takes ~30 seconds. To prevent this:

1. Go to [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) (both free)
2. Add a new monitor/cron pointing to:
   ```
   https://your-backend.onrender.com/api/health
   ```
3. Set interval to **every 14 minutes** — keeps the server always warm with zero code changes

---

## 🏗️ Architecture

```
resume-intel/
├── server/                          # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── index.js                 # Express entry, CORS, MongoDB connect, errorHandler
│   │   ├── models/
│   │   │   └── Resume.js            # Mongoose resume schema
│   │   ├── routes/
│   │   │   ├── ai.js                # /api/ai — parse, tailor, ATS score, skills
│   │   │   ├── resume.js            # /api/resumes — CRUD
│   │   │   └── jobs.js              # /api/jobs — SerpApi job search + LRU cache
│   │   ├── middleware/
│   │   │   ├── errorHandler.js      # Centralised structured error responses
│   │   │   └── validate.js          # Zod request validation middleware
│   │   └── utils/
│   │       ├── cache.js             # LRU in-memory cache with TTL
│   │       ├── logger.js            # Pino structured logger
│   │       └── fetchWithRetry.js    # Exponential backoff retry helper
│   ├── .env.example
│   └── package.json
│
└── client/                          # React 18 + Vite + Tailwind CSS
    ├── index.html                   # Entry HTML with SEO meta tags
    ├── vite.config.js               # Vite config with manual chunk splitting
    ├── tailwind.config.js           # Design token mapping
    └── src/
        ├── App.jsx                  # Root router + theme + localStorage + lazy pages
        ├── main.jsx                 # ReactDOM entry + global ErrorBoundary
        ├── index.css                # Design system tokens + utilities
        ├── pages/
        │   ├── LandingPage.jsx      # Hero, file upload, feature bento grid
        │   ├── DashboardPage.jsx    # 3-panel editor (nav + form + preview)
        │   └── JobsPage.jsx         # Integrated job search with 5 error states
        ├── components/
        │   ├── Navbar.jsx           # Responsive top nav + theme toggle
        │   ├── FormSidebar.jsx      # Step progress + PDF/DOCX download buttons
        │   ├── ResumePreview.jsx    # 6 live template renderers (print-safe)
        │   ├── ATSScoreWidget.jsx   # Animated SVG ring score widget
        │   ├── TemplateShuffler.jsx # Floating template switcher FAB
        │   ├── TemplateModal.jsx    # Full template selection modal
        │   ├── DiffPreview.jsx      # Per-bullet AI diff accept/reject UI
        │   ├── templateThumbnails.jsx # SVG micro-previews for each template
        │   ├── JobSuccessModal.jsx  # Post-download job search prompt
        │   ├── ToastContainer.jsx   # Global toasts (with Retry button + aria-live)
        │   ├── ErrorBoundary.jsx    # Per-page React error boundary
        │   └── form-steps/
        │       ├── PersonalForm.jsx
        │       ├── ExperienceForm.jsx
        │       ├── ProjectsForm.jsx
        │       ├── EducationForm.jsx
        │       ├── SkillsForm.jsx
        │       └── AIOptimizerForm.jsx   # Debounced ATS auto-scorer
        ├── hooks/
        │   ├── useLocalStorage.js   # Debounced localStorage persistence
        │   └── useTheme.js          # System theme detection + toggle
        └── utils/
            ├── api.js               # Typed API helper + default resume data
            ├── apiClient.js         # Fetch wrapper: maps every HTTP/error code → friendly message
            ├── docxExport.js        # DOCX export utility
            └── validation.js        # Form validation rules
```

---

## 🔌 API Reference

### AI Routes (`/api/ai`)

| Method | Endpoint | Description | AI? |
|---|---|---|---|
| `POST` | `/api/ai/parse-doc` | Upload PDF/DOCX (≤10 MB) → structured resume JSON | ✅ Gemini |
| `POST` | `/api/ai/tailor` | `{ experience, skills, jobDescription }` → tailored bullets | ✅ Partial |
| `POST` | `/api/ai/ats-score` | `{ resumeData, jobDescription }` → score 0–100 + missing keywords | ❌ Local |
| `POST` | `/api/ai/organize-skills` | `{ currentSkills, missingKeywords }` → injected skills | ❌ Local |

### Resume Routes (`/api/resumes`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/resumes/:localId` | Fetch saved resume |
| `POST` | `/api/resumes/save` | Upsert resume by localId |
| `DELETE` | `/api/resumes/:localId` | Delete resume |

### Job Routes (`/api/jobs`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs?q=role&location=city` | SerpApi job search with LRU cache |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns `{ status: "ok", timestamp }` — used by keep-alive pings |

---

## 🎨 Error Handling System

Every error — whether from the network, server, or AI quota — is mapped to a human-friendly message. Users **never see raw HTTP status codes**.

| Status / Code | User-Facing Message |
|---|---|
| 404 | 🔍 "Endpoint not found — this might be temporary, try again" |
| 429 / `RESOURCE_EXHAUSTED` | 🚦 "Rate limit reached — please wait a moment" |
| 500 / `INTERNAL_SERVER_ERROR` | 🛠️ "Server error — we're on it, your data is safe" |
| 502 / 503 / 504 | 🚧 "Server under heavy traffic — try again shortly" |
| 505 | 🔧 "Unsupported request — please refresh" |
| Offline | 📡 "No internet connection — check your network" |
| Network failure | 🌐 "Can't reach the server — possibly heavy traffic" |

Retryable errors show a **"Try Again"** button directly inside the toast notification.

---

## 🎨 Design System — "Digital Architect"

Built on a hand-crafted Material 3-inspired token system with full dual-theme:

| Token | Dark | Light |
|---|---|---|
| `--background` | `#0b1326` | `#f7f9fb` |
| `--primary` | `#c3c0ff` (Lavender) | `#3525cd` (Indigo) |
| `--primary-container` | `#4f46e5` | `#4f46e5` |
| `--surface-container` | `#171f33` | `#eceef0` |
| `--on-surface` | `#dae2fd` | `#191c1e` |

**Principles:**
- **Glassmorphism** — Floating panels use `backdrop-blur` + semi-transparent backgrounds
- **ATS-safe resume fonts** — All templates use `Arial / Calibri / Helvetica Neue`
- **Print-safe layouts** — Multi-column templates use `display: table` for reliable page-breaks
- **Spring animations** — Framer Motion with spring physics (`stiffness: 380, damping: 28`)
- **Accessibility** — `aria-live`, `role="alert"`, `aria-label` on all interactive elements

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
| AI Engine | Google Gemini (`@google/genai`) |
| Document Parsing | `mammoth` (DOCX) + `pdf-parse` (PDF) |
| PDF Export | `react-to-print` (browser print engine) |
| DOCX Export | `docx` npm package |
| Job Search | SerpApi |
| Logging | Pino (structured JSON logs) |
| State Persistence | `localStorage` (client) + MongoDB (server) |

---

## ⚡ Performance

| Optimization | Detail |
|---|---|
| **Code splitting** | React.lazy for 3 pages — only the Dashboard JS loads when user enters dashboard |
| **Vendor chunks** | `react/react-dom`, `framer-motion`, `lucide-react` in separate chunks |
| **Debounced ATS scorer** | 1-second debounce prevents API spam while typing |
| **Debounced saves** | localStorage writes debounced 500ms |
| **LRU server cache** | Job search and AI responses cached server-side with TTL |
| **Granular error boundaries** | Per-page boundaries — one crash can't take down the whole app |

---

## 🔒 Security Notes

- **No auth required** — a UUID `localId` in `localStorage` identifies each session
- **API key isolation** — Gemini and SerpApi keys are server-side only
- **CORS** — Only `localhost:*`, `*.vercel.app`, and `FRONTEND_URL` are allowed
- **File limits** — PDF/DOCX uploads capped at 10 MB server-side (Multer)
- **Structured errors** — Server never leaks stack traces to the client
- **`.env` gitignored** — only `.env.example` is committed

---

## 🗺️ Roadmap

- [x] PDF/DOCX parsing (all file types, up to 10 MB)
- [x] 6 resume templates with live preview + shuffler
- [x] AI tailor with diff preview (accept/reject per bullet)
- [x] ATS scoring + smart skill inject (debounced)
- [x] Job search with Match My Resume toggle
- [x] Dual export — PDF + DOCX for every template
- [x] Friendly error system (no raw HTTP codes shown)
- [x] Dark/Light theme + system preference detection
- [x] Responsive mobile layout
- [x] Code splitting (React.lazy) + granular error boundaries
- [ ] Authentication (Clerk or NextAuth)
- [ ] Multiple resume versions per user
- [ ] Cover letter generator
- [ ] LinkedIn profile import
- [ ] Resume version history

---

## 🐛 Known Issues & Workarounds

| Issue | Workaround |
|---|---|
| Render backend cold start (~30s) | Use a keep-alive ping service (see [Keep the Server Warm](#keep-the-server-warm-free-tier)) |
| Scanned PDFs return empty data | Use a text-based PDF; scanned image-PDFs are not yet supported |
| MongoDB SRV DNS blocked | Use direct connection string or switch DNS to `8.8.8.8` |

---

*Built with ❤️ by [Aayush](https://github.com/Aayush-1124) · Powered by Google Gemini AI*
