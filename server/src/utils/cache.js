/**
 * LRU cache with per-entry TTL support.
 * - Max 200 entries (increased from 100 to accommodate longer TTLs)
 * - Default TTL: 60 minutes
 * - Per-entry TTL via set(key, value, ttlSeconds)
 */

const MAX_ENTRIES = 200;
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 60 minutes

class LRUCache {
  constructor() {
    /** @type {Map<string, { value: any, expiresAt: number }>} */
    this._map = new Map();
  }

  /**
   * Retrieve a cached value. Returns undefined if missing or expired.
   * @param {string} key
   */
  get(key) {
    const entry = this._map.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this._map.delete(key);
      return undefined;
    }

    // Move to end (most-recently used)
    this._map.delete(key);
    this._map.set(key, entry);
    return entry.value;
  }

  /**
   * Store a value in the cache.
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlSeconds] - TTL in seconds. Defaults to 60 minutes.
   */
  set(key, value, ttlSeconds) {
    const ttlMs = ttlSeconds != null ? ttlSeconds * 1000 : DEFAULT_TTL_MS;

    if (this._map.has(key)) {
      this._map.delete(key);
    }

    while (this._map.size >= MAX_ENTRIES) {
      const oldestKey = this._map.keys().next().value;
      this._map.delete(oldestKey);
    }

    this._map.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /**
   * Check whether a non-expired entry exists for the given key.
   * @param {string} key
   */
  has(key) {
    const entry = this._map.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this._map.delete(key);
      return false;
    }
    return true;
  }

  /** Current number of live (non-expired) entries */
  get size() {
    return this._map.size;
  }
}

const cache = new LRUCache();
export default cache;
