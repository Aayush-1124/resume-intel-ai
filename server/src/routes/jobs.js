import { Router } from 'express';
import JobCache from '../models/JobCache.js';

const router = Router();

/* ── Simple in-memory rate limiter (10 req/min per IP) ─────────── */
const rateLimitMap = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

/* ── Helper: build cache key ───────────────────────────────────── */
function buildCacheKey(query, location) {
  return `${query.toLowerCase().trim()}::${(location || '').toLowerCase().trim()}`;
}

/* ── Helper: parse SerpApi response into clean job objects ──────── */
function parseJobs(serpApiData) {
  const rawJobs = serpApiData?.jobs_results || [];
  return rawJobs.map((job) => ({
    id: job.job_id || crypto.randomUUID(),
    title: job.title || 'Untitled Position',
    company: job.company_name || 'Unknown Company',
    location: job.location || 'Remote',
    description: job.description?.substring(0, 300) || '',
    postedAt: job.detected_extensions?.posted_at || 'Recently',
    schedule: job.detected_extensions?.schedule_type || '',
    salary: job.detected_extensions?.salary || '',
    source: job.via || '',
    applyLink: job.apply_options?.[0]?.link || job.share_link || job.related_links?.[0]?.link || '#',
    applyOptions: (job.apply_options || []).map((opt) => ({
      title: opt.title || 'Apply',
      link: opt.link || '#',
    })),
    thumbnail: job.thumbnail || null,
    extensions: job.extensions || [],
  }));
}

/* ── GET /api/jobs?query=...&location=... ──────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { query, location } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Rate limit check
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }

    const cacheKey = buildCacheKey(query, location);

    // 1. Check MongoDB cache
    try {
      const cached = await JobCache.findOne({ cacheKey });
      if (cached) {
        console.log(`📦 Cache HIT for "${query}" in "${location || 'any'}" (${cached.resultCount} results)`);
        return res.json({
          jobs: cached.results,
          total: cached.resultCount,
          cached: true,
          cachedAt: cached.createdAt,
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ Cache lookup failed (DB may be down):', dbErr.message);
      // Continue to SerpApi if cache fails
    }

    // 2. Call SerpApi
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'Job search is not configured. SERPAPI_API_KEY is missing.' });
    }

    console.log(`🔍 Cache MISS — calling SerpApi for "${query}" in "${location || 'any'}"`);

    const params = new URLSearchParams({
      engine: 'google_jobs',
      q: query.trim(),
      api_key: apiKey,
    });
    if (location?.trim()) {
      params.append('location', location.trim());
    }

    const serpRes = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

    if (!serpRes.ok) {
      const errText = await serpRes.text();
      console.error('❌ SerpApi error:', serpRes.status, errText);
      return res.status(502).json({ error: 'Failed to fetch jobs from search engine. Please try again.' });
    }

    const serpData = await serpRes.json();
    const jobs = parseJobs(serpData);

    // 3. Save to MongoDB cache
    try {
      await JobCache.findOneAndUpdate(
        { cacheKey },
        {
          cacheKey,
          query: query.trim(),
          location: (location || '').trim(),
          results: jobs,
          resultCount: jobs.length,
          createdAt: new Date(),
        },
        { upsert: true, new: true }
      );
      console.log(`💾 Cached ${jobs.length} results for "${query}"`);
    } catch (dbErr) {
      console.warn('⚠️ Cache save failed:', dbErr.message);
      // Still return results even if caching fails
    }

    return res.json({
      jobs,
      total: jobs.length,
      cached: false,
    });

  } catch (err) {
    console.error('❌ Job search error:', err);
    return res.status(500).json({ error: 'Internal server error during job search.' });
  }
});

export default router;
