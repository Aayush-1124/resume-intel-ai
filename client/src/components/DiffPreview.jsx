import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, FileText, ArrowRight, GitCompareArrows } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function DiffPreview({ original, tailored, onAccept, onRevert }) {
  const [localTailored, setLocalTailored] = useState(() => JSON.parse(JSON.stringify(tailored)));

  // Count how many things actually changed
  const stats = useMemo(() => {
    let changed = 0, total = 0;
    localTailored.experience?.forEach((exp, i) => {
      exp.bullets?.forEach((b, j) => {
        total++;
        if (b !== original.experience?.[i]?.bullets?.[j]) changed++;
      });
    });
    const skillsChanged = JSON.stringify(localTailored.skills?.technical) !== JSON.stringify(original.skills?.technical);
    return { changed, total, skillsChanged };
  }, [original, localTailored]);

  const handleBulletChange = (expIndex, bulletIndex, newValue) => {
    setLocalTailored(prev => {
      const updatedExp = [...(prev.experience || [])];
      updatedExp[expIndex] = { ...updatedExp[expIndex] };
      updatedExp[expIndex].bullets = [...(updatedExp[expIndex].bullets || [])];
      updatedExp[expIndex].bullets[bulletIndex] = newValue;
      return { ...prev, experience: updatedExp };
    });
  };

  const handleRevertBullet = (expIndex, bulletIndex) => {
    const origVal = original.experience?.[expIndex]?.bullets?.[bulletIndex];
    if (origVal !== undefined) {
      handleBulletChange(expIndex, bulletIndex, origVal);
    }
  };

  // Render a single section column content
  const renderColumn = (data, variant) => {
    const isOptimized = variant === 'optimized';
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-7">
        {/* Skills */}
        {data.skills && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-1 h-4 rounded-full ${isOptimized ? 'bg-emerald-400' : 'bg-on-surface-variant/20'}`} />
              <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                Technical Skills
              </h3>
            </div>
            <div className="space-y-2">
              {data.skills.technical?.map((skill, i) => {
                const origSkill = original.skills?.technical?.[i];
                const isChanged = isOptimized && origSkill !== skill;
                return (
                  <motion.div
                    key={i}
                    initial={isChanged ? { opacity: 0, x: 8 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`text-[0.8rem] leading-relaxed px-3 py-2 rounded-lg transition-colors ${
                      isChanged
                        ? 'bg-emerald-500/8 border border-emerald-500/15 text-on-surface'
                        : 'text-on-surface/70'
                    }`}
                  >
                    {skill}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-1 h-4 rounded-full ${isOptimized ? 'bg-emerald-400' : 'bg-on-surface-variant/20'}`} />
              <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                Experience
              </h3>
            </div>
            <div className="space-y-6">
              {data.experience.map((exp, i) => {
                const origExp = original.experience?.[i] || {};
                return (
                  <div key={i} className="relative">
                    {/* Role header */}
                    <div className="mb-2.5">
                      <div className="font-semibold text-[0.85rem] text-on-surface">{exp.title}</div>
                      <div className="text-[0.7rem] text-on-surface-variant/60 mt-0.5">
                        {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                      </div>
                    </div>

                    {/* Bullets */}
                    <ul className="space-y-2 pl-0">
                      {exp.bullets?.map((bullet, j) => {
                        const origBullet = origExp.bullets?.[j];
                        const isChanged = isOptimized && origBullet && origBullet !== bullet;
                        return (
                          <motion.li
                            key={j}
                            initial={isChanged ? { opacity: 0, x: 8 } : false}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: j * 0.06 }}
                            className={`text-[0.8rem] leading-relaxed flex gap-2 px-3 py-2 rounded-lg transition-all ${
                              isChanged
                                ? 'bg-emerald-500/8 border border-emerald-500/15'
                                : ''
                            }`}
                          >
                            <span className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${
                              isChanged ? 'bg-emerald-400' : 'bg-on-surface-variant/25'
                            }`} />
                            <div className="flex-1 flex flex-col gap-1.5 group/edit">
                              {isChanged ? (
                                <>
                                  <textarea
                                    value={bullet}
                                    onChange={(e) => handleBulletChange(i, j, e.target.value)}
                                    className="w-full bg-transparent text-on-surface resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded px-1 -mx-1 py-1 -my-1"
                                    rows={Math.max(2, Math.ceil(bullet.length / 80))}
                                    aria-label="Edit optimized bullet"
                                  />
                                  <div className="flex items-center gap-3 opacity-0 group-hover/edit:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => handleRevertBullet(i, j)}
                                      className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider text-error/80 hover:text-error transition-colors bg-error/10 px-2 py-1 rounded"
                                      title="Reject this specific change and revert to original"
                                    >
                                      <X size={10} /> Reject Change
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <span className="text-on-surface/70">
                                  {bullet}
                                </span>
                              )}
                            </div>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: 'var(--surface)' }}
    >
      {/* ── Frosted header bar ── */}
      <div className="relative px-6 py-4 flex items-center justify-between border-b border-outline-variant/10"
           style={{ background: 'linear-gradient(to right, var(--surface-container-low), var(--surface))' }}>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GitCompareArrows size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface tracking-tight">
              Review Changes
            </h2>
            <p className="text-[0.65rem] text-on-surface-variant/60 mt-0.5">
              {stats.changed} of {stats.total} bullets optimized{stats.skillsChanged ? ' · Skills updated' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRevert}
            className="px-5 py-2.5 rounded-xl text-[0.75rem] font-semibold flex items-center gap-2 
                       text-on-surface-variant hover:text-error hover:bg-error/5
                       border border-outline-variant/15 hover:border-error/20
                       transition-all duration-200 active:scale-95"
          >
            <X size={14} /> Discard
          </button>
          <button
            onClick={() => onAccept(localTailored)}
            className="px-6 py-2.5 rounded-xl text-[0.75rem] font-bold flex items-center gap-2 
                       text-on-primary bg-gradient-to-br from-primary to-primary-container
                       hover:opacity-90 shadow-lg shadow-primary/20
                       transition-all duration-200 active:scale-95"
          >
            <Check size={14} /> Accept Changes
          </button>
        </div>
      </div>

      {/* ── Two-column diff body ── */}
      <div className="flex-1 overflow-hidden flex gap-0">

        {/* Original column */}
        <div className="flex-1 flex flex-col border-r border-outline-variant/8 overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-2.5 border-b border-outline-variant/8"
               style={{ background: 'var(--surface-container-lowest)' }}>
            <FileText size={13} className="text-on-surface-variant/40" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">
              Original
            </span>
          </div>
          {renderColumn({ skills: original.skills, experience: original.experience }, 'original')}
        </div>

        {/* Optimized column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-2.5 border-b border-emerald-500/10"
               style={{ background: 'rgba(16, 185, 129, 0.03)' }}>
            <Sparkles size={13} className="text-emerald-400" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-emerald-500/70">
              AI Optimized <span className="text-emerald-500/50 lowercase tracking-normal font-medium ml-1">(Click to edit)</span>
            </span>
            <span className="ml-auto px-2 py-0.5 rounded-full text-[0.55rem] font-bold bg-emerald-500/10 text-emerald-500 uppercase tracking-wider">
              {stats.changed} changes
            </span>
          </div>
          {renderColumn({ skills: localTailored.skills, experience: localTailored.experience }, 'optimized')}
        </div>
      </div>
    </motion.div>
  );
}
