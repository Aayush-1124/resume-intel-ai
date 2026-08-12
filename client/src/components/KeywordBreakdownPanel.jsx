import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, CheckCircle, XCircle,
  Code2, Layers, Wrench, Lightbulb, HelpCircle, Loader,
} from 'lucide-react';
import { api } from '../utils/api.js';

const CATEGORY_META = {
  Languages:              { icon: Code2,      color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
  'Frameworks & Libraries': { icon: Layers,   color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  'Tools & Platforms':    { icon: Wrench,     color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  Concepts:               { icon: Lightbulb,  color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/20'   },
};

function CategorySection({ title, items, isMatch }) {
  const [open, setOpen] = useState(true);
  const meta = CATEGORY_META[title] || { icon: HelpCircle, color: 'text-on-surface-variant', bg: 'bg-surface-container', border: 'border-outline-variant/20' };
  const Icon = meta.icon;

  if (!items.length) return null;

  return (
    <div className={`rounded-xl border ${meta.border} overflow-hidden`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 ${meta.bg} transition-colors hover:opacity-90`}
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className={meta.color} />
          <span className={`text-[0.65rem] font-bold uppercase tracking-widest ${meta.color}`}>{title}</span>
          <span className={`tag-pill ${meta.bg} ${meta.color} border ${meta.border}`}>{items.length}</span>
        </div>
        {open ? <ChevronDown size={14} className="text-on-surface-variant/50" /> : <ChevronRight size={14} className="text-on-surface-variant/50" />}
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
            <div className="p-3 space-y-2">
              {items.map((item, i) => (
                <motion.div
                  key={item.keyword}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex gap-3 items-start"
                >
                  {isMatch
                    ? <CheckCircle size={13} className="text-tertiary shrink-0 mt-0.5" />
                    : <XCircle    size={13} className="text-error shrink-0 mt-0.5" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[0.78rem] font-semibold text-on-surface capitalize">{item.keyword}</span>
                      <span className={`tag-pill ${meta.bg} ${meta.color}`}>{title}</span>
                    </div>
                    {item.why && (
                      <p className="text-[0.7rem] text-on-surface-variant/70 mt-0.5 leading-relaxed">{item.why}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function KeywordBreakdownPanel({ resumeData, jd }) {
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [activeTab, setActiveTab] = useState('missing');

  const fetchBreakdown = async () => {
    if (!jd?.trim()) { setError('Paste a job description first to see keyword details.'); return; }
    setError(''); setLoading(true);
    try {
      const data = await api.keywordExplain(resumeData, jd);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalMissing = result
    ? Object.values(result.missing).reduce((s, a) => s + a.length, 0)
    : 0;
  const totalMatched = result
    ? Object.values(result.matched).reduce((s, a) => s + a.length, 0)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-on-surface">Keyword Breakdown</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            See exactly which JD keywords you have and why each one matters
          </p>
        </div>
        {!result && (
          <button
            onClick={fetchBreakdown}
            disabled={loading || !jd?.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <Loader size={13} className="animate-spin" /> : <Lightbulb size={13} />}
            {loading ? 'Analyzing…' : 'Analyze Keywords'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-xs text-error flex items-center gap-1.5">
            <XCircle size={13} /> {error}
          </motion.p>
        )}
      </AnimatePresence>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('matched')}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                activeTab === 'matched'
                  ? 'border-tertiary/30 bg-tertiary/8'
                  : 'border-outline-variant/10 bg-surface-container hover:border-tertiary/20'
              }`}
            >
              <span className="text-2xl font-black text-tertiary">{totalMatched}</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-widest text-tertiary/70 mt-0.5">Keywords Found</span>
            </button>
            <button
              onClick={() => setActiveTab('missing')}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                activeTab === 'missing'
                  ? 'border-error/30 bg-error/8'
                  : 'border-outline-variant/10 bg-surface-container hover:border-error/20'
              }`}
            >
              <span className="text-2xl font-black text-error">{totalMissing}</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-widest text-error/70 mt-0.5">Keywords Missing</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-outline-variant/15">
            {['missing', 'matched'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${
                  activeTab === tab
                    ? tab === 'missing' ? 'text-error border-error' : 'text-tertiary border-tertiary'
                    : 'text-on-surface-variant/50 border-transparent hover:text-on-surface-variant'
                }`}
              >
                {tab === 'missing' ? `Missing (${totalMissing})` : `Matched (${totalMatched})`}
              </button>
            ))}
          </div>

          {/* Category sections */}
          <div className="space-y-3">
            {Object.entries(activeTab === 'missing' ? result.missing : result.matched).map(([cat, items]) => (
              <CategorySection key={cat} title={cat} items={items} isMatch={activeTab === 'matched'} />
            ))}
          </div>

          {/* Re-analyze button */}
          <button
            onClick={() => { setResult(null); }}
            className="text-[0.65rem] text-on-surface-variant/50 hover:text-on-surface-variant transition-colors underline underline-offset-2"
          >
            Re-analyze
          </button>
        </motion.div>
      )}
    </div>
  );
}
