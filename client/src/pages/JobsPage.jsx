import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Briefcase, ExternalLink, Clock, Building2,
  Sparkles, AlertCircle, ArrowLeft, ChevronRight, Zap, Filter,
  RefreshCw, TrendingUp, WifiOff, ServerCrash, SearchX, Inbox
} from 'lucide-react';
import { api } from '../utils/api.js';

/* ── Skeleton Card ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-highest/60 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-surface-container-highest/60 rounded-lg w-3/4" />
          <div className="h-4 bg-surface-container-highest/40 rounded-lg w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-surface-container-highest/30 rounded w-full" />
        <div className="h-3 bg-surface-container-highest/30 rounded w-5/6" />
        <div className="h-3 bg-surface-container-highest/30 rounded w-2/3" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-surface-container-highest/30 rounded-full w-16" />
        <div className="h-6 bg-surface-container-highest/30 rounded-full w-20" />
      </div>
    </div>
  );
}

/* ── Job Card ──────────────────────────────────────────────────── */
function JobCard({ job, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: 'easeOut' }}
      className="group bg-surface-container-low/80 backdrop-blur-sm rounded-2xl p-6 border border-outline-variant/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-3">
        {job.thumbnail ? (
          <img
            src={job.thumbnail}
            alt={`${job.company} logo`}
            className="w-12 h-12 rounded-xl object-cover bg-surface-container shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {job.title}
          </h3>
          <p className="text-sm text-on-surface-variant mt-0.5 font-medium">{job.company}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant mb-3">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} className="opacity-60" /> {job.location}
          </span>
        )}
        {job.postedAt && (
          <span className="flex items-center gap-1">
            <Clock size={12} className="opacity-60" /> {job.postedAt}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-3 flex-1">
        {job.description || 'No description available for this position.'}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.schedule && (
          <span className="px-2.5 py-0.5 bg-tertiary/10 text-tertiary text-[0.65rem] font-semibold rounded-full uppercase tracking-wider">
            {job.schedule}
          </span>
        )}
        {job.salary && (
          <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[0.65rem] font-semibold rounded-full">
            {job.salary}
          </span>
        )}
        {job.source && (
          <span className="px-2.5 py-0.5 bg-surface-container-highest text-on-surface-variant text-[0.65rem] font-medium rounded-full">
            {job.source.replace('via ', '')}
          </span>
        )}
      </div>

      {/* Apply button */}
      <div className="flex gap-2 mt-auto">
        <a
          href={job.applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm rounded-xl hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
          aria-label={`Apply for ${job.title} at ${job.company}`}
        >
          Apply Now <ExternalLink size={14} />
        </a>
        {job.applyOptions?.length > 1 && (
          <details className="relative">
            <summary className="flex items-center justify-center w-10 h-10 bg-surface-container-high rounded-xl cursor-pointer hover:bg-surface-container-highest transition-colors border border-outline-variant/10 list-none">
              <ChevronRight size={14} className="text-on-surface-variant" />
            </summary>
            <div className="absolute right-0 bottom-12 bg-surface-container-high rounded-xl shadow-2xl border border-outline-variant/10 p-2 min-w-[180px] z-10">
              {job.applyOptions.map((opt, i) => (
                <a
                  key={i}
                  href={opt.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 text-sm text-on-surface hover:bg-surface-container-highest rounded-lg transition-colors"
                >
                  {opt.title}
                </a>
              ))}
            </div>
          </details>
        )}
      </div>
    </motion.article>
  );
}

/* ── Empty State (initial / no results / error) ────────────────── */
function EmptyState({ type, query, location, onRetry, onNavigate }) {
  const states = {
    initial: {
      icon: <Inbox size={40} className="text-primary" />,
      title: 'Find your next opportunity',
      desc: 'Enter a job title or role above, or toggle "Match my resume" to let AI find roles that fit your experience.',
      action: null,
    },
    noresults: {
      icon: <SearchX size={40} className="text-on-surface-variant" />,
      title: `No jobs found for "${query}"`,
      desc: location
        ? `We couldn't find any listings in "${location}". Try a broader location like "Remote" or leave it blank.`
        : 'Try different keywords — for example, use "Software Engineer" instead of a specific stack name.',
      tips: ['Use broader terms (e.g. "Engineer" not "React Developer")', 'Try "Remote" as the location', 'Check for typos in your search'],
      action: onRetry ? { label: 'Try Again', icon: <RefreshCw size={14} />, fn: onRetry } : null,
    },
    error_offline: {
      icon: <WifiOff size={40} className="text-error" />,
      title: "You're offline",
      desc: "It looks like you've lost your internet connection. Please check your network and try again.",
      action: onRetry ? { label: 'Retry', icon: <RefreshCw size={14} />, fn: onRetry } : null,
    },
    error_404: {
      icon: <SearchX size={40} className="text-on-surface-variant" />,
      title: 'Endpoint not found (404)',
      desc: "The job search service couldn't be reached at that address. This might be a temporary issue — please try again or check back later.",
      action: onRetry ? { label: 'Try Again', icon: <RefreshCw size={14} />, fn: onRetry } : null,
    },
    error_500: {
      icon: <ServerCrash size={40} className="text-error" />,
      title: 'Server error — we\'re on it',
      desc: "Something went wrong on our end (500). Our team has been notified. Please try again in a minute — your data is safe.",
      action: onRetry ? { label: 'Try Again', icon: <RefreshCw size={14} />, fn: onRetry } : null,
    },
    error_505: {
      icon: <ServerCrash size={40} className="text-amber-400" />,
      title: 'Unsupported request (505)',
      desc: "The server doesn't support the HTTP version used by this request. Please refresh the page. If this keeps happening, contact support.",
      action: { label: 'Refresh Page', icon: <RefreshCw size={14} />, fn: () => window.location.reload() },
    },
    error_server: {
      icon: <ServerCrash size={40} className="text-amber-400" />,
      title: 'Server is under heavy traffic',
      desc: 'Our job search service is temporarily busy. This usually clears up in a minute — please try again shortly.',
      action: onRetry ? { label: 'Try Again', icon: <RefreshCw size={14} />, fn: onRetry } : null,
    },
    error_ratelimit: {
      icon: <TrendingUp size={40} className="text-amber-400" />,
      title: 'Rate limit reached',
      desc: "You've made too many searches too quickly. Please wait a moment before trying again — your quota resets shortly.",
      action: onRetry ? { label: 'Try Again in a moment', icon: <RefreshCw size={14} />, fn: onRetry } : null,
    },
    error_generic: {
      icon: <AlertCircle size={40} className="text-error" />,
      title: 'Something went wrong',
      desc: 'We ran into an unexpected problem fetching jobs. Please try your search again.',
      action: onRetry ? { label: 'Try Again', icon: <RefreshCw size={14} />, fn: onRetry } : null,
    },
  };

  const s = states[type] || states.initial;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full text-center py-16 px-6"
      role="status"
      aria-live="polite"
    >
      {/* Icon badge */}
      <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 ${
        type?.startsWith('error') ? 'bg-error/10' : 'bg-primary/10'
      }`}>
        {s.icon}
      </div>

      <h3 className="text-xl font-extrabold text-on-surface mb-2 tracking-tight">{s.title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed mb-5">{s.desc}</p>

      {/* Tips list for no-results */}
      {s.tips && (
        <ul className="text-left text-xs text-on-surface-variant space-y-1.5 mb-6 bg-surface-container-low border border-outline-variant/10 rounded-xl p-4 max-w-xs w-full">
          {s.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span> {tip}
            </li>
          ))}
        </ul>
      )}

      {/* Action button */}
      {s.action && (
        <button
          onClick={s.action.fn}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-bold text-sm rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          {s.action.icon}
          {s.action.label}
        </button>
      )}

      {/* Always show "Back to Resume" as secondary */}
      {type !== 'initial' && onNavigate && (
        <button
          onClick={() => onNavigate('dashboard', 'personal')}
          className="mt-3 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer underline underline-offset-2"
        >
          ← Back to Resume Editor
        </button>
      )}
    </motion.div>
  );
}

/* ── Error type classifier ─────────────────────────────────────── */
function classifyError(err) {
  if (!navigator.onLine) return 'error_offline';

  // Use the HTTP status code first for precise mapping
  const status = err?.statusCode;
  if (status === 404) return 'error_404';
  if (status === 500) return 'error_500';
  if (status === 505) return 'error_505';
  if (status === 429) return 'error_ratelimit';
  if (status === 502 || status === 503 || status === 504) return 'error_server';

  // Fallback: inspect error code and message
  const code = (err?.code || '').toUpperCase();
  const msg  = (err?.message || '').toLowerCase();
  if (code === 'RESOURCE_EXHAUSTED' || msg.includes('rate limit') || msg.includes('too many')) return 'error_ratelimit';
  if (code === 'INTERNAL_SERVER_ERROR') return 'error_500';
  if (msg.includes('heavy traffic') || msg.includes('unavailable') || msg.includes('network') || msg.includes("can't reach")) return 'error_server';
  return 'error_generic';
}

/* ── Suggested searches ────────────────────────────────────────── */
const SUGGESTED_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'Product Manager',
  'UI/UX Designer', 'DevOps Engineer', 'Machine Learning Engineer',
];

/* ── Main Jobs Page ────────────────────────────────────────────── */
export default function JobsPage({ resumeData, onNavigate }) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [matchResume, setMatchResume] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [resultMeta, setResultMeta] = useState(null);
  const [lastQuery, setLastQuery] = useState('');
  const searchInputRef = useRef(null);

  // Auto-fill from resume when match toggle is enabled
  useEffect(() => {
    if (matchResume && resumeData) {
      setQuery(resumeData.personal?.role || '');
      setLocation(resumeData.personal?.location || '');
    }
  }, [matchResume, resumeData]);

  const handleSearch = async (e, overrideQuery) => {
    e?.preventDefault();
    const q = overrideQuery ?? query;
    if (!q.trim() || isLoading) return;

    setIsLoading(true);
    setErrorType(null);
    setHasSearched(true);
    setLastQuery(q);
    if (overrideQuery) setQuery(overrideQuery);

    try {
      const data = await api.searchJobs(q, location);
      setJobs(data.jobs || []);
      setResultMeta({ total: data.total, cached: data.cached, cachedAt: data.cachedAt });
      if (!data.jobs?.length) setErrorType('noresults');
    } catch (err) {
      setErrorType(classifyError(err));
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => handleSearch(null, lastQuery || query);

  // Determine what empty state to show in the right pane
  const emptyStateType = hasSearched
    ? (errorType || (jobs.length === 0 ? 'noresults' : null))
    : 'initial';

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-72px)] overflow-hidden">

      {/* ── Left: Search Sidebar ── */}
      <aside className="w-full md:w-[320px] shrink-0 bg-surface-container border-b md:border-b-0 md:border-r border-outline-variant/10 flex flex-col overflow-y-auto md:custom-scrollbar max-h-[55vh] md:max-h-none">

        {/* Back button */}
        <div className="p-4 pb-0">
          <button
            onClick={() => onNavigate('dashboard', 'personal')}
            className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Resume
          </button>
        </div>

        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 pb-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="bg-primary-container p-1.5 rounded-xl">
              <Briefcase size={16} className="text-on-primary-container" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">Find Jobs</h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
            Search thousands of platforms. Toggle "Match my resume" to auto-fill your role.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="px-4 sm:px-6 space-y-3 flex-1 pb-4" noValidate>

          {/* Job title */}
          <div>
            <label htmlFor="job-query" className="text-[0.65rem] font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 block">
              Job Title / Keywords
            </label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50 pointer-events-none" />
              <input
                id="job-query"
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. React Developer"
                disabled={isLoading}
                autoComplete="off"
                className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="job-location" className="text-[0.65rem] font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 block">
              Location
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50 pointer-events-none" />
              <input
                id="job-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, Mumbai, USA"
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Match resume toggle */}
          <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <div>
                <span className="text-sm font-medium text-on-surface">Match my resume</span>
                <p className="text-[0.6rem] text-on-surface-variant">Auto-fills from your profile</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMatchResume(!matchResume)}
              disabled={isLoading}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                matchResume ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
              role="switch"
              aria-checked={matchResume}
              aria-label="Match jobs to my resume"
            >
              <motion.span
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ x: matchResume ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          <AnimatePresence>
            {matchResume && resumeData?.personal?.role && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-primary bg-primary/5 rounded-lg p-2.5 border border-primary/10"
              >
                <Zap size={11} className="inline mr-1" />
                Searching for: <strong>{resumeData.personal.role}</strong>
              </motion.p>
            )}
          </AnimatePresence>

          {/* Search button */}
          <motion.button
            type="submit"
            disabled={isLoading || !query.trim()}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                />
                Searching…
              </>
            ) : (
              <>
                <Search size={15} /> Search Jobs
              </>
            )}
          </motion.button>

          {/* Suggested roles — shown before first search */}
          {!hasSearched && (
            <div className="pt-1">
              <p className="text-[0.6rem] uppercase tracking-widest font-semibold text-on-surface-variant mb-2">Popular searches</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_ROLES.slice(0, 6).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleSearch(null, role)}
                    className="text-[0.65rem] px-2.5 py-1 rounded-full bg-surface-container-highest border border-outline-variant/10 text-on-surface-variant hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all cursor-pointer"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </aside>

      {/* ── Right: Job Feed ── */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-background p-4 sm:p-6 lg:p-8" aria-label="Job results">

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Results */}
        {!isLoading && jobs.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-on-surface">
                  {resultMeta?.total || jobs.length} Results
                </h2>
                <p className="text-xs text-on-surface-variant">
                  for "{lastQuery}"{location ? ` in ${location}` : ''}
                  {resultMeta?.cached && (
                    <span className="ml-2 text-tertiary">• Cached results</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[0.65rem] text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/10 self-start sm:self-auto">
                <Filter size={11} /> {jobs.length} shown
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job, i) => (
                <JobCard key={job.id || i} job={job} index={i} />
              ))}
            </div>
          </>
        )}

        {/* Empty / Error / Initial State */}
        {!isLoading && jobs.length === 0 && (
          <EmptyState
            type={emptyStateType}
            query={lastQuery}
            location={location}
            onRetry={hasSearched ? handleRetry : null}
            onNavigate={onNavigate}
          />
        )}
      </main>
    </div>
  );
}
