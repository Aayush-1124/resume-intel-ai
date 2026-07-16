import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { validatePersonal } from '../../utils/validation.js';
import { sanitizeField, sanitizeUrl } from '../../utils/validation.js';

/* ── Reusable field ── */
function Field({ label, id, type = 'text', value, onChange, onBlur, placeholder, required, error, maxLength, hint }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 block">
        {label}
        {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={id} type={type}
        value={value || ''} maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required} aria-required={required}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`w-full rounded-xl border border-outline-variant/20 bg-surface-container/50 backdrop-blur-sm px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-on-surface-variant/40 ${error ? 'border-error/50 focus:ring-error/40' : ''}`}
      />
      <AnimatePresence>
        {error && (
          <motion.p id={`${id}-err`} role="alert"
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-error text-xs mt-1.5"
          >
            <AlertCircle size={11} />{error}
          </motion.p>
        )}
      </AnimatePresence>
      {hint && !error && <p className="text-[0.65rem] text-on-surface-variant/50 mt-1">{hint}</p>}
    </div>
  );
}

export default function PersonalForm({ data, onChange, onNext }) {
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const sanitize = (field, val) => {
    const isUrl = ['website', 'linkedin'].includes(field);
    return isUrl ? sanitizeUrl(val) : sanitizeField(val, field === 'summary' ? 1000 : 200);
  };

  const update = (field) => (val) => {
    const clean = sanitize(field, val);
    const next  = { ...data, [field]: clean };
    onChange(next);
    if (touched[field]) {
      const errs = validatePersonal(next);
      setErrors((e) => ({ ...e, [field]: errs[field] }));
    }
  };

  const blur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    const errs = validatePersonal(data);
    setErrors((e) => ({ ...e, [field]: errs[field] }));
  };

  const handleNext = () => {
    const errs = validatePersonal(data);
    setErrors(errs);
    setTouched({ fullName: true, email: true, phone: true, location: true, summary: true, website: true, linkedin: true });
    if (Object.keys(errs).length === 0) onNext();
  };

  const charCount = (val, max) => {
    const len = (val || '').length;
    return len > max * 0.8 ? `${len}/${max}` : '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
      className="max-w-2xl mx-auto space-y-8 px-1"
    >
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-on-surface">Personal Information</h1>
        <p className="text-on-surface-variant mt-2 leading-relaxed text-sm sm:text-base">
          Your professional identity — make every detail count.
        </p>
      </header>

      <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low/80 backdrop-blur-sm p-5 sm:p-6 space-y-5">
        <Field label="Full Name" id="fullName" value={data.fullName}
          onChange={update('fullName')} onBlur={blur('fullName')}
          placeholder="e.g. Alexandra Chen" required maxLength={100}
          error={errors.fullName} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Email" id="email" type="email" value={data.email}
            onChange={update('email')} onBlur={blur('email')}
            placeholder="alex@example.com" required maxLength={200}
            error={errors.email} />
          <Field label="Phone" id="phone" type="tel" value={data.phone}
            onChange={update('phone')} onBlur={blur('phone')}
            placeholder="+1 (555) 000-1234" maxLength={20}
            error={errors.phone} hint="Optional — include country code" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Location" id="location" value={data.location}
            onChange={update('location')} onBlur={blur('location')}
            placeholder="San Francisco, CA" maxLength={100}
            error={errors.location} />
          <Field label="LinkedIn" id="linkedin" type="url" value={data.linkedin}
            onChange={update('linkedin')} onBlur={blur('linkedin')}
            placeholder="linkedin.com/in/alexchen" maxLength={300}
            error={errors.linkedin} />
        </div>

        <Field label="Portfolio / Website" id="website" type="url" value={data.website}
          onChange={update('website')} onBlur={blur('website')}
          placeholder="alexchen.design" maxLength={300}
          error={errors.website} />

        {/* Summary */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label htmlFor="summary" className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              Professional Summary
            </label>
            <span className="text-[0.6rem] text-on-surface-variant/50">
              {charCount(data.summary, 1000)}
            </span>
          </div>
          <textarea id="summary" rows={4}
            value={data.summary || ''}
            onChange={(e) => update('summary')(e.target.value)}
            onBlur={blur('summary')}
            maxLength={1000}
            placeholder="A concise 2-3 sentence pitch of your career, key skills, and unique value proposition..."
            className={`w-full rounded-xl border border-outline-variant/20 bg-surface-container/50 backdrop-blur-sm px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-on-surface-variant/40 resize-none ${errors.summary ? 'border-error/50 focus:ring-error/40' : ''}`}
            aria-describedby={errors.summary ? 'summary-err' : undefined}
          />
          <AnimatePresence>
            {errors.summary && (
              <motion.p id="summary-err" role="alert"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-error text-xs mt-1.5"
              >
                <AlertCircle size={11} />{errors.summary}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
        <button
          onClick={handleNext}
          className="w-full sm:w-auto px-10 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm active:scale-95 shadow-lg shadow-primary-container/20 hover:opacity-90 transition-all"
          aria-label="Proceed to Experience section"
        >
          Next Step →
        </button>
      </div>
    </motion.div>
  );
}
