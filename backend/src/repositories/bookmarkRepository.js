/**
 * Bookmark Repository — Data access layer for the bookmarks table.
 * Handles saving, retrieving, and deleting user bookmarks.
 */

import { getDatabase } from '../config/database.js';
import { v4Lite } from '../utils/id.js';

/**
 * Get all bookmarks for a user, ordered by most recent first.
 * @param {number} userId
 * @returns {object[]} Array of bookmark records
 */
export function getBookmarksByUser(userId) {
  const db = getDatabase();
  const rows = db.prepare(
    'SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC'
  ).all(userId);

  return rows.map(row => ({
    id: row.id,
    articleId: row.article_id,
    title: row.title,
    category: row.category,
    summary: row.summary,
    fullArticle: row.full_article,
    imageUrl: row.image_url,
    date: row.date,
    author: row.author,
    verifiedStatus: row.verified_status,
    confidence: row.confidence,
    source: row.source,
    createdAt: row.created_at
  }));
}

/**
 * Add a bookmark for a user. If duplicate (user_id + article_id), skip silently.
 * @param {number} userId
 * @param {object} article - The article data to bookmark
 * @returns {object} The created or existing bookmark
 */
export function addBookmark(userId, article) {
  const db = getDatabase();

  // Check if already bookmarked
  const existing = db.prepare(
    'SELECT id FROM bookmarks WHERE user_id = ? AND article_id = ?'
  ).get(userId, article.id || article.articleId);

  if (existing) {
    return { id: existing.id, alreadyExists: true };
  }

  const id = `bm-${v4Lite()}`;
  db.prepare(`
    INSERT INTO bookmarks (id, user_id, article_id, title, category, summary, full_article, image_url, date, author, verified_status, confidence, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, userId,
    article.id || article.articleId,
    article.title || '',
    article.category || '',
    article.summary || '',
    article.fullArticle || article.full_article || '',
    article.imageUrl || article.image_url || '',
    article.date || '',
    article.author || '',
    article.verifiedStatus || article.verified_status || '',
    article.confidence || 0,
    article.source || ''
  );

  return { id, alreadyExists: false };
}

/**
 * Remove a bookmark by bookmark ID and user ID.
 * @param {number} userId
 * @param {string} bookmarkId - Can be the bookmark row ID or the article_id
 * @returns {boolean} Whether a row was deleted
 */
export function removeBookmark(userId, bookmarkId) {
  const db = getDatabase();

  // Try deleting by bookmark id first, then by article_id
  let result = db.prepare('DELETE FROM bookmarks WHERE id = ? AND user_id = ?').run(bookmarkId, userId);
  if (result.changes === 0) {
    result = db.prepare('DELETE FROM bookmarks WHERE article_id = ? AND user_id = ?').run(bookmarkId, userId);
  }

  return result.changes > 0;
}

/**
 * Check if a specific article is bookmarked by a user.
 * @param {number} userId
 * @param {string} articleId
 * @returns {boolean}
 */
export function isBookmarked(userId, articleId) {
  const db = getDatabase();
  const row = db.prepare(
    'SELECT 1 FROM bookmarks WHERE user_id = ? AND article_id = ?'
  ).get(userId, articleId);
  return !!row;
}

/**
 * Get bookmark count for a user.
 * @param {number} userId
 * @returns {number}
 */
export function getBookmarkCount(userId) {
  const db = getDatabase();
  const row = db.prepare('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?').get(userId);
  return row.count;
}
