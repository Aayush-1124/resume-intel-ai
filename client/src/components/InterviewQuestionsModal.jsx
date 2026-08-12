import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, HelpCircle, Loader, AlertCircle, ChevronDown, ChevronRight,
  MessageSquare, Code2, Briefcase, Lightbulb, UserCheck,
} from 'lucide-react';
import { api } from '../utils/api.js';

const DIFFICULTY_STYLE = {
  easy:   { color: 'text-tertiary',  bg: 'bg-tertiary/10' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
  hard:   { color: 'text-error',     bg: 'bg-error/10' },
};

function AccordionItem({ question, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-outline-variant/10 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3.5 bg-surface-container hover:bg-surface-container-high transition-colors text-left"
      >
        <div className="flex-1 text-[0.82rem] font-medium text-on-surface leading-relaxed">{question}</div>
        {open
          ? <ChevronDown size={14} className="text-on-surface-variant/50 shrink-0 mt-0.5" />
          : <ChevronRight size={14} className="text-on-surface-variant/50 shrink-0 mt-0.5" />
        }
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 space-y-2 border-t border-outline-variant/8">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InterviewQuestionsModal({ isOpen, onClose, resumeData, jd }) {
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [activeTab, setActiveTab] = useState('behavioral');

  const handleGenerate = async () => {
    if (!jd?.trim()) { setError('Paste a job description in the AI Optimizer to generate tailored questions.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const data = await api.interviewQuestions(resumeData, jd);
      setResult(data);
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

  const TABS = [
    { id: 'behavioral',   label: 'Behavioral',   icon: MessageSquare, data: result?.behavioral    },
    { id: 'technical',    label: 'Technical',    icon: Code2,         data: result?.technical     },
    { id: 'roleSpecific', label: 'Role-Specific', icon: Briefcase,     data: result?.roleSpecific  },
    { id: 'toAsk',        label: 'Ask Them',     icon: UserCheck,     data: result?.questionsToAsk },
  ];

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
              <div className="w-9 h-9 rounded-xl bg-tertiary/15 flex items-center justify-center">
                <HelpCircle size={16} className="text-tertiary" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-on-surface">Interview Prep</h2>
                <p className="text-[0.65rem] text-on-surface-variant/60 mt-0.5">Role-specific questions tailored to your resume + JD</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">

            {!jd?.trim() && (
              <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/15 flex gap-2 items-start">
                <AlertCircle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400/90">Paste a job description in the AI Optimizer tab first for tailored questions.</p>
              </div>
            )}

            {error && (
              <p className="text-xs text-error flex items-center gap-1.5">
                <AlertCircle size={13} /> {error}
              </p>
            )}

            {!result && (
              <button
                onClick={handleGenerate}
                disabled={loading || !jd?.trim()}
                className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-br from-tertiary-container to-tertiary text-on-tertiary font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                {loading ? <Loader size={15} className="animate-spin" /> : <HelpCircle size={15} />}
                {loading ? 'Generating questions…' : 'Generate Interview Questions'}
              </button>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                {/* Tab bar */}
                <div className="flex gap-1 p-1 bg-surface-container rounded-xl overflow-x-auto no-scrollbar">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const count = Array.isArray(tab.data) ? tab.data.length : 0;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${
                          activeTab === tab.id
                            ? 'bg-surface-container-highest text-on-surface shadow-sm'
                            : 'text-on-surface-variant/60 hover:text-on-surface-variant'
                        }`}
                      >
                        <Icon size={12} /> {tab.label}
                        {count > 0 && <span className="opacity-60">({count})</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Questions */}
                <div className="space-y-2">
                  {activeTab === 'behavioral' && result.behavioral?.map((q, i) => (
                    <AccordionItem key={i} question={q.question} defaultOpen={i === 0}>
                      {q.why && (
                        <div className="flex gap-2 text-[0.72rem] text-on-surface-variant">
                          <Lightbulb size={11} className="text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>Why asked:</strong> {q.why}</span>
                        </div>
                      )}
                      {q.hint && (
                        <div className="flex gap-2 text-[0.72rem] text-on-surface-variant">
                          <UserCheck size={11} className="text-primary shrink-0 mt-0.5" />
                          <span><strong>Strong answer:</strong> {q.hint}</span>
                        </div>
                      )}
                      {q.star && (
                        <div className="px-3 py-2 rounded-lg bg-primary/8 text-[0.7rem] text-primary/80">
                          <strong>STAR starter:</strong> {q.star}
                        </div>
                      )}
                    </AccordionItem>
                  ))}

                  {activeTab === 'technical' && result.technical?.map((q, i) => {
                    const diff = DIFFICULTY_STYLE[q.difficulty] || DIFFICULTY_STYLE.medium;
                    return (
                      <AccordionItem key={i} question={q.question} defaultOpen={i === 0}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`tag-pill ${diff.bg} ${diff.color} capitalize`}>{q.difficulty}</span>
                        </div>
                        {q.why && (
                          <div className="flex gap-2 text-[0.72rem] text-on-surface-variant">
                            <Lightbulb size={11} className="text-amber-400 shrink-0 mt-0.5" />
                            <span><strong>Relevance:</strong> {q.why}</span>
                          </div>
                        )}
                        {q.hint && (
                          <div className="flex gap-2 text-[0.72rem] text-on-surface-variant">
                            <Code2 size={11} className="text-primary shrink-0 mt-0.5" />
                            <span><strong>Cover these concepts:</strong> {q.hint}</span>
                          </div>
                        )}
                      </AccordionItem>
                    );
                  })}

                  {activeTab === 'roleSpecific' && result.roleSpecific?.map((q, i) => (
                    <AccordionItem key={i} question={q.question} defaultOpen={i === 0}>
                      {q.context && (
                        <div className="flex gap-2 text-[0.72rem] text-on-surface-variant">
                          <Briefcase size={11} className="text-on-surface-variant/60 shrink-0 mt-0.5" />
                          <span>{q.context}</span>
                        </div>
                      )}
                    </AccordionItem>
                  ))}

                  {activeTab === 'toAsk' && result.questionsToAsk?.map((q, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex gap-3 p-4 rounded-xl bg-surface-container border border-outline-variant/10"
                    >
                      <UserCheck size={14} className="text-tertiary shrink-0 mt-0.5" />
                      <p className="text-[0.82rem] text-on-surface leading-relaxed">{q}</p>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="text-[0.65rem] text-on-surface-variant/50 hover:text-on-surface-variant transition-colors underline underline-offset-2"
                >
                  Regenerate questions
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
