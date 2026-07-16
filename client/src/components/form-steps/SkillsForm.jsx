import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { sanitizeField } from '../../utils/validation.js';

const SUGGESTIONS = {
  technical: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'Redis', 'Git', 'CI/CD', 'GraphQL', 'Kubernetes'],
  languages: ['JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Ruby', 'Swift', 'Kotlin', 'PHP'],
  soft: ['Leadership', 'Agile', 'Communication', 'Problem-solving', 'Mentoring', 'Project Management'],
  certifications: ['AWS Solutions Architect', 'PMP', 'CKA', 'GCP Professional', 'Azure Administrator'],
};

const COLOR_MAP = {
  primary:   'bg-primary/10 text-primary border-primary/20',
  tertiary:  'bg-tertiary/10 text-tertiary border-tertiary/20',
  secondary: 'bg-secondary/10 text-secondary border-secondary/20',
  error:     'bg-error/10 text-error border-error/20',
};

function TagInput({ label, tags, onAdd, onRemove, placeholder, color = 'primary', suggestions = [] }) {
  const [input, setInput] = useState('');

  const commit = (val) => {
    const clean = sanitizeField(val, 80);
    if (clean && !tags.includes(clean)) { onAdd(clean); }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      commit(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) onRemove(tags.length - 1);
  };

  const unused = suggestions.filter((s) => !tags.includes(s));

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 block">{label}</label>

      {/* Tag chip container */}
      <div className="min-h-[3rem] rounded-xl border border-outline-variant/20 bg-surface-container backdrop-blur-sm p-3 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/50 transition-all">
        <AnimatePresence>
          {tags.map((tag, i) => (
            <motion.span key={tag + i}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${COLOR_MAP[color]}`}
            >
              {tag}
              <button onClick={() => onRemove(i)} aria-label={`Remove ${tag}`} className="hover:opacity-60 transition-opacity p-2 -mr-2 -my-2 flex items-center justify-center min-w-[32px] min-h-[32px]">
                <X size={10} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input.trim() && commit(input)}
          placeholder={tags.length === 0 ? placeholder : '+ add more'}
          maxLength={80}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-on-surface-variant/40"
          aria-label={`Add ${label}`}
        />
      </div>
      <p className="text-[0.65rem] text-on-surface-variant/50 mt-1.5">Press Enter or comma to add</p>

      {/* Quick-add suggestions */}
      {unused.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {unused.slice(0, 7).map((s) => (
            <button key={s} onClick={() => commit(s)}
              className="px-2.5 py-1 bg-surface-container/60 backdrop-blur-sm text-on-surface-variant text-[0.68rem] rounded-full border border-outline-variant/10 hover:bg-surface-container-high hover:text-primary transition-all"
              aria-label={`Add ${s}`}>
              <Plus size={9} className="inline mr-0.5" />{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SkillsForm({ data, onChange, onNext, onBack }) {
  const update  = (field) => (tags) => onChange({ ...data, [field]: tags });
  const addTag  = (field) => (tag) => { if (!data[field].includes(tag)) update(field)([...data[field], tag]); };
  const removeTag = (field) => (idx) => update(field)(data[field].filter((_, i) => i !== idx));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
      className="max-w-2xl mx-auto space-y-8 px-1">

      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-on-surface">Skills &amp; Competencies</h1>
        <p className="text-on-surface-variant mt-2 leading-relaxed text-sm sm:text-base">
          Keywords that bypass ATS filters. Be specific and comprehensive.
        </p>
      </header>

      <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low/80 backdrop-blur-sm p-5 sm:p-6 space-y-7">
        <TagInput label="Technical Skills"
          tags={data.technical || []} onAdd={addTag('technical')} onRemove={removeTag('technical')}
          placeholder="React, Node.js, Python, AWS…" color="primary" suggestions={SUGGESTIONS.technical} />

        <TagInput label="Languages &amp; Frameworks"
          tags={data.languages || []} onAdd={addTag('languages')} onRemove={removeTag('languages')}
          placeholder="TypeScript, GraphQL, Docker…" color="tertiary" suggestions={SUGGESTIONS.languages} />

        <TagInput label="Soft Skills"
          tags={data.soft || []} onAdd={addTag('soft')} onRemove={removeTag('soft')}
          placeholder="Leadership, Agile, Communication…" color="secondary" suggestions={SUGGESTIONS.soft} />

        <TagInput label="Certifications"
          tags={data.certifications || []} onAdd={addTag('certifications')} onRemove={removeTag('certifications')}
          placeholder="AWS Solutions Architect, PMP…" color="error" suggestions={SUGGESTIONS.certifications} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
        <button onClick={onBack} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-surface-container-high text-on-surface font-medium text-sm active:scale-95 hover:bg-surface-container-highest transition-all">← Back</button>
        <button onClick={onNext} className="w-full sm:w-auto px-10 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm active:scale-95 shadow-lg hover:opacity-90 transition-all">Next Step →</button>
      </div>
    </motion.div>
  );
}
