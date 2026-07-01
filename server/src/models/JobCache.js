import mongoose from 'mongoose';

const jobCacheSchema = new mongoose.Schema({
  /** Normalized search key: "query::location" */
  cacheKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  query: { type: String, required: true },
  location: { type: String, default: '' },
  results: { type: Array, default: [] },
  resultCount: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // TTL: 24 hours (in seconds) — auto-deleted by MongoDB
  },
});

export default mongoose.model('JobCache', jobCacheSchema);
