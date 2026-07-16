/**
 * Global API Client & Interceptor
 */
// Clean up trailing slashes
let base = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
// Ensure it points to /api if it's a remote URL that doesn't include it
if (base.startsWith('http') && !base.endsWith('/api')) {
  base += '/api';
}
export const API_BASE_URL = base;

/**
 * Dispatch a custom event to show a toast notification globally
 */
export const showToast = (message, type = 'error', duration = 4000) => {
  window.dispatchEvent(
    new CustomEvent('app:toast', { detail: { message, type, duration } })
  );
};

export class ApiError extends Error {
  constructor(message, code, referenceId, retryable) {
    super(message);
    this.code = code;
    this.referenceId = referenceId;
    this.retryable = retryable;
  }
}

export const apiClient = async (endpoint, options = {}) => {
  if (!navigator.onLine) {
    const errorMsg = 'No internet connection. Please check your network and try again.';
    showToast(errorMsg, 'error');
    throw new ApiError(errorMsg, 'OFFLINE', null, true);
  }

  try {
    const isFormData = options.body instanceof FormData;
    const headers = { ...options.headers };
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Backend structured error format
      if (data && data.error) {
        const errorDetail = data.error;
        let userMessage = errorDetail.message || 'An unexpected error occurred.';
        
        // Append reference ID if available for tracking
        if (errorDetail.referenceId) {
          userMessage += ` (Ref: ${errorDetail.referenceId.split('-')[0]})`;
        }

        showToast(userMessage, 'error');
        throw new ApiError(
          userMessage,
          errorDetail.code,
          errorDetail.referenceId,
          errorDetail.retryable
        );
      }

      // Fallback for non-structured errors
      const fallbackMsg = `Server Error (${response.status}). Please try again later.`;
      showToast(fallbackMsg, 'error');
      throw new ApiError(fallbackMsg, 'HTTP_ERROR', null, true);
    }

    return data;
  } catch (err) {
    // If it's already an ApiError (from above), just rethrow
    if (err instanceof ApiError) throw err;

    // Handle generic fetch failures (e.g., CORS, network unreachable)
    const netError = 'Network error. The server might be unreachable.';
    showToast(netError, 'error');
    throw new ApiError(netError, 'NETWORK_ERROR', null, true);
  }
};
