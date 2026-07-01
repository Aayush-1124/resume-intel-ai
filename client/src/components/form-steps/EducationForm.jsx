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
      className="max-w-2xl mx-auto space-y-10">

      <header>
        <h1 className="text-3xl font-bold tracking-tighter text-on-surface">Education & Certifications</h1>
        <p className="text-on-surface-variant mt-2 leading-relaxed">
          Detail your academic background and any specialised training.
        </p>
      </header>

      <div className="space-y-6">
        <AnimatePresence>
          {data.map((edu, idx) => (
            <motion.div key={edu.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className="glass-panel p-8 rounded-xl border border-outline-variant/10 space-y-5"
            >
              {/* Header row */}
              <div className="flex justify-between items-center">
                <span className="text-[0.6875rem] uppercase tracking-widest text-primary font-medium">
                  Institution {idx + 1}
                </span>
                {data.length > 1 && (
                  <button onClick={() => removeEdu(edu.id)}
                    className="flex items-center gap-1 text-error text-xs font-bold uppercase tracking-widest hover:opacity-70"
                    aria-label={`Remove institution ${idx + 1}`}>
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>

              {/* Institution */}
              <div>
                <label htmlFor={`inst-${edu.id}`} className="label-style">
                  Institution Name <span className="text-error">*</span>
                </label>
                <input id={`inst-${edu.id}`} value={edu.institution} maxLength={150}
                  onChange={(e) => updateEdu(edu.id, 'institution', e.target.value)}
                  onBlur={touch(edu.id)}
                  placeholder="e.g. Stanford University"
                  className={`field-input ${getErr(idx, 'institution') ? 'error-ring' : ''}`}
                  aria-describedby={getErr(idx,'institution') ? `inst-err-${edu.id}` : undefined} />
                <AnimatePresence>
                  {touched[edu.id] && <FieldErr msg={getErr(idx, 'institution')} />}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Degree */}
                <div>
                  <label htmlFor={`deg-${edu.id}`} className="label-style">
                    Degree <span className="text-error">*</span>
                  </label>
                  <input id={`deg-${edu.id}`} value={edu.degree} maxLength={100}
                    onChange={(e) => updateEdu(edu.id, 'degree', e.target.value)}
                    onBlur={touch(edu.id)}
                    placeholder="B.Sc. / M.Sc. / Ph.D."
                    className={`field-input ${getErr(idx, 'degree') ? 'error-ring' : ''}`} />
                  <AnimatePresence>
                    {touched[edu.id] && <FieldErr msg={getErr(idx, 'degree')} />}
                  </AnimatePresence>
                </div>

                {/* Field */}
                <div>
                  <label htmlFor={`fld-${edu.id}`} className="label-style">Field of Study</label>
                  <input id={`fld-${edu.id}`} value={edu.field} maxLength={100}
                    onChange={(e) => updateEdu(edu.id, 'field', e.target.value)}
                    placeholder="Computer Science"
                    className="field-input" />
                </div>

                {/* Year */}
                <div>
                  <label htmlFor={`yr-${edu.id}`} className="label-style">Graduation Year</label>
                  <input id={`yr-${edu.id}`} value={edu.graduationYear} maxLength={4}
                    onChange={(e) => updateEdu(edu.id, 'graduationYear', e.target.value)}
                    onBlur={touch(edu.id)}
                    placeholder="2022"
                    className={`field-input ${getErr(idx, 'graduationYear') ? 'error-ring' : ''}`} />
                  <AnimatePresence>
                    {touched[edu.id] && <FieldErr msg={getErr(idx, 'graduationYear')} />}
                  </AnimatePresence>
                </div>
              </div>

              {/* Achievements */}
              <div>
                <label htmlFor={`ach-${edu.id}`} className="label-style">Key Achievements</label>
                <textarea id={`ach-${edu.id}`} rows={3} maxLength={500}
                  value={edu.achievements || ''}
                  onChange={(e) => updateEdu(edu.id, 'achievements', e.target.value)}
                  placeholder="Honours, Dean's list, research projects, GPA…"
                  className="field-input resize-none" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add more */}
      <button onClick={() => onChange([...data, newEdu()])}
        className="w-full py-4 border border-dashed border-outline-variant/30 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all flex items-center justify-center gap-2"
        aria-label="Add another institution">
        <Plus size={16} />
        <span className="text-xs uppercase font-bold tracking-widest">Add Another Institution</span>
      </button>

      <div className="flex justify-between items-center pt-4">
        <button onClick={onBack} className="px-8 py-3 rounded-xl bg-surface-container-high text-on-surface font-medium text-sm active:scale-95 hover:bg-surface-container-highest">← Back</button>
        <button onClick={handleNext} className="px-10 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm active:scale-95 shadow-lg hover:opacity-90">Next Step →</button>
      </div>
    </motion.div>
  );
}
