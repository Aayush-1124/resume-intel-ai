import crypto from 'crypto';
import logger from '../utils/logger.js';

/**
 * Custom ApiError class for structured operational errors.
 * statusCode: HTTP status
 * code:       machine-readable code (matched in frontend ERROR_CODE_MESSAGES map)
 * message:    internal/log message (NOT shown to user — frontend maps code → friendly msg)
 * retryable:  whether the client should offer a retry
 */
export class ApiError extends Error {
  constructor(statusCode, code, message, retryable = false) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.retryable = retryable;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized Error Handling Middleware
 * Always returns structured { success, error: { code, message, retryable, referenceId } }
 * The frontend apiClient.js maps `code` to a human-friendly message — never raw HTTP codes.
 */
export function errorHandler(err, req, res, next) {
  const referenceId = req.id || crypto.randomUUID();

  // ── Operational ApiErrors (known, expected) ──────────────────────
  if (err instanceof ApiError) {
    logger.warn({
      referenceId,
      code: err.code,
      message: err.message,
      path: req.path,
    }, 'Operational API Error');

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,    // internal — frontend overrides with friendly msg
        retryable: err.retryable,
        referenceId,
      },
    });
  }

  // ── Multer / file upload errors ───────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'File exceeds the 10 MB limit.',
        retryable: false,
        referenceId,
      },
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Unexpected file field in upload.',
        retryable: false,
        referenceId,
      },
    });
  }

  // ── Zod validation errors ─────────────────────────────────────────
  if (err.name === 'ZodError') {
    logger.warn({ referenceId, issues: err.errors, path: req.path }, 'Validation Error');

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data.',
        details: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        retryable: false,
        referenceId,
      },
    });
  }

  // ── Gemini / AI quota errors ──────────────────────────────────────
  if (err.status === 429 || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('429')) {
    logger.warn({ referenceId, path: req.path }, 'Gemini Rate Limit Hit');

    return res.status(429).json({
      success: false,
      error: {
        code: 'RESOURCE_EXHAUSTED',
        message: 'AI rate limit reached.',
        retryable: true,
        referenceId,
      },
    });
  }

  // ── Timeout errors ────────────────────────────────────────────────
  if (err.code === 'ETIMEDOUT' || err.message?.includes('timed out')) {
    return res.status(408).json({
      success: false,
      error: {
        code: 'AI_TIMEOUT',
        message: 'The request timed out.',
        retryable: true,
        referenceId,
      },
    });
  }

  // ── Unhandled / unexpected errors ────────────────────────────────
  logger.error({
    referenceId,
    err,
    path: req.path,
    method: req.method,
  }, 'Unhandled Server Error');

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred on our end.',
      retryable: true,
      referenceId,
    },
  });
}
