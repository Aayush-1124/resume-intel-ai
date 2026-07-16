import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import JobCache from '../models/JobCache.js';
import { fetchWithRetry } from '../utils/fetchWithRetry.js';
import { validateRequest } from '../middleware/validate.js';
import { ApiError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

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

const SearchJobsSchema = z.object({
  query: z.object({
    query: z.string().min(1, 'Search query is required'),
    location: z.string().optional(),
  })
});

/* ── GET /api/jobs?query=...&location=... ──────────────────────── */
router.get('/', validateRequest(SearchJobsSchema), async (req, res, next) => {
  try {
    const { query, location } = req.query;

    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests. Please wait a moment and try again.', true);
    }

    const cacheKey = buildCacheKey(query, location);

    // 1. Check MongoDB cache
    try {
      const cached = await JobCache.findOne({ cacheKey });
      if (cached) {
        logger.info(`📦 Cache HIT for "${query}" in "${location || 'any'}" (${cached.resultCount} results)`);
        return res.json({
          success: true,
          data: {
            jobs: cached.results,
            total: cached.resultCount,
            cached: true,
            cachedAt: cached.createdAt,
          }
        });
      }
    } catch (dbErr) {
      logger.warn({ err: dbErr }, '⚠️ Cache lookup failed (DB may be down)');
    }

    // 2. Call SerpApi
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      throw new ApiError(503, 'SERVICE_UNAVAILABLE', 'Job search is not configured. SERPAPI_API_KEY is missing.', false);
    }

    logger.info(`🔍 Cache MISS — calling SerpApi for "${query}" in "${location || 'any'}"`);

    const params = new URLSearchParams({
      engine: 'google_jobs',
      q: query.trim(),
      api_key: apiKey,
    });
    
    // Google Jobs often fails to trigger the jobs widget if no location is provided.
    // If the user left it blank, fallback to India as the default location.
    if (location?.trim()) {
      params.append('location', location.trim());
    } else {
      params.append('location', 'India');
      params.append('gl', 'in');
    }

    const serpData = await fetchWithRetry(async () => {
      const serpRes = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
      if (!serpRes.ok) {
        const errText = await serpRes.text();
        const err = new Error(errText);
        err.status = serpRes.status;
        throw err;
      }
      return await serpRes.json();
    }, 'SerpApi_Jobs', 2);

    const jobs = parseJobs(serpData);

    // 3. Save to MongoDB cache (only if we found jobs)
    if (jobs.length > 0) {
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
        logger.info(`💾 Cached ${jobs.length} results for "${query}"`);
      } catch (dbErr) {
        logger.warn({ err: dbErr }, '⚠️ Cache save failed');
      }
    }

    return res.json({
      success: true,
      data: {
        jobs,
        total: jobs.length,
        cached: false,
      }
    });

  } catch (err) {
    next(err);
  }
});

export default router;
