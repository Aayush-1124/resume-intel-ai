import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, PlusCircle, MinusCircle, AlertCircle } from 'lucide-react';
import { sanitizeField, sanitizeBullet } from '../../utils/validation.js';

const newProject = () => ({
  id: crypto.randomUUID(),
  title: '', role: '', link: '',
  bullets: [''],
});

function FieldErr({ msg }) {
  return msg ? (
    <motion.p role="alert" initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 text-error text-xs mt-1.5">
      <AlertCircle size={11} />{msg}
    </motion.p>
  ) : null;
}

const inputCls = (hasErr) =>
  `w-full rounded-xl border border-outline-variant/20 bg-surface-container backdrop-blur-sm px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-on-surface-variant/40 ${hasErr ? 'border-error/50 focus:ring-error/40' : ''}`;

const labelCls = 'text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 block';

export default function ProjectsForm({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState([]);
  const [touched, setTouched] = useState({});

  // Simple validation for projects
  const validate = (list) => {
    return list.map(p => {
      const err = {};
      if (!p.title.trim()) err.title = 'Project Name is required';
      if (!p.bullets.some(b => b.trim())) err.bullets = 'At least one valid bullet is required';
      return Object.keys(err).length ? err : null;
    });
  };

  const hasErrors = (errs) => errs.some(e => e !== null);

  const updateProj = (id, field, val) => {
    const clean = field === 'title' || field === 'role' || field === 'link'
      ? sanitizeField(val, 200) : val;
    const next = data.map((p) => p.id === id ? { ...p, [field]: clean } : p);
    onChange(next);
    if (touched[id]) setErrors(validate(next));
  };

  const updateBullet = (projId, bIdx, val) => {
    const next = data.map((p) =>
      p.id === projId ? { ...p, bullets: p.bullets.map((b, i) => i === bIdx ? sanitizeBullet(val) : b) } : p
    );
    onChange(next);
    if (touched[projId]) setErrors(validate(next));
  };

  const addBullet = (projId) => onChange(data.map((p) => p.id === projId ? { ...p, bullets: [...p.bullets, ''] } : p));
  const removeBullet = (projId, bIdx) => onChange(data.map((p) =>
    p.id === projId ? { ...p, bullets: p.bullets.filter((_, i) => i !== bIdx) } : p
  ));

  const addProj = () => onChange([...data, newProject()]);
  const removeProj = (id) => {
    const next = data.filter((p) => p.id !== id);
    onChange(next);
    setErrors(validate(next));
  };

  const touchAll = () => {
    const t = {};
    data.forEach((p) => { t[p.id] = true; });
    setTouched(t);
  };

  const handleNext = () => {
    touchAll();
    const errs = validate(data);
    setErrors(errs);
    if (!hasErrors(errs)) onNext();
  };

  const getErr = (idx, field) => errors[idx]?.[field];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
      className="max-w-2xl mx-auto space-y-8 px-1">

      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-on-surface">Projects</h1>
        <p className="text-on-surface-variant mt-2 leading-relaxed text-sm sm:text-base">
          Showcase your personal, academic, or open-source projects.
        </p>
      </header>

      <div className="space-y-5">
        {data.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low/60 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <PlusCircle size={28} />
            </div>
            <h3 className="text-lg font-bold text-on-surface">No Projects Added</h3>
            <p className="text-sm text-on-surface-variant max-w-sm mt-2">Add your notable projects to demonstrate your skills in action.</p>
          </motion.div>
        )}
        <AnimatePresence>
          {data.map((proj, idx) => (
            <motion.div key={proj.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className="rounded-2xl border border-outline-variant/10 bg-surface-container-low/80 backdrop-blur-sm p-5 sm:p-6 space-y-5"
            >
              <div className="flex justify-between items-center">
                <span className="text-[0.6875rem] uppercase tracking-widest text-primary font-semibold">Project {idx + 1}</span>
                <button onClick={() => removeProj(proj.id)}
                  className="flex items-center justify-center gap-1.5 text-error text-[0.6875rem] font-bold uppercase tracking-widest hover:bg-error/10 h-9 px-3 rounded-xl transition-colors"
                  aria-label={`Remove project ${idx + 1}`}>
                  <Trash2 size={13} /> Remove
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Title */}
                <div>
                  <label htmlFor={`title-${proj.id}`} className={labelCls}>
                    Project Name <span className="text-error">*</span>
                  </label>
                  <input id={`title-${proj.id}`} value={proj.title}
                    onChange={(e) => updateProj(proj.id, 'title', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, [proj.id]: true }))}
                    placeholder="e.g. E-Commerce Platform" maxLength={150}
                    className={inputCls(getErr(idx, 'title'))} />
                  <FieldErr msg={getErr(idx, 'title')} />
                </div>
                {/* Role */}
                <div>
                  <label htmlFor={`role-${proj.id}`} className={labelCls}>Role / Subtitle</label>
                  <input id={`role-${proj.id}`} value={proj.role}
                    onChange={(e) => updateProj(proj.id, 'role', e.target.value)}
                    placeholder="e.g. Full-Stack Developer" maxLength={150}
                    className={inputCls(false)} />
                </div>
                {/* Link */}
                <div className="sm:col-span-2">
                  <label htmlFor={`link-${proj.id}`} className={labelCls}>Project URL (optional)</label>
                  <input id={`link-${proj.id}`} value={proj.link}
                    onChange={(e) => updateProj(proj.id, 'link', e.target.value)}
                    placeholder="https://github.com/yourusername/project" maxLength={200}
                    className={inputCls(false)} />
                </div>
              </div>

              {/* Bullets */}
              <div>
                <label className={`${labelCls} mb-3`}>Bullet Points <span className="text-error">*</span></label>
                <div className="space-y-2">
                  {proj.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex gap-2 items-start">
                      <span className="text-primary mt-3.5 text-xs font-bold shrink-0">▸</span>
                      <textarea rows={2} value={bullet} maxLength={500}
                        onChange={(e) => updateBullet(proj.id, bIdx, e.target.value)}
                        placeholder="Built scalable backend API using Node.js and MongoDB..."
                        className={`${inputCls(false)} resize-none flex-1`}
                        aria-label={`Bullet ${bIdx + 1} for ${proj.title || 'project'}`} />
                      {proj.bullets.length > 1 && (
                        <button onClick={() => removeBullet(proj.id, bIdx)}
                          className="mt-1 w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-colors shrink-0"
                          aria-label={`Remove bullet ${bIdx + 1}`}>
                          <MinusCircle size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <FieldErr msg={getErr(idx, 'bullets')} />
                <button onClick={() => addBullet(proj.id)}
                  className="mt-2 text-primary text-xs font-bold uppercase tracking-widest flex items-center justify-center h-10 px-3 -ml-3 gap-2 hover:bg-primary/10 rounded-xl transition-colors w-fit"
                  aria-label="Add bullet point">
                  <PlusCircle size={14} /> Add Bullet
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button onClick={addProj}
        className="w-full py-4 border border-dashed border-outline-variant/30 rounded-2xl text-on-surface-variant hover:bg-surface-container/60 hover:text-primary transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
        aria-label="Add another project">
        <Plus size={16} />
        <span className="text-xs uppercase font-bold tracking-widest">Add Another Project</span>
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
        <button onClick={onBack} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-surface-container-high text-on-surface font-medium text-sm active:scale-95 hover:bg-surface-container-highest transition-all">← Back</button>
        <button onClick={handleNext} className="w-full sm:w-auto px-10 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm active:scale-95 shadow-lg hover:opacity-90 transition-all">Next Step →</button>
      </div>
    </motion.div>
  );
}
