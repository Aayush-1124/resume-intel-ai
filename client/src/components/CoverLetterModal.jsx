import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileText, Loader, AlertCircle, Copy, Check,
  Download, Sparkles, ChevronDown,
} from 'lucide-react';
import { api } from '../utils/api.js';

const TONES = [
  { id: 'professional',  label: 'Professional',  desc: 'Formal, measured confidence' },
  { id: 'enthusiastic',  label: 'Enthusiastic',  desc: 'Warm, energetic, passionate' },
  { id: 'concise',       label: 'Concise',        desc: 'Direct, 3 tight paragraphs'  },
];

export default function CoverLetterModal({ isOpen, onClose, resumeData, jd }) {
  const [tone, setTone]         = useState('professional');
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [copied, setCopied]     = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editBody, setEditBody] = useState('');

  const handleGenerate = async () => {
    if (!jd?.trim()) { setError('Paste a job description in the optimizer to generate a tailored cover letter.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const data = await api.coverLetter(resumeData, jd, tone);
      setResult(data);
      setEditBody(data.body);
    } catch (err) {
      if (err.message.includes('429') || err.message.includes('Quota')) {
        setError('AI quota exceeded — please wait a minute and try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const text = editMode ? editBody : result?.body || '';
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const text = editMode ? editBody : result?.body || '';
    const blob = new Blob([`Subject: ${result?.subject || ''}\n\n${text}`], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Cover Letter — ${resumeData.personal?.fullName || 'Resume'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/15"
               style={{ background: 'var(--surface-container)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <FileText size={16} className="text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-on-surface">Cover Letter Generator</h2>
                <p className="text-[0.65rem] text-on-surface-variant/60 mt-0.5">AI-written, tailored to your JD</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">

            {/* Tone selector */}
            <div>
              <label className="label-style mb-3 block">Writing tone</label>
              <div className="grid grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      tone === t.id
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-outline-variant/15 bg-surface-container hover:border-outline-variant/30'
                    }`}
                  >
                    <div className={`text-xs font-bold ${tone === t.id ? 'text-primary' : 'text-on-surface'}`}>{t.label}</div>
                    <div className="text-[0.65rem] text-on-surface-variant/60 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {!jd?.trim() && (
              <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/15 flex gap-2 items-start">
                <AlertCircle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400/90">Paste a job description in the AI Optimizer tab first to generate a tailored cover letter.</p>
              </div>
            )}

            {error && (
              <p className="text-xs text-error flex items-center gap-1.5">
                <AlertCircle size={13} /> {error}
              </p>
            )}

            {/* Generate button */}
            {!result && (
              <button
                onClick={handleGenerate}
                disabled={loading || !jd?.trim()}
                className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-br from-primary-container to-primary text-on-primary font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                {loading ? <Loader size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {loading ? 'Writing your cover letter…' : 'Generate Cover Letter'}
              </button>
            )}

            {/* Result */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Subject line */}
                {result.subject && (
                  <div className="px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant/10">
                    <span className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface-variant/60">Email subject</span>
                    <p className="text-[0.82rem] font-medium text-on-surface mt-0.5">{result.subject}</p>
                  </div>
                )}

                {/* Highlights */}
                {result.highlights?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.highlights.map((h, i) => (
                      <span key={i} className="tag-pill bg-primary/10 text-primary border border-primary/20">
                        <Sparkles size={9} /> {h}
                      </span>
                    ))}
                  </div>
                )}

                {/* Letter body */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface-variant/60">Cover letter</span>
                    <button
                      onClick={() => { setEditMode((v) => !v); setEditBody(result.body); }}
                      className="text-[0.65rem] text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
                    >
                      {editMode ? 'Preview' : 'Edit'}
                    </button>
                  </div>

                  {editMode ? (
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="field-input resize-none text-sm leading-relaxed"
                      rows={14}
                    />
                  ) : (
                    <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/10 text-[0.82rem] text-on-surface leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto custom-scrollbar">
                      {result.body}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap pt-1">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2 bg-surface-container-high text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-colors"
                  >
                    {copied ? <Check size={13} className="text-tertiary" /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="flex items-center gap-1.5 px-4 py-2 bg-surface-container-high text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-colors"
                  >
                    <Download size={13} /> Download .txt
                  </button>
                  <button
                    onClick={() => { setResult(null); setEditMode(false); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors ml-auto"
                  >
                    <Sparkles size={13} /> Regenerate
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
