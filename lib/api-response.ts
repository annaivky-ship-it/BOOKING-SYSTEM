/**
 * API Response Helpers
 * Standardized response formatting for API routes
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Success response helper
 */
export function success<T>(data: T, message?: string, status: number = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Error response helper
 */
export function error(
  message: string,
  code: string = 'INTERNAL_ERROR',
  status: number = 500,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

/**
 * Validation error response (from Zod)
 */
export function validationError(zodError: ZodError): NextResponse<ApiErrorResponse> {
  return error(
    'Validation failed',
    'VALIDATION_ERROR',
    400,
    zodError.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }))
  );
}

/**
 * Unauthorized response
 */
export function unauthorized(message: string = 'Unauthorized'): NextResponse<ApiErrorResponse> {
  return error(message, 'UNAUTHORIZED', 401);
}

/**
 * Forbidden response
 */
export function forbidden(message: string = 'Forbidden'): NextResponse<ApiErrorResponse> {
  return error(message, 'FORBIDDEN', 403);
}

/**
 * Not found response
 */
export function notFound(message: string = 'Resource not found'): NextResponse<ApiErrorResponse> {
  return error(message, 'NOT_FOUND', 404);
}

/**
 * Conflict response
 */
export function conflict(message: string = 'Resource already exists'): NextResponse<ApiErrorResponse> {
  return error(message, 'CONFLICT', 409);
}

/**
 * Rate limit response
 */
export function rateLimit(message: string = 'Too many requests'): NextResponse<ApiErrorResponse> {
  return error(message, 'RATE_LIMIT_EXCEEDED', 429);
}

/**
 * Internal server error response
 */
export function serverError(message: string = 'Internal server error'): NextResponse<ApiErrorResponse> {
  return error(message, 'INTERNAL_ERROR', 500);
}

/**
 * Bad request response
 */
export function badRequest(message: string = 'Bad request', details?: any): NextResponse<ApiErrorResponse> {
  return error(message, 'BAD_REQUEST', 400, details);
}

/**
 * Service unavailable response
 */
export function serviceUnavailable(
  message: string = 'Service temporarily unavailable'
): NextResponse<ApiErrorResponse> {
  return error(message, 'SERVICE_UNAVAILABLE', 503);
}

/**
 * Handle common errors
 */
export function handleError(err: unknown): NextResponse<ApiErrorResponse> {
  // Zod validation errors
  if (err instanceof ZodError) {
    return validationError(err);
  }

  // Custom API errors
  if (err instanceof Error) {
    // Database errors
    if (err.message.includes('duplicate key')) {
      return conflict('Resource already exists');
    }

    if (err.message.includes('not found')) {
      return notFound();
    }

    // Log the error for debugging
    console.error('API Error:', err);

    // Return generic error in production, detailed in development
    if (process.env.NODE_ENV === 'production') {
      return serverError();
    }

    return serverError(err.message);
  }

  // Unknown error
  console.error('Unknown error:', err);
  return serverError();
}
