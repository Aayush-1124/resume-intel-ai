import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Zap, Target, FileText, Cpu, ArrowRight, CheckCircle, AlertCircle, FileType } from 'lucide-react';
import { api } from '../utils/api.js';

export default function LandingPage({ onNavigate, onResumeLoaded }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');

  const ACCEPTED = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/pdf',
  ];

  const handleFile = async (file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(docx?|pdf)$/i)) {
      setError('Please upload a DOCX or PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.');
      return;
    }
    setError('');
    setFileName(file.name);
    setIsLoading(true);
    setProgress(15);

    try {
      setProgress(40);
      const result = await api.parseDoc(file);
      setProgress(90);
      onResumeLoaded(result.data);
      setProgress(100);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      setProgress(0);
      setFileName('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <main className="pt-28 pb-24" role="main">

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <motion.div
          className="lg:col-span-7 flex flex-col items-start"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-highest/40 rounded-full mb-6 border border-outline-variant/10">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse-slow" />
            <span className="text-[0.6875rem] font-medium uppercase tracking-widest text-on-surface-variant">
              POWERED BY ADVANCED AI — DOCX + PDF SUPPORTED
            </span>
          </div>

          <h1 className="text-[2.5rem] sm:text-[3rem] lg:text-[4rem] font-extrabold tracking-tighter leading-tight mb-6 text-on-surface max-w-2xl">
            Surgical Precision for your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-tertiary">
              Career Path.
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-[1.125rem] leading-relaxed text-on-surface-variant mb-10 max-w-xl">
            Maximize your ATS score and dynamically tailor your resume in real-time to match any job description using advanced AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2"
              aria-label="Build resume from scratch"
            >
              Build from Scratch <ArrowRight size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-8 py-4 bg-surface-container-high text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest border border-outline-variant/20 hover:border-outline-variant/40 transition-all duration-300 flex items-center justify-center"
            >
              Upload & Parse Resume
            </motion.button>
          </div>

          {/* Logos */}
          <div className="mt-16">
            <p className="text-[0.6875rem] font-medium uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
              <CheckCircle size={14} className="text-primary opacity-80" /> Engineered to pass filters at
            </p>
            <div className="flex flex-wrap gap-8 opacity-40 grayscale contrast-125">
              {['WORKDAY', 'GREENHOUSE', 'LEVER', 'TALEO', 'ICIMS'].map((c) => (
                <span key={c} className="text-xl font-bold tracking-tighter text-on-surface">{c}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Upload Zone ── */}
        <motion.div
          className="lg:col-span-5 w-full mt-10 lg:mt-0"
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div
            role="button" tabIndex={0}
            aria-label="Drop your DOCX or PDF resume here, or click to browse"
            className={`glass p-10 rounded-xl border transition-all duration-300 relative overflow-hidden group cursor-pointer
              ${isDragging ? 'border-primary/50 scale-[1.01]' : 'border-outline-variant/10'}
              ${isLoading ? 'pointer-events-none' : ''}`}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative flex flex-col items-center text-center gap-5">
              <motion.div
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={isLoading ? { repeat: Infinity, duration: 1.5, ease: 'linear' } : {}}
                className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center border border-outline-variant/15"
              >
                {isDragging
                  ? <Upload size={32} className="text-primary" />
                  : <FileType size={32} className="text-primary-container" />}
              </motion.div>

              <div>
                <h3 className="text-xl font-bold mb-1 text-on-surface">
                  {isLoading ? `Parsing "${fileName}"…` : 'Drop your resume here'}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  {isLoading ? 'Our advanced AI is reading your document' : 'or click to browse'}
                </p>
              </div>

              {/* Accepted types pills */}
              <div className="flex gap-2">
                {['.DOCX', '.DOC', '.PDF'].map((ext) => (
                  <span key={ext} className="px-2.5 py-1 bg-surface-container rounded-full text-[0.65rem] font-bold uppercase tracking-wider text-on-surface-variant border border-outline-variant/10">
                    {ext}
                  </span>
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-surface-container-low rounded-full overflow-hidden">
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

              <span className="text-[0.65rem] uppercase tracking-widest opacity-40 text-on-surface">
                Max 10 MB
              </span>
            </div>
          </div>

          <input
            ref={fileInputRef} type="file"
            accept=".docx,.doc,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf"
            className="hidden" aria-label="Upload resume file"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </motion.div>
      </section>

      {/* ── Feature Bento ── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mt-32 sm:mt-40" aria-labelledby="features-heading">
        <div className="mb-12 sm:mb-16">
          <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold tracking-tighter text-on-surface mb-3 sm:mb-2">
            Engineered Performance
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-lg leading-relaxed">
            Advanced metrics to ensure your profile stands out in the digital stack.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* ATS Score demo card */}
          <motion.div
            whileHover={{ backgroundColor: 'var(--surface-container)' }}
            transition={{ duration: 0.3 }}
            className="md:col-span-2 bg-surface-container-low p-8 rounded-xl flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-12">
              <div>
                <span className="text-[0.6875rem] font-medium uppercase tracking-widest text-primary mb-2 block">
                  Real-time Analytics
                </span>
                <h3 className="text-2xl font-bold text-on-surface">ATS Compatibility Score</h3>
              </div>
              <Target size={22} className="text-on-surface-variant" />
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-10">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="48" fill="transparent" stroke="var(--surface-container-highest)" strokeWidth="7" />
                  <circle cx="56" cy="56" r="48" fill="transparent" stroke="var(--primary)"
                    strokeWidth="7" strokeDasharray="301.6" strokeDashoffset="75.4" strokeLinecap="round" />
                </svg>
                <span className="absolute text-xl sm:text-2xl font-bold text-on-surface">75%</span>
              </div>
              <ul className="space-y-3 flex-1 w-full">
                {[
                  { ok: true, text: 'Semantic density optimized' },
                  { ok: true, text: 'Structure verified' },
                  { ok: false, text: '4 keywords missing' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-on-surface-variant">
                    {item.ok
                      ? <CheckCircle size={15} className="text-tertiary shrink-0" />
                      : <AlertCircle size={15} className="text-error shrink-0" />}
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Missing keywords card */}
          <motion.div
            whileHover={{ backgroundColor: 'var(--surface-container)' }}
            transition={{ duration: 0.3 }}
            className="bg-surface-container-low p-8 rounded-xl flex flex-col"
          >
            <h3 className="text-lg font-bold mb-6 text-on-surface">Missing Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {['TensorFlow', 'Kubernetes', 'CI/CD', 'Agile', 'Microservices', 'Golang'].map((kw) => (
                <span key={kw} className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-xs rounded-full border border-outline-variant/10">
                  {kw}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Instant scan */}
          <motion.div
            whileHover={{ backgroundColor: 'var(--surface-container)' }}
            transition={{ duration: 0.3 }}
            className="bg-surface-container-low p-8 rounded-xl"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Zap size={22} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-on-surface">Instant Scan</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Parse DOCX & PDF resumes instantly using our blazing fast, context-aware AI engine.
            </p>
          </motion.div>

          {/* AI Content */}
          <motion.div
            whileHover={{ backgroundColor: 'var(--surface-container)' }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2 bg-surface-container-low p-8 rounded-xl"
          >
            <h3 className="text-xl font-bold mb-4 text-on-surface">AI Content Architect</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Transform <em>"Managed a team"</em> into{' '}
              <em>"Orchestrated cross-functional engineering squads delivering 3 SaaS products 20% ahead of schedule."</em>
            </p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 bg-surface-container-highest rounded-xl text-sm font-medium border border-outline-variant/10 text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Try AI Rewriter →
            </button>
          </motion.div>

          {/* Templates preview */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2 bg-surface-container-low rounded-xl overflow-hidden border border-transparent hover:border-primary/20 transition-all duration-300"
          >
            <div className="h-36 bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 overflow-hidden">
              {['Classic', 'Modern', 'Minimal', 'Executive', 'Tech', 'Compact'].map((t, i) => (
                <div key={t} className="bg-white/90 rounded-lg p-2 w-14 sm:w-16 h-20 flex flex-col justify-between shadow-sm shrink-0"
                  style={{ opacity: i === 2 ? 1 : 0.6, transform: i === 2 ? 'scale(1.1)' : 'scale(1)' }}>
                  <div className="space-y-1">
                    <div className="h-1 bg-gray-800 rounded w-full" />
                    <div className="h-[2px] bg-gray-300 rounded w-3/4" />
                  </div>
                  <div className="text-center text-gray-500 text-[5px] sm:text-[6px] font-bold uppercase truncate">{t}</div>
                </div>
              ))}
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold mb-2 text-on-surface">6 Executive Templates</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">Classic · Modern · Minimal · Executive · Tech · Compact — switch live in the editor.</p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
