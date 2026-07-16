import logger from './logger.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Executes an async function with exponential backoff retry logic.
 * Only retries on specific transient errors (like 429 Rate Limit or 5xx Server Errors).
 * 
 * @param {Function} fn - The async function to execute.
 * @param {string} serviceName - Name of the service being called (for logging).
 * @param {number} maxRetries - Maximum number of retries (default 3).
 * @returns {Promise<any>}
 */
export async function fetchWithRetry(fn, serviceName = 'ExternalService', maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable (429 Too Many Requests, or 5xx Server Error, or network timeout)
      const isRetryable = 
        error.status === 429 || 
        (error.status >= 500 && error.status < 600) ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('429') ||
        error.message?.includes('Quota') ||
        error.message?.includes('RESOURCE_EXHAUSTED');

      if (!isRetryable || attempt === maxRetries) {
        // If it's not retryable or we've hit max retries, throw a structured ApiError
        logger.error({ err: error, serviceName, attempt }, `${serviceName} request failed permanently.`);
        
        const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota');
        
        throw new ApiError(
          isRateLimit ? 429 : (error.status || 502),
          isRateLimit ? 'RATE_LIMIT_EXCEEDED' : 'EXTERNAL_SERVICE_ERROR',
          `${serviceName} is currently unavailable or rate-limited. Please try again later.`,
          true // retryable by the user later
        );
      }

      // Exponential backoff: 1s, 2s, 4s...
      const delayMs = Math.pow(2, attempt) * 1000;
      logger.warn({ serviceName, attempt, delayMs, errorMsg: error.message }, `${serviceName} transient failure, retrying...`);
      
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
