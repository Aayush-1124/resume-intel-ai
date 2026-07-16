import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { validateEducation, hasErrors, sanitizeField } from '../../utils/validation.js';

const newEdu = () => ({
  id: crypto.randomUUID(),
  institution: '', degree: '', field: '',
  graduationYear: '', achievements: '',
});

function FieldErr({ msg }) {
  return msg ? (
    <motion.p role="alert"
      initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex items-center gap-1.5 text-error text-xs mt-1.5"
    >
      <AlertCircle size={11} />{msg}
    </motion.p>
  ) : null;
}

const inputCls = (hasErr) =>
  `w-full rounded-xl border border-outline-variant/20 bg-surface-container/50 backdrop-blur-sm px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-on-surface-variant/40 ${hasErr ? 'border-error/50 focus:ring-error/40' : ''}`;

const labelCls = 'text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 block';

export default function EducationForm({ data, onChange, onNext, onBack }) {
  const [errors,  setErrors]  = useState([]);
  const [touched, setTouched] = useState({});

  const updateEdu = (id, field, val) => {
    const clean = field === 'achievements' ? val.slice(0, 500) : sanitizeField(val, 150);
    const next  = data.map((e) => e.id === id ? { ...e, [field]: clean } : e);
    onChange(next);
    if (touched[id]) setErrors(validateEducation(next));
  };

  const touch = (id) => () => setTouched((t) => ({ ...t, [id]: true }));

  const removeEdu = (id) => {
    const next = data.filter((e) => e.id !== id);
    onChange(next);
    setErrors(validateEducation(next));
  };

  const handleNext = () => {
    const t = {};
    data.forEach((e) => { t[e.id] = true; });
    setTouched(t);
    const errs = validateEducation(data);
    setErrors(errs);
    if (!hasErrors(errs)) onNext();
  };

  const getErr = (idx, field) => errors[idx]?.[field];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
      className="max-w-2xl mx-auto space-y-8 px-1">

      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-on-surface">Education &amp; Certifications</h1>
        <p className="text-on-surface-variant mt-2 leading-relaxed text-sm sm:text-base">
          Detail your academic background and any specialised training.
        </p>
      </header>

      <div className="space-y-5">
        {data.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low/60 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <Plus size={28} />
            </div>
            <h3 className="text-lg font-bold text-on-surface">No Education Added</h3>
            <p className="text-sm text-on-surface-variant max-w-sm mt-2">Add your educational background and certifications to stand out to employers.</p>
          </motion.div>
        )}
        <AnimatePresence>
          {data.map((edu, idx) => (
            <motion.div key={edu.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className="rounded-2xl border border-outline-variant/10 bg-surface-container-low/80 backdrop-blur-sm p-5 sm:p-6 space-y-5"
            >
              {/* Header row */}
              <div className="flex justify-between items-center">
                <span className="text-[0.6875rem] uppercase tracking-widest text-primary font-semibold">
                  Institution {idx + 1}
                </span>
                {data.length > 1 && (
                  <button onClick={() => removeEdu(edu.id)}
                    className="flex items-center justify-center gap-1.5 text-error text-[0.6875rem] font-bold uppercase tracking-widest hover:bg-error/10 h-9 px-3 rounded-xl transition-colors"
                    aria-label={`Remove institution ${idx + 1}`}>
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>

              {/* Institution */}
              <div>
                <label htmlFor={`inst-${edu.id}`} className={labelCls}>
                  Institution Name <span className="text-error">*</span>
                </label>
                <input id={`inst-${edu.id}`} value={edu.institution} maxLength={150}
                  onChange={(e) => updateEdu(edu.id, 'institution', e.target.value)}
                  onBlur={touch(edu.id)}
                  placeholder="e.g. Stanford University"
                  className={inputCls(getErr(idx, 'institution'))}
                  aria-describedby={getErr(idx,'institution') ? `inst-err-${edu.id}` : undefined} />
                <AnimatePresence>
                  {touched[edu.id] && <FieldErr msg={getErr(idx, 'institution')} />}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Degree */}
                <div>
                  <label htmlFor={`deg-${edu.id}`} className={labelCls}>
                    Degree <span className="text-error">*</span>
                  </label>
                  <input id={`deg-${edu.id}`} value={edu.degree} maxLength={100}
                    onChange={(e) => updateEdu(edu.id, 'degree', e.target.value)}
                    onBlur={touch(edu.id)}
                    placeholder="B.Sc. / M.Sc. / Ph.D."
                    className={inputCls(getErr(idx, 'degree'))} />
                  <AnimatePresence>
                    {touched[edu.id] && <FieldErr msg={getErr(idx, 'degree')} />}
                  </AnimatePresence>
                </div>

                {/* Field */}
                <div>
                  <label htmlFor={`fld-${edu.id}`} className={labelCls}>Field of Study</label>
                  <input id={`fld-${edu.id}`} value={edu.field} maxLength={100}
                    onChange={(e) => updateEdu(edu.id, 'field', e.target.value)}
                    placeholder="Computer Science"
                    className={inputCls(false)} />
                </div>

                {/* Year */}
                <div>
                  <label htmlFor={`yr-${edu.id}`} className={labelCls}>Graduation Year</label>
                  <input id={`yr-${edu.id}`} value={edu.graduationYear} maxLength={4}
                    onChange={(e) => updateEdu(edu.id, 'graduationYear', e.target.value)}
                    onBlur={touch(edu.id)}
                    placeholder="2022"
                    className={inputCls(getErr(idx, 'graduationYear'))} />
                  <AnimatePresence>
                    {touched[edu.id] && <FieldErr msg={getErr(idx, 'graduationYear')} />}
                  </AnimatePresence>
                </div>
              </div>

              {/* Achievements */}
              <div>
                <label htmlFor={`ach-${edu.id}`} className={labelCls}>Key Achievements</label>
                <textarea id={`ach-${edu.id}`} rows={3} maxLength={500}
                  value={edu.achievements || ''}
                  onChange={(e) => updateEdu(edu.id, 'achievements', e.target.value)}
                  placeholder="Honours, Dean's list, research projects, GPA…"
                  className={`${inputCls(false)} resize-none`} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add more */}
      <button onClick={() => onChange([...data, newEdu()])}
        className="w-full py-4 border border-dashed border-outline-variant/30 rounded-2xl text-on-surface-variant hover:bg-surface-container/60 hover:text-primary transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
        aria-label="Add another institution">
        <Plus size={16} />
        <span className="text-xs uppercase font-bold tracking-widest">Add Another Institution</span>
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
        <button onClick={onBack} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-surface-container-high text-on-surface font-medium text-sm active:scale-95 hover:bg-surface-container-highest transition-all">← Back</button>
        <button onClick={handleNext} className="w-full sm:w-auto px-10 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm active:scale-95 shadow-lg hover:opacity-90 transition-all">Next Step →</button>
      </div>
    </motion.div>
  );
}
