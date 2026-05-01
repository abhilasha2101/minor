/**
 * Rate Limiter Middleware — In-memory IP-based request throttling.
 * Limits clients to a configurable number of requests per time window.
 * State resets on server restart (sufficient for prototype; use Redis for production).
 */

const store = new Map();
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 15;

/**
 * Create a rate limiter middleware with custom options.
 * @param {object} [options]
 * @param {number} [options.windowMs=60000] - Time window in milliseconds
 * @param {number} [options.maxRequests=15] - Max requests per window
 * @returns {Function} Express middleware
 */
export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests || DEFAULT_MAX_REQUESTS;

  return function rateLimiter(req, res, next) {
    const clientIp = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!store.has(clientIp)) {
      store.set(clientIp, []);
    }

    // Clean old timestamps outside the window
    const timestamps = store.get(clientIp).filter(t => t > windowStart);
    store.set(clientIp, timestamps);

    if (timestamps.length >= maxRequests) {
      const retryAfter = Math.ceil((timestamps[0] + windowMs - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', '0');
      return res.status(429).json({
        error: { message: `Too many requests. Please try again in ${retryAfter} seconds.` }
      });
    }

    timestamps.push(now);
    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(maxRequests - timestamps.length));
    next();
  };
}

// Periodically clean up stale entries (every 5 minutes)
setInterval(() => {
  const cutoff = Date.now() - DEFAULT_WINDOW_MS * 2;
  for (const [ip, timestamps] of store) {
    const active = timestamps.filter(t => t > cutoff);
    if (active.length === 0) {
      store.delete(ip);
    } else {
      store.set(ip, active);
    }
  }
}, 5 * 60 * 1000);
