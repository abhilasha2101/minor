/**
 * Claim Repository — Data access layer for the claims_history table.
 * Logs every verification the user runs and provides history retrieval.
 */

import { getDatabase } from '../config/database.js';
import { timestampId } from '../utils/id.js';

/**
 * Save a verification result to the user's history.
 * @param {number} userId
 * @param {object} claimData - Claim text, type, and parsed result
 * @returns {object} The created history record
 */
export function saveClaim(userId, claimData) {
  const db = getDatabase();
  const id = timestampId('hist');

  db.prepare(`
    INSERT INTO claims_history (id, user_id, claim, type, verdict, confidence, summary, key_findings, sources_checked, red_flags, advice)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    claimData.claim || '',
    claimData.type || 'text',
    claimData.verdict || 'UNVERIFIED',
    claimData.confidence || 0,
    claimData.summary || '',
    JSON.stringify(claimData.key_findings || []),
    JSON.stringify(claimData.sources_checked || []),
    JSON.stringify(claimData.red_flags || []),
    claimData.advice || ''
  );

  return { id, ...claimData, timestamp: new Date().toISOString() };
}

/**
 * Get claim history for a user, ordered by most recent first.
 * @param {number} userId
 * @param {number} [limit=20] - Max number of records
 * @returns {object[]} Array of history records
 */
export function getHistoryByUser(userId, limit = 20) {
  const db = getDatabase();
  const rows = db.prepare(
    'SELECT * FROM claims_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?'
  ).all(userId, limit);

  return rows.map(row => ({
    id: row.id,
    claim: row.claim,
    type: row.type,
    verdict: row.verdict,
    confidence: row.confidence,
    summary: row.summary,
    keyFindings: safeParseJSON(row.key_findings),
    sourcesChecked: safeParseJSON(row.sources_checked),
    redFlags: safeParseJSON(row.red_flags),
    advice: row.advice,
    timestamp: row.timestamp
  }));
}

/**
 * Clear all claim history for a user.
 * @param {number} userId
 * @returns {number} Number of deleted records
 */
export function clearHistory(userId) {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM claims_history WHERE user_id = ?').run(userId);
  return result.changes;
}

/**
 * Get total claim count for a user.
 * @param {number} userId
 * @returns {number}
 */
export function getClaimCount(userId) {
  const db = getDatabase();
  const row = db.prepare('SELECT COUNT(*) as count FROM claims_history WHERE user_id = ?').get(userId);
  return row.count;
}

/**
 * Get a single claim record by ID.
 * @param {string} claimId
 * @returns {object|null}
 */
export function getClaimById(claimId) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM claims_history WHERE id = ?').get(claimId) || null;
}

function safeParseJSON(str) {
  try {
    return JSON.parse(str || '[]');
  } catch {
    return [];
  }
}
