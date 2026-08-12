/**
 * In-flight request deduplication.
 *
 * If two requests arrive simultaneously with the same cache key,
 * only one Gemini call is made. The second awaits the first's promise.
 * Prevents "thundering herd" on cache misses (e.g. user double-clicks).
 */

/** @type {Map<string, Promise<any>>} */
const inFlight = new Map();

/**
 * Execute fn() exactly once per key while it is pending.
 * Concurrent callers with the same key share the same promise.
 *
 * @param {string}            key   - Cache / dedup key
 * @param {() => Promise<any>} fn   - Async factory (only called once per key)
 * @returns {Promise<any>}
 */
export async function withInflight(key, fn) {
  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const promise = fn().finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, promise);
  return promise;
}
