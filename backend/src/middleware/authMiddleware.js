/**
 * Auth Middleware — Protects routes that require authentication.
 * Extracts the token from the Authorization header and validates it.
 */

import { verifyToken } from '../services/authService.js';
import * as userRepository from '../repositories/userRepository.js';

/**
 * Required auth middleware. Returns 401 if no valid token.
 * Attaches req.user = { userId, email, username } on success.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: { message: 'Authentication required. Please sign in.' }
    });
  }

  const token = authHeader.slice(7); // Remove 'Bearer '
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      error: { message: 'Session expired or invalid. Please sign in again.' }
    });
  }

  // Verify user still exists in database
  const user = userRepository.findById(decoded.userId);
  if (!user) {
    return res.status(401).json({
      error: { message: 'User account not found.' }
    });
  }

  req.user = {
    userId: decoded.userId,
    email: decoded.email,
    username: decoded.username
  };

  next();
}

/**
 * Optional auth middleware. Attaches req.user if token is valid, but
 * doesn't block the request if no token is provided.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username
      };
    }
  }

  next();
}
