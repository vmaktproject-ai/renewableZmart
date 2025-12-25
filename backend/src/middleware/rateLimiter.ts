import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Simple in-memory rate limiter
export const rateLimiter = (options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) => {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.' } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Clean up old entries every 100 requests
    if (Object.keys(store).length > 1000) {
      const now = Date.now();
      Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
          delete store[key];
        }
      });
    }

    const identifier = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[identifier] || store[identifier].resetTime < now) {
      store[identifier] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    store[identifier].count++;

    if (store[identifier].count > maxRequests) {
      return res.status(429).json({
        message,
        retryAfter: Math.ceil((store[identifier].resetTime - now) / 1000),
      });
    }

    next();
  };
};

// Stricter rate limiter for auth endpoints
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 20 requests per 15 minutes (allows reasonable testing)
  message: 'Too many authentication attempts, please try again later.',
});

// General API rate limiter
export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'Too many requests, please slow down.',
});
