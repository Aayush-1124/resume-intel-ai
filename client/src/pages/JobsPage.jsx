import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Briefcase, ExternalLink, Clock, Building2,
  Sparkles, AlertCircle, ArrowLeft, ChevronRight, Zap, Filter
} from 'lucide-react';
import { api } from '../utils/api.js';

/* ── Skeleton Card ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-highest/60" />
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
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-3">
        {job.thumbnail ? (
          <img src={job.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover bg-surface-container" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-on-surface-variant mt-0.5">{job.company}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant mb-3">
        <span className="flex items-center gap-1">
          <MapPin size={12} className="opacity-60" /> {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} className="opacity-60" /> {job.postedAt}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-3">
        {job.description}
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
      <div className="flex gap-2">
        <a
          href={job.applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm rounded-xl hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Apply Now <ExternalLink size={14} />
        </a>
        {job.applyOptions?.length > 1 && (
          <details className="relative">
            <summary className="flex items-center justify-center w-10 h-10 bg-surface-container-high rounded-xl cursor-pointer hover:bg-surface-container-highest transition-colors border border-outline-variant/10">
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

/* ── Empty State ───────────────────────────────────────────────── */
function EmptyState({ hasSearched }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center py-20"
    >
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
        <Briefcase size={36} className="text-primary" />
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-2">
        {hasSearched ? 'No jobs found' : 'Search for your next role'}
      </h3>
      <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
        {hasSearched
          ? 'Try adjusting your search terms or location to find more opportunities.'
          : 'Enter a job title or toggle "Match my resume" to discover roles tailored to your experience.'}
      </p>
    </motion.div>
  );
}

/* ── Main Jobs Page ────────────────────────────────────────────── */
export default function JobsPage({ resumeData, onNavigate }) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [matchResume, setMatchResume] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [resultMeta, setResultMeta] = useState(null);
  const searchInputRef = useRef(null);

  // Auto-fill from resume when match toggle is enabled
  useEffect(() => {
    if (matchResume && resumeData) {
      setQuery(resumeData.personal?.role || '');
      setLocation(resumeData.personal?.location || '');
    }
  }, [matchResume, resumeData]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const data = await api.searchJobs(query, location);
      setJobs(data.jobs || []);
      setResultMeta({
        total: data.total,
        cached: data.cached,
        cachedAt: data.cachedAt,
      });
    } catch (err) {
      setError(err.message || 'Failed to search jobs');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-72px)] overflow-hidden">

      {/* ── Left: Search Sidebar ── */}
      <aside className="w-[320px] shrink-0 bg-surface-container border-r border-outline-variant/10 flex flex-col overflow-y-auto custom-scrollbar">

        {/* Back button */}
        <div className="p-4 pb-0">
          <button
            onClick={() => onNavigate('dashboard', 'personal')}
            className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ArrowLeft size={14} /> Back to Resume
          </button>
        </div>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="bg-primary-container p-1.5 rounded-xl">
              <Briefcase size={16} className="text-on-primary-container" />
            </div>
            <h1 className="text-xl font-extrabold text-on-surface tracking-tight">Find Jobs</h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
            Search thousands of platforms instantly. Results are cached for 24 hours.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="px-6 space-y-4 flex-1">
          {/* Job title / keywords */}
          <div>
            <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 block">
              Job Title / Keywords
            </label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. React Developer"
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 block">
              Location
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, India"
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Match resume toggle */}
          <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <span className="text-sm font-medium text-on-surface">Match my resume</span>
            </div>
            <button
              type="button"
              onClick={() => setMatchResume(!matchResume)}
              disabled={isLoading}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                matchResume ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
              role="switch"
              aria-checked={matchResume}
              aria-label="Match jobs to resume"
            >
              <motion.span
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ x: matchResume ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {matchResume && resumeData?.personal?.role && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-xs text-primary bg-primary/5 rounded-lg p-2.5 border border-primary/10"
            >
              <Zap size={11} className="inline mr-1" />
              Searching based on: <strong>{resumeData.personal.role}</strong>
            </motion.p>
          )}

          {/* Search button */}
          <motion.button
            type="submit"
            disabled={isLoading || !query.trim()}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Searching...
              </>
            ) : (
              <>
                <Search size={15} /> Search Jobs
              </>
            )}
          </motion.button>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-error text-xs p-2 bg-error/5 rounded-lg"
              >
                <AlertCircle size={13} /> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Footer info */}
        <div className="px-6 py-4 mt-auto border-t border-outline-variant/10">
          {resultMeta && (
            <div className="text-[0.6rem] text-on-surface-variant space-y-0.5">
              <p>{resultMeta.total} job{resultMeta.total !== 1 ? 's' : ''} found</p>
              {resultMeta.cached && (
                <p className="flex items-center gap-1 text-tertiary">
                  <Zap size={10} /> Served from cache
                </p>
              )}
            </div>
          )}
          <p className="text-[0.6rem] text-on-surface-variant/40 mt-2">
            Powered by Google Jobs Engine
          </p>
        </div>
      </aside>

      {/* ── Right: Job Feed ── */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-background p-8">

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Results */}
        {!isLoading && jobs.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-on-surface">
                  {resultMeta?.total || jobs.length} Results
                </h2>
                <p className="text-xs text-on-surface-variant">
                  for "{query}"{location ? ` in ${location}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[0.65rem] text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/10">
                <Filter size={11} /> {jobs.length} shown
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {jobs.map((job, i) => (
                <JobCard key={job.id || i} job={job} index={i} />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && jobs.length === 0 && (
          <EmptyState hasSearched={hasSearched} />
        )}
      </main>
    </div>
  );
}
