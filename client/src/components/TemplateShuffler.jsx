import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { 
  TEMPLATES, ClassicThumb, ModernThumb, MinimalThumb, ExecutiveThumb, TechThumb, CompactThumb 
} from './templateThumbnails.jsx';

export default function TemplateShuffler({ selected, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);

  const shuffle = () => {
    const others = TEMPLATES.filter((t) => t.key !== selected);
    onSelect(others[Math.floor(Math.random() * others.length)].key);
  };

  const renderTemplateBtn = (t) => {
    const isActive = selected === t.key;
    return (
      <button key={t.key}
        onClick={() => {
           onSelect(t.key);
           setIsHovered(false);
        }}
        aria-pressed={isActive}
        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 ${
          isActive
            ? 'text-primary bg-primary/10'
            : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'
        }`}
      >
        <div className="w-8 h-10 rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
          {t.key === 'classic'   && <ClassicThumb />}
          {t.key === 'modern'    && <ModernThumb />}
          {t.key === 'minimal'   && <MinimalThumb />}
          {t.key === 'executive' && <ExecutiveThumb />}
          {t.key === 'tech'      && <TechThumb />}
          {t.key === 'compact'   && <CompactThumb />}
        </div>
        <span className="text-[0.6rem] uppercase tracking-tight font-bold leading-none">{t.label}</span>
      </button>
    );
  };

  return (
    <div
      className="absolute bottom-6 right-6 z-50 flex items-end"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-0 right-[calc(100%+16px)] bg-surface-container-high rounded-[20px] border border-outline-variant/20 shadow-2xl p-3 grid grid-cols-3 gap-2 w-max before:content-[''] before:absolute before:left-full before:top-0 before:w-[30px] before:h-full before:bg-transparent"
          >
            {TEMPLATES.map(renderTemplateBtn)}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={shuffle} whileTap={{ scale: 0.9 }}
        className="glass-panel flex flex-col items-center gap-1.5 p-3 rounded-[24px] border border-outline-variant/20 shadow-2xl text-primary transition-all duration-200 hover:bg-surface-container-highest"
        aria-label="Shuffle to random template">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 shadow-sm border border-primary/20">
          <Shuffle size={18} />
        </div>
        <span className="text-[0.65rem] uppercase tracking-tight font-bold leading-none mb-0.5">Shuffle</span>
      </motion.button>
    </div>
  );
}
