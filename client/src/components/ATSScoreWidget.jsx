import { motion } from 'framer-motion';

export default function ATSScoreWidget({ score }) {
  if (score === null || score === undefined) return null;

  const r      = 18;
  const circum = 2 * Math.PI * r;
  const offset = circum * (1 - score / 100);

  const color = score >= 75 ? 'var(--tertiary)' : score >= 50 ? 'var(--primary)' : 'var(--error)';
  const trackColor = score >= 75 ? 'rgba(78,222,163,0.15)' : score >= 50 ? 'rgba(195,192,255,0.15)' : 'rgba(255,180,171,0.15)';
  const label = score >= 75 ? 'Strong Match' : score >= 50 ? 'Good Potential' : 'Needs Work';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute top-3 right-3 sm:top-5 sm:right-5 glass-panel py-2 px-3 sm:px-4 rounded-full border border-outline-variant/20 flex items-center gap-2 sm:gap-3 shadow-lg max-w-[90vw] overflow-hidden"
      style={{ backdropFilter: 'blur(16px)', zIndex: 10 }}
      role="status"
      aria-label={`ATS Score: ${score}% — ${label}`}
    >
      {/* Ring */}
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={r} fill="transparent" stroke={trackColor} strokeWidth="3.5" />
          <motion.circle cx="20" cy="20" r={r} fill="transparent"
            stroke={color} strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray={circum}
            initial={{ strokeDashoffset: circum }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <span className="absolute text-[9px] font-black" style={{ color }}>{score}</span>
      </div>

      {/* Text */}
      <div>
        <p className="text-[0.6rem] uppercase font-bold tracking-widest text-on-surface-variant leading-none mb-0.5">ATS Score</p>
        <p className="text-[0.65rem] font-semibold leading-none" style={{ color }}>{label}</p>
      </div>
    </motion.div>
  );
}
