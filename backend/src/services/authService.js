/**
 * Auth Service — Business logic for user authentication.
 * Handles password hashing, comparison, and session token generation.
 * Uses a simple stateless token (Base64-encoded JSON) — suitable for prototype.
 * For production: replace with JWT (jsonwebtoken) + refresh tokens.
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'veritas-dev-secret-2026';

/**
 * Hash a plaintext password.
 * @param {string} password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plaintext password against a hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a simple session token for a user.
 * Encodes user ID, email, and expiry into Base64 JSON.
 * NOTE: For a real production app, use JWT with proper signing.
 * @param {object} user - User record { id, email, username }
 * @returns {string} Base64 encoded token
 */
export function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    secret: TOKEN_SECRET
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Decode and validate a session token.
 * @param {string} token - Base64 encoded token
 * @returns {object|null} Decoded payload or null if invalid/expired
 */
export function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

    if (!payload.userId || !payload.email || !payload.exp) {
      return null;
    }

    if (payload.secret !== TOKEN_SECRET) {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null; // Token expired
    }

    return {
      userId: payload.userId,
      email: payload.email,
      username: payload.username
    };
  } catch {
    return null;
  }
}
