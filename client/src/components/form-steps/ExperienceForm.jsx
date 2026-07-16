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

const inputCls = (hasErr) =>
  `w-full rounded-xl border border-outline-variant/20 bg-surface-container/50 backdrop-blur-sm px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-on-surface-variant/40 ${hasErr ? 'border-error/50 focus:ring-error/40' : ''}`;

const labelCls = 'text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 block';

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
      className="max-w-2xl mx-auto space-y-8 px-1">

      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-on-surface">Professional Experience</h1>
        <p className="text-on-surface-variant mt-2 leading-relaxed text-sm sm:text-base">
          Quantify your impact. Strong verbs + measurable results = ATS gold.
        </p>
      </header>

      <div className="space-y-5">
        {data.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low/60 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <PlusCircle size={28} />
            </div>
            <h3 className="text-lg font-bold text-on-surface">No Experience Added</h3>
            <p className="text-sm text-on-surface-variant max-w-sm mt-2">Add your past work experience to showcase your career progression and impact.</p>
          </motion.div>
        )}
        <AnimatePresence>
          {data.map((exp, idx) => (
            <motion.div key={exp.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className="rounded-2xl border border-outline-variant/10 bg-surface-container-low/80 backdrop-blur-sm p-5 sm:p-6 space-y-5"
            >
              <div className="flex justify-between items-center">
                <span className="text-[0.6875rem] uppercase tracking-widest text-primary font-semibold">Position {idx + 1}</span>
                {data.length > 1 && (
                  <button onClick={() => removeExp(exp.id)}
                    className="flex items-center justify-center gap-1.5 text-error text-[0.6875rem] font-bold uppercase tracking-widest hover:bg-error/10 h-9 px-3 rounded-xl transition-colors"
                    aria-label={`Remove position ${idx + 1}`}>
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>

              {/* Title */}
              <div>
                <label htmlFor={`title-${exp.id}`} className={labelCls}>
                  Job Title <span className="text-error">*</span>
                </label>
                <input id={`title-${exp.id}`} value={exp.title}
                  onChange={(e) => updateExp(exp.id, 'title', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, [exp.id]: true }))}
                  placeholder="e.g. Senior Software Engineer" maxLength={150}
                  className={inputCls(getErr(idx, 'title'))} />
                <FieldErr msg={getErr(idx, 'title')} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Company */}
                <div>
                  <label htmlFor={`company-${exp.id}`} className={labelCls}>Company <span className="text-error">*</span></label>
                  <input id={`company-${exp.id}`} value={exp.company}
                    onChange={(e) => updateExp(exp.id, 'company', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, [exp.id]: true }))}
                    placeholder="e.g. Stripe" maxLength={150}
                    className={inputCls(getErr(idx, 'company'))} />
                  <FieldErr msg={getErr(idx, 'company')} />
                </div>
                {/* Location */}
                <div>
                  <label htmlFor={`loc-${exp.id}`} className={labelCls}>Location</label>
                  <input id={`loc-${exp.id}`} value={exp.location}
                    onChange={(e) => updateExp(exp.id, 'location', e.target.value)}
                    placeholder="Remote / New York, NY" maxLength={100}
                    className={inputCls(false)} />
                </div>
                {/* Start date */}
                <div>
                  <label htmlFor={`start-${exp.id}`} className={labelCls}>Start Date <span className="text-error">*</span></label>
                  <input id={`start-${exp.id}`} value={exp.startDate}
                    onChange={(e) => updateExp(exp.id, 'startDate', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, [exp.id]: true }))}
                    placeholder="Jan 2022" maxLength={20}
                    className={inputCls(getErr(idx, 'startDate'))} />
                  <FieldErr msg={getErr(idx, 'startDate')} />
                </div>
                {/* End date */}
                <div>
                  <label htmlFor={`end-${exp.id}`} className={labelCls}>End Date {!exp.current && <span className="text-error">*</span>}</label>
                  <input id={`end-${exp.id}`} value={exp.current ? 'Present' : exp.endDate}
                    disabled={exp.current}
                    onChange={(e) => updateExp(exp.id, 'endDate', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, [exp.id]: true }))}
                    placeholder="Dec 2023" maxLength={20}
                    className={`${inputCls(getErr(idx, 'endDate'))} ${exp.current ? 'opacity-40' : ''}`} />
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
                <label className={`${labelCls} mb-3`}>Bullet Points <span className="text-error">*</span></label>
                <div className="space-y-2">
                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex gap-2 items-start">
                      <span className="text-primary mt-3.5 text-xs font-bold shrink-0">▸</span>
                      <textarea rows={2} value={bullet} maxLength={500}
                        onChange={(e) => updateBullet(exp.id, bIdx, e.target.value)}
                        placeholder="Led migration to microservices, reducing API latency by 40%..."
                        className={`${inputCls(false)} resize-none flex-1`}
                        aria-label={`Bullet ${bIdx + 1} for ${exp.title || 'position'}`} />
                      {exp.bullets.length > 1 && (
                        <button onClick={() => removeBullet(exp.id, bIdx)}
                          className="mt-1 w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-colors shrink-0"
                          aria-label={`Remove bullet ${bIdx + 1}`}>
                          <MinusCircle size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <FieldErr msg={getErr(idx, 'bullets')} />
                <button onClick={() => addBullet(exp.id)}
                  className="mt-2 text-primary text-xs font-bold uppercase tracking-widest flex items-center justify-center h-10 px-3 -ml-3 gap-2 hover:bg-primary/10 rounded-xl transition-colors w-fit"
                  aria-label="Add bullet point">
                  <PlusCircle size={14} /> Add Bullet
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button onClick={addExp}
        className="w-full py-4 border border-dashed border-outline-variant/30 rounded-2xl text-on-surface-variant hover:bg-surface-container/60 hover:text-primary transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
        aria-label="Add another position">
        <Plus size={16} />
        <span className="text-xs uppercase font-bold tracking-widest">Add Another Position</span>
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
        <button onClick={onBack} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-surface-container-high text-on-surface font-medium text-sm active:scale-95 hover:bg-surface-container-highest transition-all">← Back</button>
        <button onClick={handleNext} className="w-full sm:w-auto px-10 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm active:scale-95 shadow-lg hover:opacity-90 transition-all">Next Step →</button>
      </div>
    </motion.div>
  );
}
