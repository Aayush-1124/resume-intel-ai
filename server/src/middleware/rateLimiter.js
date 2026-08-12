/**
 * Simple in-memory rate limiter middleware — no external dependencies.
 *
 * Tracks request counts per IP in a sliding window.
 * Entries auto-expire; a cleanup sweep runs every 5 minutes.
 *
 * Usage:
 *   import { createRateLimiter } from '../middleware/rateLimiter.js';
 *   const aiLimiter = createRateLimiter({ windowMs: 60_000, max: 15 });
 *   router.post('/my-ai-route', aiLimiter, handler);
 */

/**
 * @param {{ windowMs?: number, max?: number, message?: string }} options
 *   windowMs  - Rolling window in ms          (default 60 000 = 1 minute)
 *   max       - Max requests per window / IP  (default 15)
 *   message   - Error message sent on 429     (default generic)
 */
export function createRateLimiter({
  windowMs = 60_000,
  max = 15,
  message = 'Too many requests — please slow down and try again shortly.',
} = {}) {
  /** @type {Map<string, { count: number, resetAt: number }>} */
  const store = new Map();

  // Sweep expired entries every 5 minutes to prevent unbounded growth
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) store.delete(key);
    }
  }, 5 * 60_000).unref(); // .unref() so the interval doesn't keep Node alive

  return function rateLimiter(req, res, next) {
    const ip  = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    let entry = store.get(ip);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(ip, entry);
    }

    entry.count += 1;

    // Expose standard headers so clients can back off gracefully
    res.setHeader('X-RateLimit-Limit',     max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset',     Math.ceil(entry.resetAt / 1000));

    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      });
    }

    next();
  };
}

/* ── Pre-configured limiters for each tier of cost ────────────────── */

/**
 * Expensive Gemini endpoints (tailor, recruiter-review, cover-letter, interview).
 * 20/min gives a power user room to:
 *   tailor + 3 cover-letter tones + interview + recruiter-review + retries
 * without hitting a wall in a single exploratory session.
 */
export const heavyAiLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 20,
  message: 'You\'ve sent too many AI requests. Please wait a moment before trying again.',
});

/**
 * Parse-doc (file upload + Gemini).
 * 10/min is generous for uploads; the 24-hour cache means repeat uploads
 * of the same file never hit Gemini again anyway.
 */
export const parseLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 10,
  message: 'Too many upload attempts. Please wait before uploading again.',
});

/**
 * Light/free endpoints (ats-score, keyword-explain, organize-skills).
 * These don't call Gemini; 60/min per IP is safe and handles the
 * debounced auto-score useEffect without risk.
 */
export const lightLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 60,
  message: 'Too many requests. Please slow down.',
});
