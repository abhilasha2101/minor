/**
 * Community Repository — Data access layer for community_requests and upvotes tables.
 * Manages crowd-sourced fact-check requests, upvote tracking, and status updates.
 */

import { getDatabase } from '../config/database.js';
import { timestampId } from '../utils/id.js';

/**
 * Get all community requests with upvote counts, ordered by popularity.
 * @param {number|null} userId - Current user ID (to check if they've upvoted)
 * @returns {object[]}
 */
export function getAllRequests(userId = null) {
  const db = getDatabase();

  const rows = db.prepare(`
    SELECT 
      cr.*,
      COUNT(u.user_id) as upvote_count
    FROM community_requests cr
    LEFT JOIN upvotes u ON u.request_id = cr.id
    GROUP BY cr.id
    ORDER BY upvote_count DESC, cr.created_at DESC
  `).all();

  // If userId provided, also get which requests they've upvoted
  let userUpvotes = new Set();
  if (userId) {
    const upvoteRows = db.prepare('SELECT request_id FROM upvotes WHERE user_id = ?').all(userId);
    userUpvotes = new Set(upvoteRows.map(r => r.request_id));
  }

  return rows.map(row => ({
    id: row.id,
    claim: row.claim,
    category: row.category,
    requestedBy: row.requested_by_name || 'Anonymous',
    requestedById: row.requested_by_id,
    upvotes: row.upvote_count,
    hasUpvoted: userUpvotes.has(row.id),
    status: row.status,
    createdAt: row.created_at
  }));
}

/**
 * Create a new community fact-check request.
 * @param {{ claim: string, category: string }} data
 * @param {number|null} userId
 * @param {string} username
 * @returns {object} The created request
 */
export function createRequest(data, userId, username) {
  const db = getDatabase();
  const id = timestampId('req');

  db.prepare(`
    INSERT INTO community_requests (id, claim, category, requested_by_name, requested_by_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, data.claim, data.category, username || 'Anonymous', userId);

  // Auto-upvote own request
  if (userId) {
    db.prepare('INSERT OR IGNORE INTO upvotes (request_id, user_id) VALUES (?, ?)').run(id, userId);
  }

  return {
    id,
    claim: data.claim,
    category: data.category,
    requestedBy: username || 'Anonymous',
    upvotes: userId ? 1 : 0,
    hasUpvoted: !!userId,
    status: 'UNVERIFIED',
    createdAt: new Date().toISOString()
  };
}

/**
 * Toggle upvote on a community request (add or remove).
 * @param {string} requestId
 * @param {number} userId
 * @returns {{ upvoted: boolean, newCount: number }}
 */
export function toggleUpvote(requestId, userId) {
  const db = getDatabase();

  // Check if the request exists
  const request = db.prepare('SELECT id FROM community_requests WHERE id = ?').get(requestId);
  if (!request) {
    throw new Error('Community request not found.');
  }

  // Check current upvote state
  const existing = db.prepare(
    'SELECT 1 FROM upvotes WHERE request_id = ? AND user_id = ?'
  ).get(requestId, userId);

  if (existing) {
    // Remove upvote
    db.prepare('DELETE FROM upvotes WHERE request_id = ? AND user_id = ?').run(requestId, userId);
  } else {
    // Add upvote
    db.prepare('INSERT INTO upvotes (request_id, user_id) VALUES (?, ?)').run(requestId, userId);
  }

  // Get new count
  const countRow = db.prepare(
    'SELECT COUNT(*) as count FROM upvotes WHERE request_id = ?'
  ).get(requestId);

  return {
    upvoted: !existing,
    newCount: countRow.count
  };
}

/**
 * Update the status of a community request (e.g., from UNVERIFIED to VERIFIED).
 * @param {string} requestId
 * @param {string} status
 * @returns {boolean}
 */
export function updateRequestStatus(requestId, status) {
  const db = getDatabase();
  const result = db.prepare('UPDATE community_requests SET status = ? WHERE id = ?').run(status, requestId);
  return result.changes > 0;
}

/**
 * Get a single request by ID.
 * @param {string} requestId
 * @returns {object|null}
 */
export function getRequestById(requestId) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM community_requests WHERE id = ?').get(requestId) || null;
}
