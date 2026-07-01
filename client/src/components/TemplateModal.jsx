import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { 
  TEMPLATES as BASE_TEMPLATES, 
  ClassicThumb, ModernThumb, MinimalThumb, ExecutiveThumb, TechThumb, CompactThumb 
} from './templateThumbnails.jsx';

const ACCENTS = {
  classic: '#4F46E5',
  modern: '#1d00a5',
  minimal: '#191c1e',
  executive: '#0f172a',
  tech: '#38bdf8',
  compact: '#111111',
};

const TEMPLATES = BASE_TEMPLATES.map(t => ({
  ...t,
  accent: ACCENTS[t.key]
}));

export default function TemplateModal({ isOpen, onClose, selected, onSelect }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface-container-high rounded-3xl shadow-2xl border border-outline-variant/30 p-8 custom-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-surface-container-high z-10 pt-2 pb-4 border-b border-outline-variant/10">
              <div>
                <h2 className="text-2xl font-extrabold text-on-surface tracking-tight mb-1">
                  Choose your Template
                </h2>
                <p className="text-on-surface-variant/80 text-sm font-medium">
                  Select a layout that best represents your professional brand. You can change this later.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TEMPLATES.map((t) => {
                const isActive = selected === t.key;
                return (
                  <motion.div
                    key={t.key}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelect(t.key);
                      setTimeout(onClose, 300); // close automatically after a short delay
                    }}
                    className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-300 ${
                      isActive
                        ? 'bg-primary-container/30 border-2 border-primary shadow-lg shadow-primary/20'
                        : 'bg-surface border-2 border-transparent hover:border-outline-variant/50 hover:shadow-md'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-badge"
                        className="absolute -top-3 -right-3 bg-primary text-on-primary rounded-full p-1"
                      >
                        <CheckCircle2 size={24} className="fill-primary" style={{ color: 'var(--on-primary)' }} />
                      </motion.div>
                    )}

                    {/* Preview Image / SVG */}
                    <div
                      className="w-full aspect-[1/1.4] bg-white rounded-xl overflow-hidden mb-4 shadow-sm border border-black/5"
                    >
                      {t.key === 'classic'   && <ClassicThumb />}
                      {t.key === 'modern'    && <ModernThumb />}
                      {t.key === 'minimal'   && <MinimalThumb />}
                      {t.key === 'executive' && <ExecutiveThumb />}
                      {t.key === 'tech'      && <TechThumb />}
                      {t.key === 'compact'   && <CompactThumb />}
                    </div>

                    <div className="text-center">
                      <h3 className="text-md font-bold text-on-surface tracking-wide mb-0.5">
                        {t.label}
                      </h3>
                      <p className="text-[0.65rem] uppercase tracking-wider font-semibold text-on-surface-variant opacity-70">
                        {t.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
