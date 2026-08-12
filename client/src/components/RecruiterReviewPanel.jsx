import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Loader, AlertCircle, CheckCircle,
  ThumbsUp, ThumbsDown, Zap, TrendingUp, Star,
} from 'lucide-react';
import { api } from '../utils/api.js';

const STATUS_STYLE = {
  'strong':     { color: 'text-tertiary',  bg: 'bg-tertiary/10',  label: '✓ Strong'    },
  'good':       { color: 'text-primary',   bg: 'bg-primary/10',   label: '~ Good'      },
  'needs-work': { color: 'text-amber-400', bg: 'bg-amber-500/10', label: '! Needs Work' },
  'missing':    { color: 'text-error',     bg: 'bg-error/10',     label: '✗ Missing'   },
};

export default function RecruiterReviewPanel({ resumeData, jd }) {
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleReview = async () => {
    setError(''); setLoading(true);
    try {
      const data = await api.recruiterReview(resumeData, jd);
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

  const scoreColor = result
    ? result.score >= 8 ? 'text-tertiary' : result.score >= 6 ? 'text-primary' : 'text-amber-400'
    : 'text-on-surface';

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <UserCheck size={16} className="text-primary" />
            AI Recruiter Review
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Honest, qualitative feedback from a simulated senior recruiter perspective.
            {jd ? ' Tailored to your target job.' : ' Add a JD above for role-specific feedback.'}
          </p>
        </div>

        {!result && (
          <button
            onClick={handleReview}
            disabled={loading}
            className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-br from-primary-container to-primary text-on-primary text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {loading ? <Loader size={13} className="animate-spin" /> : <UserCheck size={13} />}
            {loading ? 'Reviewing…' : 'Get Review'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-xs text-error flex items-center gap-1.5">
            <AlertCircle size={13} /> {error}
          </motion.p>
        )}
      </AnimatePresence>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* Verdict + score */}
          <div className="glass-panel rounded-xl p-5 border border-outline-variant/10 flex gap-5 items-start">
            <div className="shrink-0 text-center">
              <div className={`text-4xl font-black ${scoreColor}`}>{result.score}</div>
              <div className="text-[0.55rem] uppercase tracking-widest text-on-surface-variant/60 mt-0.5">/ 10</div>
              <div className="flex mt-1.5 gap-0.5">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`h-1 w-2 rounded-full ${i < result.score ? 'bg-primary' : 'bg-surface-container-high'}`} />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[0.78rem] leading-relaxed text-on-surface font-medium italic">
                "{result.overallVerdict}"
              </p>
            </div>
          </div>

          {/* Top priority */}
          {result.topPriority && (
            <div className="flex gap-3 p-4 rounded-xl bg-primary/8 border border-primary/15">
              <TrendingUp size={15} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[0.6rem] font-bold uppercase tracking-widest text-primary mb-1">Top Priority</p>
                <p className="text-[0.8rem] text-on-surface leading-relaxed">{result.topPriority}</p>
              </div>
            </div>
          )}

          {/* Section feedback */}
          {result.sections?.length > 0 && (
            <div className="space-y-3">
              <p className="section-header">Section-by-section feedback</p>
              {result.sections.map((sec, i) => {
                const style = STATUS_STYLE[sec.status] || STATUS_STYLE['good'];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="p-4 rounded-xl bg-surface-container border border-outline-variant/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[0.78rem] font-semibold text-on-surface">{sec.title}</span>
                      <span className={`tag-pill ${style.bg} ${style.color}`}>{style.label}</span>
                    </div>
                    <p className="text-[0.75rem] text-on-surface-variant leading-relaxed">{sec.feedback}</p>
                    {sec.tip && (
                      <div className="flex gap-2 pt-1">
                        <Zap size={11} className="text-primary shrink-0 mt-0.5" />
                        <p className="text-[0.7rem] text-primary/80 leading-relaxed">{sec.tip}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.greenFlags?.length > 0 && (
              <div className="p-4 rounded-xl bg-tertiary/6 border border-tertiary/15 space-y-2">
                <div className="flex items-center gap-1.5">
                  <ThumbsUp size={13} className="text-tertiary" />
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest text-tertiary">Green Flags</span>
                </div>
                <ul className="space-y-1.5">
                  {result.greenFlags.map((f, i) => (
                    <li key={i} className="flex gap-2 text-[0.75rem] text-on-surface-variant">
                      <CheckCircle size={11} className="text-tertiary shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.redFlags?.length > 0 && (
              <div className="p-4 rounded-xl bg-error/6 border border-error/15 space-y-2">
                <div className="flex items-center gap-1.5">
                  <ThumbsDown size={13} className="text-error" />
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest text-error">Watch Out</span>
                </div>
                <ul className="space-y-1.5">
                  {result.redFlags.map((f, i) => (
                    <li key={i} className="flex gap-2 text-[0.75rem] text-on-surface-variant">
                      <AlertCircle size={11} className="text-error shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Re-run */}
          <button
            onClick={() => { setResult(null); }}
            className="text-[0.65rem] text-on-surface-variant/50 hover:text-on-surface-variant transition-colors underline underline-offset-2"
          >
            Re-run review
          </button>
        </motion.div>
      )}
    </div>
  );
}
