/**
 * Rate Limiting Middleware
 * Protects API routes from abuse
 */

import { NextRequest } from 'next/server';
import { logger } from './logger';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production for distributed systems)
const store: RateLimitStore = {};

// Default configurations for different endpoints
export const RateLimitPresets = {
  strict: { interval: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  moderate: { interval: 60 * 1000, maxRequests: 30 }, // 30 requests per minute
  relaxed: { interval: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
  auth: { interval: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
};

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get user ID from auth (if available)
  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] :
             request.headers.get('x-real-ip') ||
             'unknown';

  return ip;
}

/**
 * Clean up expired entries from store
 */
function cleanupStore(): void {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupStore, 5 * 60 * 1000);
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RateLimitPresets.moderate
): {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const clientId = getClientId(request);
  const key = `${clientId}:${request.nextUrl.pathname}`;
  const now = Date.now();

  // Get or initialize entry
  let entry = store[key];

  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      count: 0,
      resetTime: now + config.interval,
    };
    store[key] = entry;
  }

  // Increment counter
  entry.count++;

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const reset = Math.ceil((entry.resetTime - now) / 1000);

  // Log if rate limit exceeded
  if (!allowed) {
    logger.security('Rate limit exceeded', {
      clientId,
      path: request.nextUrl.pathname,
      count: entry.count,
      limit: config.maxRequests,
    });
  }

  return {
    allowed,
    limit: config.maxRequests,
    remaining,
    reset,
  };
}

/**
 * Rate limit decorator for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  config: RateLimitConfig = RateLimitPresets.moderate
) {
  return async (request: NextRequest): Promise<Response> => {
    const rateLimit = checkRateLimit(request, config);

    // Add rate limit headers to response
    const headers = {
      'X-RateLimit-Limit': rateLimit.limit.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': rateLimit.reset.toString(),
    };

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            retryAfter: rateLimit.reset,
          },
        }),
        {
          status: 429,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            'Retry-After': rateLimit.reset.toString(),
          },
        }
      );
    }

    // Execute handler and add rate limit headers
    const response = await handler(request);

    // Clone response to add headers
    const newResponse = new Response(response.body, response);
    Object.entries(headers).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });

    return newResponse;
  };
}

/**
 * Reset rate limit for a specific client (admin function)
 */
export function resetRateLimit(clientId: string, path?: string): void {
  if (path) {
    const key = `${clientId}:${path}`;
    delete store[key];
  } else {
    // Reset all entries for this client
    Object.keys(store).forEach((key) => {
      if (key.startsWith(`${clientId}:`)) {
        delete store[key];
      }
    });
  }

  logger.info('Rate limit reset', { clientId, path });
}
