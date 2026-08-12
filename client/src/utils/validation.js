/* ─── Sanitizers ─────────────────────────────────────────────────── */

/**
 * Strip HTML tags and the three characters that break HTML context
 * (<, >, backtick). Apostrophes and double-quotes are intentionally
 * preserved — they appear in real names ("O'Brien"), summaries, and
 * bullet points and are safe inside text nodes.
 */
export const sanitizeText = (val = '') =>
  val
    .replace(/<[^>]*>/g, '')   // strip any HTML/XML tags
    .replace(/[<>`]/g, '')     // strip HTML-breaking chars only (NOT ' or ")
    .replace(/\s{2,}/g, ' ')   // collapse runs of whitespace
    .trimStart();

/** Sanitize and enforce max length */
export const sanitizeField = (val = '', max = 200) =>
  sanitizeText(val).slice(0, max);

/**
 * Sanitize URL — blocks javascript: and data: schemes, strips HTML tags.
 * Allows http/https URLs, www-prefixed, linkedin paths, and bare domains.
 */
export const sanitizeUrl = (val = '') => {
  const clean = val.replace(/<[^>]*>/g, '').replace(/[<>`]/g, '').trim();
  if (!clean) return '';
  // Block dangerous protocols
  if (/^(javascript|data|vbscript):/i.test(clean)) return '';
  if (/^(https?:\/\/|www\.|linkedin\.com)/i.test(clean)) return clean.slice(0, 300);
  // Allow bare domains like "alexchen.design" or "github.com/user"
  // Must start with a letter/digit and contain a dot
  if (/^[a-zA-Z0-9].*\..+/.test(clean)) return clean.replace(/\s/g, '').slice(0, 300);
  return '';
};

/**
 * Sanitize bullet — allow all normal punctuation including apostrophes
 * and quotes since bullets often contain quoted metrics and possessives.
 */
export const sanitizeBullet = (val = '') =>
  val.replace(/<[^>]*>/g, '').replace(/[<>`]/g, '').slice(0, 500);

/**
 * Sanitize a multi-line freeform textarea (e.g. achievements, summary).
 * Preserves newlines and all punctuation; only strips HTML tags and
 * the three HTML-breaking characters.
 */
export const sanitizeTextarea = (val = '', max = 1000) =>
  val.replace(/<[^>]*>/g, '').replace(/[<>`]/g, '').slice(0, max);

/* ─── Validators ─────────────────────────────────────────────────── */

const EMAIL_RE  = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PHONE_RE  = /^[+\d\s\-().]{7,20}$/;
const YEAR_RE   = /^(19|20)\d{2}$/;
// Accepts http/https URLs, www-prefixed, linkedin.com paths, and bare domains
const URL_RE    = /^(https?:\/\/|www\.|linkedin\.com\/|github\.com\/)?[a-zA-Z0-9][\w\-.]+(\.[\w]{2,})(\/[\w\-.~:/?#[\]@!$&'()*+,;=%]*)?$/;

export function validatePersonal(data) {
  const errors = {};

  const name = (data.fullName || '').trim();
  if (!name) errors.fullName = 'Full name is required.';
  else if (name.length < 2) errors.fullName = 'Name must be at least 2 characters.';
  else if (name.length > 100) errors.fullName = 'Name must be under 100 characters.';

  const email = (data.email || '').trim();
  if (!email) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';

  const phone = (data.phone || '').trim();
  if (phone && !PHONE_RE.test(phone)) errors.phone = 'Enter a valid phone number (e.g. +91 98765 43210).';

  const location = (data.location || '').trim();
  if (location && location.length > 100) errors.location = 'Location must be under 100 characters.';

  const website = (data.website || '').trim();
  if (website) {
    const sanitized = sanitizeUrl(website);
    if (!sanitized) errors.website = 'Enter a valid URL or leave blank.';
    else if (sanitized.startsWith('javascript')) errors.website = 'Invalid URL.';
  }

  const linkedin = (data.linkedin || '').trim();
  if (linkedin) {
    const sanitized = sanitizeUrl(linkedin);
    if (!sanitized) errors.linkedin = 'Enter a valid LinkedIn URL or profile path.';
  }

  const summary = (data.summary || '').trim();
  if (summary && summary.length < 30) errors.summary = 'Summary should be at least 30 characters.';
  if (summary && summary.length > 1000) errors.summary = 'Summary must be under 1000 characters.';

  return errors; // {} means valid
}

export function validateExperience(expList) {
  // Returns array of error objects, one per entry
  return expList.map((exp) => {
    const errors = {};
    if (!(exp.title || '').trim()) errors.title = 'Job title is required.';
    if (!(exp.company || '').trim()) errors.company = 'Company is required.';
    if (!(exp.startDate || '').trim()) errors.startDate = 'Start date is required.';
    if (!exp.current && !(exp.endDate || '').trim()) errors.endDate = 'End date is required (or check "current").';
    const filledBullets = (exp.bullets || []).filter((b) => b.trim());
    if (filledBullets.length === 0) errors.bullets = 'Add at least one bullet point.';
    return errors;
  });
}

export function validateEducation(eduList) {
  return eduList.map((edu) => {
    const errors = {};
    if (!(edu.institution || '').trim()) errors.institution = 'Institution name is required.';
    if (!(edu.degree || '').trim()) errors.degree = 'Degree is required.';
    const yr = (edu.graduationYear || '').trim();
    if (yr && !YEAR_RE.test(yr)) errors.graduationYear = 'Enter a valid year (e.g. 2022).';
    return errors;
  });
}

export function hasErrors(errors) {
  if (Array.isArray(errors)) return errors.some((e) => Object.keys(e).length > 0);
  return Object.keys(errors).length > 0;
}
