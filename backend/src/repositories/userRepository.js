/**
 * User Repository — Data access layer for the users table.
 * All direct database operations for user records.
 */

import { getDatabase } from '../config/database.js';

/**
 * Create a new user record.
 * @param {{ username: string, email: string, password: string, interests: string[] }} userData
 * @returns {object} The created user (without password)
 */
export function createUser({ username, email, password, interests }) {
  const db = getDatabase();
  const avatarColors = ['#7c83ff', '#ff6b9d', '#00c9a7', '#ffa726', '#ab47bc', '#42a5f5'];
  const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  const stmt = db.prepare(`
    INSERT INTO users (username, email, password, interests, avatar_color)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(username, email, password, JSON.stringify(interests), avatarColor);

  return {
    id: result.lastInsertRowid,
    username,
    email,
    interests,
    avatarColor,
    createdAt: new Date().toISOString()
  };
}

/**
 * Find a user by email address.
 * @param {string} email
 * @returns {object|null} Full user row or null
 */
export function findByEmail(email) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) || null;
}

/**
 * Find a user by ID.
 * @param {number} id
 * @returns {object|null} Full user row or null
 */
export function findById(id) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) || null;
}

/**
 * Update user interests categories.
 * @param {number} userId
 * @param {string[]} interests
 * @returns {boolean} Success
 */
export function updateInterests(userId, interests) {
  const db = getDatabase();
  const result = db.prepare('UPDATE users SET interests = ? WHERE id = ?')
    .run(JSON.stringify(interests), userId);
  return result.changes > 0;
}

/**
 * Update user profile fields (username, avatar_color, bio, location, avatar_url).
 * @param {number} userId
 * @param {{ username?: string, avatarColor?: string, bio?: string, location?: string, avatarUrl?: string }} fields
 * @returns {boolean} Success
 */
export function updateProfile(userId, fields) {
  const db = getDatabase();
  const updates = [];
  const values = [];

  if (fields.username !== undefined) {
    updates.push('username = ?');
    values.push(fields.username);
  }
  if (fields.avatarColor !== undefined) {
    updates.push('avatar_color = ?');
    values.push(fields.avatarColor);
  }
  if (fields.bio !== undefined) {
    updates.push('bio = ?');
    values.push(fields.bio);
  }
  if (fields.location !== undefined) {
    updates.push('location = ?');
    values.push(fields.location);
  }
  if (fields.avatarUrl !== undefined) {
    updates.push('avatar_url = ?');
    values.push(fields.avatarUrl);
  }

  if (updates.length === 0) return false;

  values.push(userId);
  const result = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  return result.changes > 0;
}

/**
 * Get total user count (for stats).
 * @returns {number}
 */
export function getUserCount() {
  const db = getDatabase();
  const row = db.prepare('SELECT COUNT(*) as count FROM users').get();
  return row.count;
}
