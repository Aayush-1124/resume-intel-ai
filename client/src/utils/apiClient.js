/**
 * Global API Client & Interceptor
 * Maps raw HTTP errors → friendly user-facing messages (never shows raw 404/500 codes).
 */

// Clean up trailing slashes
let base = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
if (base.startsWith('http') && !base.endsWith('/api')) {
  base += '/api';
}
export const API_BASE_URL = base;

/* ── Friendly message maps ─────────────────────────────────────────── */

/** Backend error code → friendly message */
const ERROR_CODE_MESSAGES = {
  // AI / Gemini
  RESOURCE_EXHAUSTED:    { msg: '🚦 Rate limit reached. Please wait a moment and try again.', retryable: true },
  AI_PARSE_ERROR:        { msg: '🤖 AI had trouble reading that file. Please try again.', retryable: true },
  AI_TIMEOUT:            { msg: '⏱️ AI is taking too long — possibly heavy traffic. Try again shortly.', retryable: true },
  ETIMEDOUT:             { msg: '⏱️ Request timed out. Server may be under heavy load. Try again shortly.', retryable: true },
  // File uploads
  INVALID_FILE_TYPE:     { msg: '📄 Invalid file type. Please upload a PDF or DOCX (max 10 MB).', retryable: false },
  MISSING_FILE:          { msg: '📎 No file was attached. Please select a PDF or DOCX to upload.', retryable: false },
  FILE_TOO_LARGE:        { msg: '📦 File is too large. Please upload a file under 10 MB.', retryable: false },
  // Server / DB
  INTERNAL_SERVER_ERROR: { msg: '🛠️ Something went wrong on our end. Hang tight — try again in a moment.', retryable: true },
  DATABASE_ERROR:        { msg: '🗄️ Database hiccup. Your data is safe — please try again.', retryable: true },
  MISSING_API_KEY:       { msg: '🔑 AI service is temporarily unavailable. Please try again later.', retryable: true },
  // Auth / validation
  VALIDATION_ERROR:      { msg: '✏️ Some fields look incorrect. Please check your input and try again.', retryable: false },
  UNAUTHORIZED:          { msg: '🔒 Session expired. Please refresh the page.', retryable: false },
  // Network
  OFFLINE:               { msg: '📡 No internet connection. Please check your network and try again.', retryable: true },
  NETWORK_ERROR:         { msg: "🌐 Can't reach the server. It might be under heavy traffic — try again shortly.", retryable: true },
};

/** HTTP status code → friendly message (fallback) */
const HTTP_STATUS_MESSAGES = {
  400: { msg: '✏️ Invalid request. Please check your input and try again.', retryable: false },
  401: { msg: '🔒 Session expired. Please refresh the page.', retryable: false },
  403: { msg: "🚫 You don't have permission to do that.", retryable: false },
  404: { msg: "🔍 Couldn't find what you were looking for. Please try again.", retryable: false },
  408: { msg: '⏱️ Request timed out. The server is under heavy load — try again shortly.', retryable: true },
  429: { msg: '🚦 Too many requests — rate limit hit. Please wait a moment and try again.', retryable: true },
  500: { msg: '🛠️ Server error. We\'re working on it — try again in a moment.', retryable: true },
  502: { msg: '🚧 Service temporarily down (bad gateway). Please try again shortly.', retryable: true },
  503: { msg: '🚧 Server is under heavy traffic and unavailable. Please try again in a moment.', retryable: true },
  504: { msg: '⏱️ Gateway timeout — the server is taking too long. Try again shortly.', retryable: true },
  505: { msg: '🔧 HTTP version not supported by the server. Please contact support if this persists.', retryable: false },
};

function getFriendlyMessage(code, status) {
  if (code && ERROR_CODE_MESSAGES[code]) return ERROR_CODE_MESSAGES[code];
  if (status && HTTP_STATUS_MESSAGES[status]) return HTTP_STATUS_MESSAGES[status];
  return { msg: '⚠️ Something unexpected happened. Please try again.', retryable: true };
}

/* ── Toast dispatcher ──────────────────────────────────────────────── */

/**
 * Show a toast notification globally.
 * @param {string} message
 * @param {'error'|'success'|'info'|'warning'} type
 * @param {number} duration ms (0 = persistent)
 * @param {Function|null} onRetry if provided, a "Try Again" button appears on the toast
 */
export const showToast = (message, type = 'error', duration = 5000, onRetry = null) => {
  window.dispatchEvent(
    new CustomEvent('app:toast', { detail: { message, type, duration, onRetry } })
  );
};

export class ApiError extends Error {
  constructor(message, code, referenceId, retryable, statusCode = null) {
    super(message);
    this.code = code;
    this.referenceId = referenceId;
    this.retryable = retryable;
    this.statusCode = statusCode; // actual HTTP status code for fine-grained UI handling
  }
}

export const apiClient = async (endpoint, options = {}) => {
  if (!navigator.onLine) {
    const { msg } = getFriendlyMessage('OFFLINE', null);
    showToast(msg, 'error', 0, () => window.location.reload());
    throw new ApiError(msg, 'OFFLINE', null, true);
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
      const errorCode = data?.error?.code || null;
      const { msg, retryable } = getFriendlyMessage(errorCode, response.status);
      const retryFn = retryable ? () => apiClient(endpoint, options) : null;

      showToast(msg, 'error', 6000, retryFn);
      throw new ApiError(
        msg,
        errorCode || 'HTTP_ERROR',
        data?.error?.referenceId || null,
        retryable,
        response.status  // ← pass the real HTTP status so UI can react precisely
      );
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;

    // Generic fetch failure (CORS, DNS, server unreachable)
    const { msg, retryable } = getFriendlyMessage('NETWORK_ERROR', null);
    const retryFn = retryable ? () => apiClient(endpoint, options) : null;
    showToast(msg, 'error', 6000, retryFn);
    throw new ApiError(msg, 'NETWORK_ERROR', null, true);
  }
};
