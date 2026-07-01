/**
 * Simple in-memory LRU cache with TTL support.
 * - Max 100 entries
 * - 5-minute TTL per entry
 * - Auto-cleanup of expired entries on access
 */

const MAX_ENTRIES = 100;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

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
   */
  set(key, value) {
    // Delete first so re-insertion goes to end of Map
    if (this._map.has(key)) {
      this._map.delete(key);
    }

    // Evict oldest entries if at capacity
    while (this._map.size >= MAX_ENTRIES) {
      const oldestKey = this._map.keys().next().value;
      this._map.delete(oldestKey);
    }

    this._map.set(key, { value, expiresAt: Date.now() + TTL_MS });
  }

  /**
   * Check whether a non-expired entry exists for the given key.
   * @param {string} key
   * @returns {boolean}
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
}

// Export a singleton instance
const cache = new LRUCache();
export default cache;
