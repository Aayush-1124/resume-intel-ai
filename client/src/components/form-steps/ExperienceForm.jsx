import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, PlusCircle, MinusCircle, AlertCircle } from 'lucide-react';
import { validateExperience, hasErrors } from '../../utils/validation.js';
import { sanitizeField, sanitizeBullet } from '../../utils/validation.js';

const newExp = () => ({
  id: crypto.randomUUID(),
  title: '', company: '', location: '',
  startDate: '', endDate: '', current: false,
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

export default function ExperienceForm({ data, onChange, onNext, onBack }) {
  const [errors,  setErrors]  = useState([]);
  const [touched, setTouched] = useState({});

  const validate = (list) => validateExperience(list);

  const updateExp = (id, field, val) => {
    const clean = field === 'title' || field === 'company' || field === 'location'
      ? sanitizeField(val, 150) : val;
    const next = data.map((e) => e.id === id ? { ...e, [field]: clean } : e);
    onChange(next);
    if (touched[id]) setErrors(validate(next));
  };

  const updateBullet = (expId, bIdx, val) => {
    const next = data.map((e) =>
      e.id === expId ? { ...e, bullets: e.bullets.map((b, i) => i === bIdx ? sanitizeBullet(val) : b) } : e
    );
    onChange(next);
    if (touched[expId]) setErrors(validate(next));
  };

  const addBullet = (expId) => onChange(data.map((e) => e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e));
  const removeBullet = (expId, bIdx) => onChange(data.map((e) =>
    e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== bIdx) } : e
  ));

  const addExp  = () => onChange([...data, newExp()]);
  const removeExp = (id) => {
    const next = data.filter((e) => e.id !== id);
    onChange(next);
    setErrors(validate(next));
  };

  const touchAll = () => {
    const t = {};
    data.forEach((e) => { t[e.id] = true; });
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
      className="max-w-2xl mx-auto space-y-10">

      <header>
        <h1 className="text-3xl font-bold tracking-tighter text-on-surface">Professional Experience</h1>
        <p className="text-on-surface-variant mt-2 leading-relaxed">
          Quantify your impact. Strong verbs + measurable results = ATS gold.
        </p>
      </header>

      <div className="space-y-6">
        <AnimatePresence>
          {data.map((exp, idx) => (
            <motion.div key={exp.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className="glass-panel p-8 rounded-xl border border-outline-variant/10 space-y-5"
            >
              <div className="flex justify-between items-center">
                <span className="text-[0.6875rem] uppercase tracking-widest text-primary font-medium">Position {idx + 1}</span>
                {data.length > 1 && (
                  <button onClick={() => removeExp(exp.id)}
                    className="flex items-center gap-1 text-error text-xs font-bold uppercase tracking-widest hover:opacity-70"
                    aria-label={`Remove position ${idx + 1}`}>
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>

              {/* Title */}
              <div>
                <label htmlFor={`title-${exp.id}`} className="label-style">
                  Job Title <span className="text-error">*</span>
                </label>
                <input id={`title-${exp.id}`} value={exp.title}
                  onChange={(e) => updateExp(exp.id, 'title', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, [exp.id]: true }))}
                  placeholder="e.g. Senior Software Engineer" maxLength={150}
                  className={`field-input ${getErr(idx,'title') ? 'error-ring' : ''}`} />
                <FieldErr msg={getErr(idx, 'title')} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Company */}
                <div>
                  <label htmlFor={`company-${exp.id}`} className="label-style">Company <span className="text-error">*</span></label>
                  <input id={`company-${exp.id}`} value={exp.company}
                    onChange={(e) => updateExp(exp.id, 'company', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, [exp.id]: true }))}
                    placeholder="e.g. Stripe" maxLength={150}
                    className={`field-input ${getErr(idx,'company') ? 'error-ring' : ''}`} />
                  <FieldErr msg={getErr(idx, 'company')} />
                </div>
                {/* Location */}
                <div>
                  <label htmlFor={`loc-${exp.id}`} className="label-style">Location</label>
                  <input id={`loc-${exp.id}`} value={exp.location}
                    onChange={(e) => updateExp(exp.id, 'location', e.target.value)}
                    placeholder="Remote / New York, NY" maxLength={100}
                    className="field-input" />
                </div>
                {/* Start date */}
                <div>
                  <label htmlFor={`start-${exp.id}`} className="label-style">Start Date <span className="text-error">*</span></label>
                  <input id={`start-${exp.id}`} value={exp.startDate}
                    onChange={(e) => updateExp(exp.id, 'startDate', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, [exp.id]: true }))}
                    placeholder="Jan 2022" maxLength={20}
                    className={`field-input ${getErr(idx,'startDate') ? 'error-ring' : ''}`} />
                  <FieldErr msg={getErr(idx, 'startDate')} />
                </div>
                {/* End date */}
                <div>
                  <label htmlFor={`end-${exp.id}`} className="label-style">End Date {!exp.current && <span className="text-error">*</span>}</label>
                  <input id={`end-${exp.id}`} value={exp.current ? 'Present' : exp.endDate}
                    disabled={exp.current}
                    onChange={(e) => updateExp(exp.id, 'endDate', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, [exp.id]: true }))}
                    placeholder="Dec 2023" maxLength={20}
                    className={`field-input ${exp.current ? 'opacity-40' : ''} ${getErr(idx,'endDate') ? 'error-ring' : ''}`} />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={!!exp.current} className="accent-primary-container"
                      onChange={(e) => {
                        updateExp(exp.id, 'current', e.target.checked);
                        if (e.target.checked) updateExp(exp.id, 'endDate', 'Present');
                      }}
                      aria-label="Currently working here" />
                    <span className="text-xs text-on-surface-variant">Currently working here</span>
                  </label>
                  <FieldErr msg={getErr(idx, 'endDate')} />
                </div>
              </div>

              {/* Bullets */}
              <div>
                <label className="label-style mb-3 block">Bullet Points <span className="text-error">*</span></label>
                <div className="space-y-2">
                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex gap-2 items-start">
                      <span className="text-primary mt-3.5 text-xs font-bold shrink-0">▸</span>
                      <textarea rows={2} value={bullet} maxLength={500}
                        onChange={(e) => updateBullet(exp.id, bIdx, e.target.value)}
                        placeholder="Led migration to microservices, reducing API latency by 40%..."
                        className="field-input resize-none flex-1"
                        aria-label={`Bullet ${bIdx + 1} for ${exp.title || 'position'}`} />
                      {exp.bullets.length > 1 && (
                        <button onClick={() => removeBullet(exp.id, bIdx)}
                          className="mt-2 text-on-surface-variant hover:text-error transition-colors"
                          aria-label={`Remove bullet ${bIdx + 1}`}>
                          <MinusCircle size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <FieldErr msg={getErr(idx, 'bullets')} />
                <button onClick={() => addBullet(exp.id)}
                  className="mt-3 text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-70"
                  aria-label="Add bullet point">
                  <PlusCircle size={14} /> Add Bullet
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button onClick={addExp}
        className="w-full py-4 border border-dashed border-outline-variant/30 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all flex items-center justify-center gap-2"
        aria-label="Add another position">
        <Plus size={16} />
        <span className="text-xs uppercase font-bold tracking-widest">Add Another Position</span>
      </button>

      <div className="flex justify-between items-center pt-4">
        <button onClick={onBack} className="px-8 py-3 rounded-xl bg-surface-container-high text-on-surface font-medium text-sm active:scale-95 hover:bg-surface-container-highest">← Back</button>
        <button onClick={handleNext} className="px-10 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm active:scale-95 shadow-lg hover:opacity-90">Next Step →</button>
      </div>
    </motion.div>
  );
}
