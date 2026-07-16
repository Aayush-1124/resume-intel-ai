import { ZodError } from 'zod';

/**
 * Middleware to validate request body, query, and params using Zod schemas.
 * 
 * @param {AnyZodObject} schema - The Zod schema to validate against
 */
export const validateRequest = (schema) => async (req, res, next) => {
  try {
    // Parse async will throw a ZodError if validation fails
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Pass the ZodError to the centralized error handler
      return next(error);
    }
    return next(error);
  }
};
