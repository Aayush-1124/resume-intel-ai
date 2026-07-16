import crypto from 'crypto';
import logger from '../utils/logger.js';

/**
 * Custom ApiError class for structured operational errors
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
 */
export function errorHandler(err, req, res, next) {
  // Extract or generate a reference ID for the user
  const referenceId = req.id || crypto.randomUUID();

  // If the error is our custom ApiError, send it gracefully
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
        message: err.message,
        retryable: err.retryable,
        referenceId,
      }
    });
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    logger.warn({
      referenceId,
      issues: err.errors,
      path: req.path,
    }, 'Validation Error');

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        retryable: false,
        referenceId,
      }
    });
  }

  // Log unexpected/unhandled errors with stack trace for backend observability
  logger.error({
    referenceId,
    err,
    path: req.path,
    method: req.method,
    body: req.body,
  }, 'Unhandled Server Error');

  // Send a safe generic message to the client
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred on our end. Please try again later or contact support with the reference ID.',
      retryable: true,
      referenceId,
    }
  });
}
