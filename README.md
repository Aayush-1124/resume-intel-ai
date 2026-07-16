# ResumeIntel AI — Production-Ready AI Resume Builder

> **Surgical Precision for your Career Path.** Upload your resume, tailor it to any job description with AI, and download a pixel-perfect, ATS-optimised PDF — in seconds.

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
| **PDF / DOCX Parser** | Upload any resume → Gemini AI extracts structured JSON (Personal, Experience, Projects, Education, Skills) |
| **6 Resume Templates** | Classic, Modern, Minimal, Executive, Tech (Impact), Compact — live preview with instant switching |
| **Multi-Step Form** | 6-step editor — Personal, Experience, Projects, Education, Skills, AI Optimizer |
| **AI Tailor Engine** | Paste a job description → AI rewrites only weak bullets to match JD keywords (50–70% fewer tokens via hybrid approach) |
| **ATS Scorer** | Weighted keyword-match gives a 0–100% ATS score + lists missing keywords + actionable remarks |
| **Smart Skill Inject** | One-click injection of missing JD keywords into Skills using a built-in tech taxonomy (zero AI calls) |
| **Diff Preview** | Inline accept/reject individual AI-tailored bullets before committing changes |
| **PDF Export** | Client-side `react-to-print` — vector text, selectable content, proper A4/Letter page sizing |
| **DOCX Export** | Download resume as a `.doc` file for Word editing |
| **Dark / Light Theme** | Full dual-theme with system preference detection and smooth transitions |
| **Auto-Save** | All edits debounced and persisted to `localStorage` — no auth needed |
| **Fully Responsive** | Mobile-first layout with Editor / Preview tab switcher on small screens |
| **Template Shuffler** | Floating shuffle button for instant random template switching |
| **Job Search** | Integrated job board powered by SerpApi |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))
- **Google Gemini API key** — [Get one free](https://aistudio.google.com/app/apikey)

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
4. Add environment variables: `MONGODB_URI`, `GEMINI_API_KEY`, `FRONTEND_URL` (your Vercel URL)

### Frontend → Vercel
1. Import your GitHub repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `client`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
4. Deploy — Vercel auto-builds on every push

> **Note:** Render free-tier services spin down after inactivity. The first request after spin-down may take ~30 seconds. Consider adding a keep-alive ping if needed.

---

## 🏗️ Architecture

```
resume-intel/
├── server/                          # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── index.js                 # Express entry, CORS, MongoDB connect
│   │   ├── models/
│   │   │   └── Resume.js            # Mongoose resume schema
│   │   ├── routes/
│   │   │   ├── ai.js                # /api/ai — parse, tailor, ATS score, skills
│   │   │   ├── resume.js            # /api/resumes — CRUD
│   │   │   └── jobs.js              # /api/jobs — SerpApi job search
│   │   ├── middleware/
│   │   │   └── errorHandler.js      # Structured error responses
│   │   └── utils/
│   │       └── cache.js             # LRU in-memory cache with TTL
│   ├── .env.example
│   └── package.json
│
└── client/                          # React 18 + Vite + Tailwind CSS
    ├── index.html                   # Entry HTML with SEO meta tags
    ├── vite.config.js               # Vite config with manual chunk splitting
    ├── tailwind.config.js           # Design token mapping
    └── src/
        ├── App.jsx                  # Root router + theme + localStorage
        ├── main.jsx                 # ReactDOM entry + ErrorBoundary
        ├── index.css                # Design system tokens + utilities
        ├── pages/
        │   ├── LandingPage.jsx      # Hero, file upload, feature bento grid
        │   ├── DashboardPage.jsx    # 3-panel editor (nav + form + preview)
        │   └── JobsPage.jsx         # Integrated job search
        ├── components/
        │   ├── Navbar.jsx           # Responsive top nav + theme toggle
        │   ├── FormSidebar.jsx      # Step progress + download buttons
        │   ├── ResumePreview.jsx    # 6 live template renderers (print-safe)
        │   ├── ATSScoreWidget.jsx   # Animated SVG ring score widget
        │   ├── TemplateShuffler.jsx # Floating template switcher FAB
        │   ├── TemplateModal.jsx    # Full template selection modal
        │   ├── DiffPreview.jsx      # Per-bullet AI diff accept/reject UI
        │   ├── templateThumbnails.jsx # SVG micro-previews for each template
        │   ├── JobSuccessModal.jsx  # Post-download job search prompt
        │   ├── ToastContainer.jsx   # Global toast notification system
        │   ├── ErrorBoundary.jsx    # React error boundary
        │   └── form-steps/
        │       ├── PersonalForm.jsx
        │       ├── ExperienceForm.jsx
        │       ├── ProjectsForm.jsx
        │       ├── EducationForm.jsx
        │       ├── SkillsForm.jsx
        │       └── AIOptimizerForm.jsx
        ├── hooks/
        │   ├── useLocalStorage.js   # Debounced localStorage persistence
        │   └── useTheme.js          # System theme detection + toggle
        └── utils/
            ├── api.js               # Typed API helper + default resume data
            ├── apiClient.js         # Fetch wrapper with error handling + toasts
            ├── docxExport.js        # DOCX export utility
            └── validation.js        # Zod-style form validation rules
```

---

## 🔌 API Reference

### AI Routes (`/api/ai`)

| Method | Endpoint | Description | AI? |
|---|---|---|---|
| `POST` | `/api/ai/parse-doc` | Upload PDF/DOCX → structured resume JSON | ✅ Gemini |
| `POST` | `/api/ai/tailor` | `{ experience, skills, jobDescription }` → tailored bullets (hybrid: only weak bullets sent to AI) | ✅ Partial |
| `POST` | `/api/ai/ats-score` | `{ resumeData, jobDescription }` → score 0–100 + missing keywords + remarks | ❌ Local |
| `POST` | `/api/ai/organize-skills` | `{ currentSkills, missingKeywords }` → injected skills section | ❌ Local |

### Resume Routes (`/api/resumes`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/resumes/:localId` | Fetch saved resume |
| `POST` | `/api/resumes/save` | Upsert resume (create or update by localId) |
| `DELETE` | `/api/resumes/:localId` | Delete resume |

### Job Routes (`/api/jobs`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs/search` | `?q=role&location=city` — SerpApi powered job search |

---

## 🎨 Design System — "Digital Architect"

The UI is built on a hand-crafted Material 3-inspired token system with full dual-theme:

| Token | Dark | Light |
|---|---|---|
| `--background` | `#0b1326` | `#f7f9fb` |
| `--primary` | `#c3c0ff` (Lavender) | `#3525cd` (Indigo) |
| `--primary-container` | `#4f46e5` | `#4f46e5` |
| `--surface-container` | `#171f33` | `#eceef0` |
| `--on-surface` | `#dae2fd` | `#191c1e` |

**Principles:**
- **Glassmorphism** — Floating panels use `backdrop-blur` + semi-transparent backgrounds
- **ATS-safe resume fonts** — All templates use `Arial / Calibri / Helvetica Neue` for maximum parser compatibility
- **Print-safe layouts** — Multi-column templates use `display: table` (the only CSS multi-column that reliably page-breaks)
- **Framer Motion** — All page transitions and micro-interactions use `duration: 0.25s ease`

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
| AI Engine | Google Gemini (via `@google/generative-ai`) |
| Document Parsing | `mammoth` (DOCX) + `pdf-parse` (PDF) |
| PDF Export | `react-to-print` (browser print engine) |
| Job Search | SerpApi |
| State Persistence | `localStorage` (client) + MongoDB (server) |

---

## 🔒 Security Notes

- **No auth required** — a UUID `localId` in `localStorage` identifies each user's resume session
- **API key isolation** — Gemini API key is server-side only, never sent to the client
- **CORS** — Only `localhost:*`, `*.vercel.app`, and `FRONTEND_URL` are allowed
- **File limits** — PDF/DOCX uploads capped at 10 MB server-side
- **`.env` gitignored** — only `.env.example` is committed

---

## ⚡ Performance

- **Code splitting** — Vendor chunks split: `react/react-dom`, `framer-motion`, `lucide-react` loaded separately
- **Debounced saves** — localStorage writes are debounced 500ms to avoid thrashing on every keystroke
- **Memoised templates** — All 6 resume template components wrapped in `React.memo` with deep-equal comparison
- **Stable callbacks** — `handleUpdate` wrapped in `useCallback`; form handlers memoised to prevent child re-renders
- **LRU server cache** — ATS scoring and tailor responses cached server-side with TTL to avoid redundant AI calls

---

## 🗺️ Roadmap

- [x] PDF/DOCX parsing
- [x] 6 resume templates with live preview
- [x] AI tailor with diff preview
- [x] ATS scoring + smart skill inject
- [x] Job search integration
- [x] Responsive mobile layout
- [x] Dark/Light theme
- [ ] Authentication (Clerk or NextAuth)
- [ ] Multiple resume versions per user
- [ ] Cover letter generator
- [ ] LinkedIn profile import
- [ ] Scanned PDF support (Tesseract OCR)
- [ ] Resume version history

---

## 🐛 Known Issues & Workarounds

| Issue | Workaround |
|---|---|
| Render backend cold start (~30s) | First request may timeout — retry once |
| Scanned PDFs return empty data | Use a text-based PDF; scanned images are not yet supported |
| MongoDB SRV DNS blocked | Use direct connection string or switch DNS to 8.8.8.8 |

---

*Built with ❤️ by [Aayush](https://github.com/Aayush-1124) · Powered by Google Gemini AI*
