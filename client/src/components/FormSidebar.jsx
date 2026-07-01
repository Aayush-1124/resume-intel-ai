import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, GraduationCap, Brain, Wand2, Download } from 'lucide-react';

const STEPS = [
  { key: 'personal',   label: 'Personal Info', icon: User },
  { key: 'experience', label: 'Experience',    icon: Briefcase },
  { key: 'education',  label: 'Education',     icon: GraduationCap },
  { key: 'skills',     label: 'Skills',        icon: Brain },
  { key: 'optimizer',  label: 'AI Optimizer',  icon: Wand2 },
];

export default function FormSidebar({ currentStep, onStepChange, onDownloadPdf, onDownloadDoc }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  return (
    <aside
      className="w-60 h-full bg-background flex flex-col gap-2 p-4 pt-8 shrink-0 overflow-y-auto custom-scrollbar"
      style={{ borderRight: '1px solid rgba(70,69,85,0.18)' }}
      aria-label="Resume builder navigation"
    >
      {/* Progress header */}
      <div className="px-3 mb-6 shrink-0">
        <h2 className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          Resume Builder
        </h2>
        <p className="text-xs mt-1 text-primary opacity-70">
          Step {currentIndex + 1} of {STEPS.length}
        </p>
        <div className="mt-3 h-1 bg-surface-container-low rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--primary-container), var(--primary))' }}
            animate={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Steps */}
      <nav className="flex flex-col gap-1 shrink-0" role="tablist" aria-label="Resume sections">
        {STEPS.map((step, idx) => {
          const Icon        = step.icon;
          const isActive    = step.key === currentStep;
          const isCompleted = idx < currentIndex;

          return (
            <motion.button
              key={step.key}
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to ${step.label}`}
              onClick={() => onStepChange(step.key)}
              whileHover={!isActive ? { x: 3 } : {}}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium uppercase tracking-widest w-full text-left transition-all duration-200"
              style={{
                background:  isActive ? 'var(--surface-container)' : 'transparent',
                color:       isActive ? 'var(--primary)' : isCompleted ? 'var(--tertiary)' : 'var(--on-surface)',
                opacity:     isActive ? 1 : isCompleted ? 0.85 : 0.45,
                borderLeft:  isActive ? '3px solid var(--primary-container)' : '3px solid transparent',
                transform:   isActive ? 'translateX(3px)' : undefined,
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.opacity = isCompleted ? '0.85' : '0.45'; }}
            >
              <Icon
                size={16}
                aria-hidden="true"
                style={{ color: isActive ? 'var(--primary)' : isCompleted ? 'var(--tertiary)' : 'var(--on-surface-variant)', flexShrink: 0 }}
              />
              <span className="truncate">{step.label}</span>
              {isCompleted && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: 'var(--tertiary)' }}
                  aria-label="Completed"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Export Options */}
      <div className="mt-auto pt-6 px-3 flex flex-col gap-2 shrink-0 relative">
        <button
          onClick={() => setShowDownloadMenu(!showDownloadMenu)}
          className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 transition-all hover:opacity-90 relative z-10"
          style={{
            background: 'linear-gradient(135deg, var(--primary-container), var(--primary))',
            color: 'var(--on-primary)',
            boxShadow: '0 4px 20px -4px rgba(79,70,229,0.4)',
          }}
          aria-label="Download options"
        >
          <Download size={15} aria-hidden="true" />
          Download
        </button>

        <AnimatePresence>
          {showDownloadMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-surface-container-high rounded-xl border border-outline-variant/20 shadow-2xl p-2 flex flex-col gap-1 z-20"
            >
              <button
                onClick={() => { setShowDownloadMenu(false); onDownloadPdf(); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-2"
              >
                Download PDF
              </button>
              <button
                onClick={() => { setShowDownloadMenu(false); onDownloadDoc(); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-2"
              >
                Download DOC
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
