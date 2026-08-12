import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Zap, Target, ArrowRight, CheckCircle, AlertCircle, FileType,
  Wand2, UserCheck, FileText, HelpCircle, History, Tag, GitCompareArrows,
  LayoutTemplate, Briefcase, Shield, Sparkles, Code2,
} from 'lucide-react';
import { api } from '../utils/api.js';

/* ─── Feature Data ──────────────────────────────────────────────────── */
const MANUAL_FEATURES = [
  {
    icon: Target,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'ATS Compatibility Score',
    desc: 'Weighted 0–100 score with missing-keyword list, contextual placement analysis, and bullet quality checks. Auto-rescores as you edit.',
    tag: 'No AI needed',
  },
  {
    icon: Tag,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    title: 'Keyword Breakdown',
    desc: 'Every JD keyword categorised (Languages · Frameworks · Tools · Concepts) with a plain-English explanation of why each one matters to recruiters.',
    tag: 'No AI needed',
  },
  {
    icon: GitCompareArrows,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    title: 'AI Diff Preview',
    desc: 'Side-by-side before/after comparison for every AI-tailored bullet. Accept, reject, or manually edit changes individually before committing.',
    tag: 'No AI needed',
  },
  {
    icon: History,
    color: 'text-secondary',
    bg: 'bg-secondary-container',
    title: 'Version History',
    desc: 'Auto-snapshots saved on every export. Browse a timestamped timeline, label key versions ("Before AI tailor"), and restore any snapshot in one click.',
    tag: 'No AI needed',
  },
];

const AI_FEATURES = [
  {
    icon: Wand2,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'AI Tailor Engine',
    desc: 'Paste any JD — AI rewrites weak bullets to naturally incorporate required keywords while preserving your authentic voice and real achievements.',
  },
  {
    icon: UserCheck,
    color: 'text-tertiary',
    bg: 'bg-tertiary/10',
    title: 'AI Recruiter Review',
    desc: 'Get honest qualitative feedback from a simulated senior recruiter: section grades, green & red flags, and a single top-priority action to take today.',
  },
  {
    icon: FileText,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Cover Letter Generator',
    desc: 'One click generates a JD-tailored cover letter in your chosen tone (Professional · Enthusiastic · Concise). Edit inline, copy, or download as .txt.',
  },
  {
    icon: HelpCircle,
    color: 'text-tertiary',
    bg: 'bg-tertiary/10',
    title: 'Interview Prep',
    desc: 'Role-specific behavioral (with STAR starters), technical (with difficulty), and role questions — plus 4 smart questions to ask your interviewer.',
  },
];

/* ─── Stat Counter ──────────────────────────────────────────────────── */
const STATS = [
  { value: '6',   label: 'Resume Templates',   suffix: '' },
  { value: '10',  label: 'AI-Powered Tools',   suffix: '+' },
  { value: '100', label: 'ATS Score Possible', suffix: '' },
  { value: '0',   label: 'Auth Required',      suffix: '' },
];

/* ─── How It Works steps ────────────────────────────────────────────── */
const HOW_STEPS = [
  { n: '01', title: 'Upload or Build', desc: 'Drag-drop your PDF/DOCX and AI parses it instantly, or start fresh with the 6-step editor.' },
  { n: '02', title: 'Paste the JD',   desc: 'Drop any job description into the AI Optimizer to unlock all tailoring and scoring tools.' },
  { n: '03', title: 'Optimize',        desc: 'Run the ATS scorer, tailor bullets, inject missing keywords, and get your recruiter review.' },
  { n: '04', title: 'Export & Prep',   desc: 'Download a pixel-perfect PDF or DOCX, then generate your cover letter and interview questions.' },
];

/* ─── Component ─────────────────────────────────────────────────────── */
export default function LandingPage({ onNavigate, onResumeLoaded }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');
  const [progress, setProgress]     = useState(0);
  const [fileName, setFileName]     = useState('');

  const ACCEPTED = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/pdf',
  ];

  const handleFile = async (file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(docx?|pdf)$/i)) {
      setError('Please upload a DOCX or PDF file.'); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.'); return;
    }
    setError(''); setFileName(file.name); setIsLoading(true); setProgress(15);
    try {
      setProgress(40);
      const result = await api.parseDoc(file);
      setProgress(90);
      onResumeLoaded(result);
      setProgress(100);
    } catch (err) {
      setError(err.message);
      setIsLoading(false); setProgress(0); setFileName('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]);
  };

  return (
    <main className="pt-28 pb-32 overflow-x-hidden" role="main">

      {/* ══════ HERO ══════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <motion.div
          className="lg:col-span-7 flex flex-col items-start"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7 border border-outline-variant/15"
               style={{ background: 'var(--surface-container)' }}>
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-on-surface-variant">
              10+ AI Tools · DOCX + PDF · Zero Signup
            </span>
          </div>

          <h1 className="text-[2.6rem] sm:text-[3.2rem] lg:text-[4.2rem] font-extrabold tracking-tighter leading-[1.05] mb-6 text-on-surface max-w-2xl">
            The complete AI toolkit for your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-tertiary">
              job search.
            </span>
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-on-surface-variant mb-10 max-w-xl">
            Upload your resume, score it against any job description, tailor every bullet, generate a cover letter, prep for interviews — all in one place, no account required.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-br from-primary-container to-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              style={{ boxShadow: '0 8px 24px -4px rgba(79,70,229,0.4)' }}
              aria-label="Build resume from scratch"
            >
              Build from Scratch <ArrowRight size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-8 py-4 bg-surface-container-high text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest border border-outline-variant/20 hover:border-outline-variant/40 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Upload size={15} /> Upload & Parse Resume
            </motion.button>
          </div>

          {/* ATS system logos */}
          <div className="mt-14">
            <p className="text-[0.6875rem] font-medium uppercase tracking-widest text-on-surface-variant mb-5 flex items-center gap-2">
              <Shield size={13} className="text-primary opacity-70" /> Engineered to pass filters at
            </p>
            <div className="flex flex-wrap gap-6 sm:gap-8 opacity-35 grayscale contrast-125">
              {['WORKDAY', 'GREENHOUSE', 'LEVER', 'TALEO', 'ICIMS'].map((c) => (
                <span key={c} className="text-lg font-bold tracking-tighter text-on-surface">{c}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Upload Zone ── */}
        <motion.div
          className="lg:col-span-5 w-full mt-8 lg:mt-0"
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div
            role="button" tabIndex={0}
            aria-label="Drop your DOCX or PDF resume here, or click to browse"
            className={`p-10 rounded-2xl border transition-all duration-300 relative overflow-hidden group cursor-pointer
              ${isDragging ? 'border-primary/50 scale-[1.01]' : 'border-outline-variant/15'}
              ${isLoading ? 'pointer-events-none' : ''}`}
            style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-tertiary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative flex flex-col items-center text-center gap-5">
              <motion.div
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={isLoading ? { repeat: Infinity, duration: 1.5, ease: 'linear' } : {}}
                className="w-20 h-20 bg-surface-container rounded-2xl flex items-center justify-center border border-outline-variant/15 shadow-sm"
              >
                {isDragging
                  ? <Upload size={30} className="text-primary" />
                  : <FileType size={30} className="text-primary-container" />}
              </motion.div>

              <div>
                <h3 className="text-xl font-bold mb-1.5 text-on-surface">
                  {isLoading ? `Parsing "${fileName}"…` : 'Drop your resume here'}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  {isLoading ? 'AI is reading your document — 10–20 seconds' : 'or click to browse'}
                </p>
              </div>

              <div className="flex gap-2">
                {['.DOCX', '.DOC', '.PDF'].map((ext) => (
                  <span key={ext} className="px-2.5 py-1 bg-surface-container rounded-full text-[0.65rem] font-bold uppercase tracking-wider text-on-surface-variant border border-outline-variant/10">
                    {ext}
                  </span>
                ))}
              </div>

              <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-error text-sm" role="alert"
                  >
                    <AlertCircle size={14} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <span className="text-[0.65rem] uppercase tracking-widest opacity-35 text-on-surface">Max 10 MB</span>
            </div>
          </div>

          <input
            ref={fileInputRef} type="file"
            accept=".docx,.doc,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf"
            className="hidden" aria-label="Upload resume file"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {/* Quick stats below upload card */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { icon: Zap, label: 'Parse in ~15s', sub: 'Any PDF or DOCX' },
              { icon: Shield, label: 'Zero signup', sub: 'No account needed' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2.5 p-3 rounded-xl border border-outline-variant/10 bg-surface-container">
                <Icon size={14} className="text-primary shrink-0" />
                <div>
                  <p className="text-[0.72rem] font-bold text-on-surface">{label}</p>
                  <p className="text-[0.62rem] text-on-surface-variant/60">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════ STATS STRIP ══════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mt-24 sm:mt-28">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(({ value, label, suffix }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex flex-col items-center text-center p-5 rounded-2xl border border-outline-variant/10 bg-surface-container"
            >
              <span className="text-3xl sm:text-4xl font-black text-primary">{value}<span className="text-2xl">{suffix}</span></span>
              <span className="text-[0.68rem] font-medium uppercase tracking-widest text-on-surface-variant/70 mt-1.5">{label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mt-24 sm:mt-32" aria-labelledby="how-heading">
        <div className="mb-12">
          <span className="text-[0.65rem] font-bold uppercase tracking-widest text-primary mb-3 block">How it works</span>
          <h2 id="how-heading" className="text-2xl sm:text-3xl font-bold tracking-tighter text-on-surface">
            From resume to offer-ready in 4 steps
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOW_STEPS.map(({ n, title, desc }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative p-6 rounded-2xl border border-outline-variant/10 bg-surface-container group hover:border-primary/20 transition-all"
            >
              <span className="text-[2rem] font-black text-primary/15 leading-none">{n}</span>
              <h3 className="text-sm font-bold text-on-surface mt-2 mb-1.5">{title}</h3>
              <p className="text-[0.76rem] text-on-surface-variant leading-relaxed">{desc}</p>
              {i < HOW_STEPS.length - 1 && (
                <ArrowRight size={14} className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-outline-variant z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════ FEATURES — NO AI NEEDED ══════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mt-24 sm:mt-32" aria-labelledby="manual-features-heading">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/10 mb-4">
            <Code2 size={12} className="text-blue-400" />
            <span className="text-[0.62rem] font-bold uppercase tracking-widest text-blue-400">No AI quota consumed</span>
          </div>
          <h2 id="manual-features-heading" className="text-2xl sm:text-3xl font-bold tracking-tighter text-on-surface mb-2">
            Instant tools — always available
          </h2>
          <p className="text-sm text-on-surface-variant max-w-lg leading-relaxed">
            These features run locally or via our taxonomy engine — no Gemini calls, no rate limits, instant results.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* ATS Score Demo Card — large */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="sm:col-span-2 lg:col-span-1 p-8 rounded-2xl border border-outline-variant/10 bg-surface-container group hover:border-primary/20 transition-all"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className="text-[0.62rem] font-bold uppercase tracking-widest text-primary mb-2 block">Real-time Analytics</span>
                <h3 className="text-xl font-bold text-on-surface">ATS Compatibility Score</h3>
                <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed max-w-sm">
                  Weighted 0–100 score across keyword match, contextual placement, bullet metrics, and action verb quality. Auto-rescores as you type.
                </p>
              </div>
              <Target size={20} className="text-on-surface-variant/30 shrink-0 ml-4" />
            </div>
            <div className="flex items-center gap-8 flex-wrap">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="transparent" stroke="var(--surface-container-highest)" strokeWidth="6" />
                  <circle cx="48" cy="48" r="40" fill="transparent" stroke="var(--primary)"
                    strokeWidth="6" strokeDasharray="251" strokeDashoffset="63" strokeLinecap="round" />
                </svg>
                <span className="absolute text-lg font-black text-on-surface">75%</span>
              </div>
              <ul className="space-y-2.5 flex-1">
                {[
                  { ok: true,  text: 'Semantic keyword density: good' },
                  { ok: true,  text: 'Bullet action verbs: strong'    },
                  { ok: false, text: '4 JD keywords missing'          },
                  { ok: false, text: 'Metrics coverage: low'          },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[0.78rem] text-on-surface-variant">
                    {item.ok
                      ? <CheckCircle size={13} className="text-tertiary shrink-0" />
                      : <AlertCircle size={13} className="text-error shrink-0" />}
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right column: 3 manual feature cards */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            {MANUAL_FEATURES.slice(1).map(({ icon: Icon, color, bg, title, desc, tag }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: (i + 1) * 0.08, duration: 0.5 }}
                className="p-5 rounded-2xl border border-outline-variant/10 bg-surface-container hover:border-outline-variant/25 transition-all flex gap-4 items-start"
              >
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon size={16} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-[0.85rem] font-bold text-on-surface">{title}</h3>
                    <span className="tag-pill bg-surface-container-high text-on-surface-variant/60 text-[0.55rem]">{tag}</span>
                  </div>
                  <p className="text-[0.74rem] text-on-surface-variant leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FEATURES — AI-POWERED ══════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mt-20 sm:mt-28" aria-labelledby="ai-features-heading">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/15 mb-4">
            <Sparkles size={12} className="text-primary" />
            <span className="text-[0.62rem] font-bold uppercase tracking-widest text-primary">Powered by Google Gemini</span>
          </div>
          <h2 id="ai-features-heading" className="text-2xl sm:text-3xl font-bold tracking-tighter text-on-surface mb-2">
            AI tools that do the heavy lifting
          </h2>
          <p className="text-sm text-on-surface-variant max-w-lg leading-relaxed">
            Four Gemini-powered features that handle the qualitative, language-heavy work — things a rule-based system simply can't replicate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {AI_FEATURES.map(({ icon: Icon, color, bg, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.09, duration: 0.5 }}
              className="p-6 rounded-2xl border border-outline-variant/10 bg-surface-container hover:border-primary/20 hover:bg-surface-container-high transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <Icon size={18} className={color} />
              </div>
              <h3 className="text-[0.95rem] font-bold text-on-surface mb-2">{title}</h3>
              <p className="text-[0.78rem] text-on-surface-variant leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════ TEMPLATES PREVIEW ══════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mt-20 sm:mt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="rounded-2xl border border-outline-variant/10 overflow-hidden bg-surface-container hover:border-primary/20 transition-all"
        >
          {/* Template previews strip */}
          <div className="h-40 bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center gap-3 sm:gap-4 px-6 overflow-hidden">
            {['Classic', 'Modern', 'Minimal', 'Executive', 'Tech', 'Compact'].map((t, i) => (
              <div
                key={t}
                className="bg-white/90 rounded-lg p-2.5 w-14 sm:w-16 h-20 sm:h-24 flex flex-col justify-between shadow-md shrink-0 transition-transform"
                style={{ opacity: i === 3 ? 1 : 0.55, transform: i === 3 ? 'scale(1.12) translateY(-4px)' : 'scale(1)' }}
              >
                <div className="space-y-1">
                  <div className="h-1 bg-gray-800 rounded w-full" />
                  <div className="h-[2px] bg-gray-300 rounded w-3/4" />
                  <div className="h-[2px] bg-gray-300 rounded w-1/2" />
                </div>
                <div className="space-y-0.5">
                  <div className="h-[2px] bg-gray-200 rounded w-full" />
                  <div className="h-[2px] bg-gray-200 rounded w-full" />
                </div>
                <div className="text-center text-gray-500 text-[5px] font-bold uppercase truncate">{t}</div>
              </div>
            ))}
          </div>
          {/* Caption */}
          <div className="p-7 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <LayoutTemplate size={15} className="text-primary" />
                <h3 className="text-lg font-bold text-on-surface">6 ATS-Safe Templates</h3>
              </div>
              <p className="text-[0.78rem] text-on-surface-variant leading-relaxed max-w-md">
                Classic · Modern · Minimal · Executive · Tech · Compact — switch live in the editor, all use ATS-safe fonts and print-optimised layouts.
              </p>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold text-on-primary flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, var(--primary-container), var(--primary))' }}
            >
              Browse Templates <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ══════ CORE PLATFORM ══════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mt-20 sm:mt-28">
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter text-on-surface mb-2">
            Everything else you need
          </h2>
          <p className="text-sm text-on-surface-variant max-w-lg">The platform built around the full job-search workflow.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Zap, color: 'text-primary', bg: 'bg-primary/10',
              title: 'Instant AI Parser',
              desc: 'Upload PDF or DOCX — Gemini reads multi-column layouts, deduplicates content, and extracts personal info, experience, projects, education, and skills into structured JSON.',
            },
            {
              icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-500/10',
              title: 'Integrated Job Search',
              desc: 'Search 1M+ live postings via SerpApi directly from the dashboard. Populated with popular role suggestions and 5 graceful error states.',
            },
            {
              icon: GitCompareArrows, color: 'text-tertiary', bg: 'bg-tertiary/10',
              title: 'Smart Skill Inject',
              desc: 'One-click injection of missing JD keywords into your Skills section, automatically categorised by the built-in tech taxonomy.',
            },
            {
              icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10',
              title: 'Friendly Error System',
              desc: 'Every API error maps to a human-readable message with a Retry button. Users never see raw HTTP codes or stack traces.',
            },
            {
              icon: History, color: 'text-secondary', bg: 'bg-secondary-container',
              title: 'Auto-Save Everywhere',
              desc: 'All edits debounced 500ms and persisted to localStorage. Version snapshots saved to MongoDB on every export.',
            },
            {
              icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10',
              title: 'Dual Export',
              desc: 'Download a pixel-perfect PDF (browser print engine — crisp vector text) or DOCX for every template. No blurry screenshots.',
            },
          ].map(({ icon: Icon, color, bg, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.45 }}
              className="p-6 rounded-2xl border border-outline-variant/10 bg-surface-container hover:border-outline-variant/25 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon size={17} className={color} />
              </div>
              <h3 className="text-[0.9rem] font-bold text-on-surface mb-1.5">{title}</h3>
              <p className="text-[0.74rem] text-on-surface-variant leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 mt-28 sm:mt-36 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="relative p-12 sm:p-16 rounded-3xl border border-primary/15 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(78,222,163,0.04))' }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(79,70,229,0.12) 0%, transparent 70%)' }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles size={12} className="text-primary" />
              <span className="text-[0.62rem] font-bold uppercase tracking-widest text-primary">Start for free · No signup</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-on-surface mb-4">
              Your next interview starts here.
            </h2>
            <p className="text-base text-on-surface-variant mb-10 max-w-lg mx-auto leading-relaxed">
              Upload your resume or start from scratch — ATS scorer, AI tailor, recruiter review, cover letter, and interview prep are all waiting.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('dashboard')}
                className="px-10 py-4 text-on-primary font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, var(--primary-container), var(--primary))',
                  boxShadow: '0 12px 32px -6px rgba(79,70,229,0.45)',
                }}
              >
                <Sparkles size={16} /> Get Started Free
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => fileInputRef.current?.click()}
                className="px-10 py-4 font-semibold rounded-xl border border-outline-variant/25 hover:border-outline-variant/50 bg-surface-container-high hover:bg-surface-container-highest transition-all text-on-surface flex items-center justify-center gap-2"
              >
                <Upload size={15} /> Upload Existing Resume
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Hidden file input */}
      <input
        ref={fileInputRef} type="file"
        accept=".docx,.doc,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf"
        className="hidden" aria-label="Upload resume file"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </main>
  );
}
