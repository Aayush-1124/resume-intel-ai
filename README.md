# ResumeIntel AI — Production-Ready AI Resume Builder

> **Surgical Precision for your Career Path.** Maximize your ATS score and dynamically tailor your resume in real-time to match any job description using advanced AI.

---

## ✨ Features

| Feature | Description |
|---|---|
| **PDF/DOCX Parser** | Upload any PDF or DOCX resume → AI extracts structured JSON (Personal, Experience, Education, Skills) |
| **Multi-Step Form** | 5-step state-controlled form — Personal Info, Experience, Education, Skills, AI Optimizer |
| **AI Tailor Engine** | Paste a job description → AI rewrites only weak bullets to match JD keywords (50-70% fewer API tokens) |
| **ATS Scorer** | Weighted keyword-match algorithm gives a 0–100% compatibility score + lists missing keywords + actionable improvement remarks |
| **Smart Inject** | One-click injection of missing JD keywords into your Skills section using a local tech taxonomy |
| **Inline Editing** | Edit AI-tailored bullets inline + accept/reject individual bullets before saving |
| **6 Resume Templates** | Classic, Modern, Minimal, Executive, Tech, Compact — with live preview |
| **PDF Export** | Client-side react-to-print with proper A4 page styles |
| **localStorage Persistence** | All changes auto-saved; no auth required |
| **Dark/Light Theme** | Dual-theme support with system preference detection |
| **Fully Responsive** | Mobile-friendly layout with ARIA labels throughout |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key — [Get one free](https://aistudio.google.com/app/apikey)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/resume-intel.git
cd resume-intel

# Install all dependencies (root + server + client)
npm run install:all
```

### 2. Configure Environment

Copy the template and fill in your values:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

> **⚠️ SRV DNS Issue?** Some ISPs (especially in India) block SRV DNS lookups. If you see `querySrv ECONNREFUSED`, use the **standard connection string** instead:
> 1. In MongoDB Atlas → Click **Connect** → **Drivers** → Copy the non-SRV string
> 2. Or change your DNS to `8.8.8.8` (Google) / `1.1.1.1` (Cloudflare)

### 3. Run Development Servers

```bash
# Starts both server (:5000) and client (:5173) concurrently
npm run dev
```

Then open **http://localhost:5173**

---

## 🏗️ Architecture

```
resume-intel/
├── server/                          # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── index.js                 # Express app entry point
│   │   ├── models/
│   │   │   └── Resume.js            # Mongoose schema
│   │   ├── routes/
│   │   │   ├── resume.js            # CRUD endpoints
│   │   │   └── ai.js                # AI + hybrid endpoints
│   │   └── utils/
│   │       └── cache.js             # LRU cache with TTL
│   ├── .env.example                 # Environment template
│   └── package.json
│
└── client/                          # React 18 + Vite + Tailwind CSS
    ├── src/
    │   ├── App.jsx                  # Root + page router
    │   ├── pages/
    │   │   ├── LandingPage.jsx      # Hero + PDF upload + feature bento
    │   │   └── DashboardPage.jsx    # 3-column editor
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── FormSidebar.jsx      # Step navigation + progress
    │   │   ├── ResumePreview.jsx    # 6 live template renderers
    │   │   ├── ATSScoreWidget.jsx   # Animated SVG ring widget
    │   │   ├── TemplateShuffler.jsx # Floating template switcher
    │   │   ├── TemplateModal.jsx    # Template selection modal
    │   │   ├── DiffPreview.jsx      # Inline editing + per-bullet control
    │   │   ├── templateThumbnails.jsx # SVG template previews
    │   │   └── form-steps/
    │   │       ├── PersonalForm.jsx
    │   │       ├── ExperienceForm.jsx
    │   │       ├── EducationForm.jsx
    │   │       ├── SkillsForm.jsx
    │   │       └── AIOptimizerForm.jsx
    │   ├── hooks/
    │   │   ├── useLocalStorage.js
    │   │   └── useTheme.js
    │   └── utils/
    │       ├── api.js               # API client + default data
    │       ├── docxExport.js        # DOCX export utility
    │       └── validation.js        # Form validation
    └── package.json
```

---

## 🔌 API Reference

### AI Routes (`/api/ai`)

| Method | Endpoint | Description | Uses AI? |
|---|---|---|---|
| `POST` | `/api/ai/parse-doc` | Upload PDF/DOCX → returns structured resume JSON | ✅ Yes |
| `POST` | `/api/ai/tailor` | `{ experience, skills, jobDescription }` → tailored bullets (hybrid — only weak bullets sent to AI) | ✅ Partial |
| `POST` | `/api/ai/ats-score` | `{ resumeData, jobDescription }` → weighted score + missing keywords + improvement remarks | ❌ Local |
| `POST` | `/api/ai/organize-skills` | `{ currentSkills, missingKeywords }` → organized skills | ❌ Local |

### Resume Routes (`/api/resumes`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/resumes/:localId` | Fetch saved resume by ID |
| `POST` | `/api/resumes/save` | Upsert resume (create or update) |
| `DELETE` | `/api/resumes/:localId` | Delete resume |

---

## 🎨 Design System

The UI implements the **"Digital Architect"** design system with dual-theme support:

- **Dark Mode**: Deep `#0b1326` background, Indigo `#4f46e5` primary-container, Lavender `#c3c0ff` primary
- **Light Mode**: Clean white surfaces with indigo accents
- **No-Line Rule**: All sections separated by background color shifts, never 1px borders
- **Glassmorphism**: Floating panels use `backdrop-blur` + 60% opacity
- **Typography**: Inter exclusively, `tracking-tighter` for displays, `uppercase tracking-widest` for labels
- **Motion**: Framer Motion with `duration-300 ease-out` for all transitions

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB Atlas |
| AI | Advanced AI engine (hybrid — local taxonomy + selective AI) |
| Doc Parse | mammoth (DOCX) + pdf-parse (PDF) |
| PDF Export | react-to-print (client) |
| Persistence | localStorage (client) + MongoDB (server) |

---

## 🔒 Security & Notes

- No authentication is required. A `localId` (UUID) is generated and stored in `localStorage` to identify the user's resume.
- The AI API key is server-side only and never exposed to the client.
- All `.env` files are gitignored — only `.env.example` is committed.
- PDF parsing requires a text-based PDF (not scanned images). For scanned PDFs, add Tesseract OCR.
- ATS scoring and skill organization run **100% locally** using a built-in tech taxonomy — zero API calls.

---

## 🗺️ Roadmap

- [ ] Job Search & Matching Dashboard (SerpApi)
- [ ] Auth (NextAuth or Clerk)
- [ ] Multiple resume versions per user
- [ ] Cover letter generator
- [ ] LinkedIn profile import
- [ ] Export to DOCX

---

*Built with ❤️ by ResumeIntel AI*
