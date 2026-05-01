/**
 * Profile Controller — Handles user history, bookmarks, and stats.
 */

import * as claimRepository from '../repositories/claimRepository.js';
import * as bookmarkRepository from '../repositories/bookmarkRepository.js';
import * as userRepository from '../repositories/userRepository.js';

/**
 * GET /api/profile/history
 * Get the authenticated user's verification history.
 */
export function getHistory(req, res) {
  try {
    const history = claimRepository.getHistoryByUser(req.user.userId, 50);
    res.json({ history });
  } catch (error) {
    console.error('[ProfileController] GetHistory error:', error.message);
    res.status(500).json({ error: { message: 'Failed to retrieve history.' } });
  }
}

/**
 * DELETE /api/profile/history
 * Clear the authenticated user's verification history.
 */
export function clearHistory(req, res) {
  try {
    const deleted = claimRepository.clearHistory(req.user.userId);
    res.json({ message: `Cleared ${deleted} history records.`, deleted });
  } catch (error) {
    console.error('[ProfileController] ClearHistory error:', error.message);
    res.status(500).json({ error: { message: 'Failed to clear history.' } });
  }
}

/**
 * GET /api/profile/bookmarks
 * Get the authenticated user's bookmarked articles.
 */
export function getBookmarks(req, res) {
  try {
    const bookmarks = bookmarkRepository.getBookmarksByUser(req.user.userId);
    res.json({ bookmarks });
  } catch (error) {
    console.error('[ProfileController] GetBookmarks error:', error.message);
    res.status(500).json({ error: { message: 'Failed to retrieve bookmarks.' } });
  }
}

/**
 * POST /api/profile/bookmarks
 * Add a bookmark for the authenticated user.
 */
export function addBookmark(req, res) {
  try {
    const article = req.body;
    if (!article || (!article.id && !article.articleId)) {
      return res.status(400).json({ error: { message: 'Article data with an ID is required.' } });
    }

    const result = bookmarkRepository.addBookmark(req.user.userId, article);

    if (result.alreadyExists) {
      return res.json({ message: 'Article already bookmarked.', bookmarkId: result.id });
    }

    res.status(201).json({ message: 'Article bookmarked.', bookmarkId: result.id });
  } catch (error) {
    console.error('[ProfileController] AddBookmark error:', error.message);
    res.status(500).json({ error: { message: 'Failed to bookmark article.' } });
  }
}

/**
 * DELETE /api/profile/bookmarks/:id
 * Remove a bookmark by ID.
 */
export function removeBookmark(req, res) {
  try {
    const { id } = req.params;
    const success = bookmarkRepository.removeBookmark(req.user.userId, id);

    if (!success) {
      return res.status(404).json({ error: { message: 'Bookmark not found.' } });
    }

    res.json({ message: 'Bookmark removed.' });
  } catch (error) {
    console.error('[ProfileController] RemoveBookmark error:', error.message);
    res.status(500).json({ error: { message: 'Failed to remove bookmark.' } });
  }
}

/**
 * GET /api/profile/stats
 * Get summary statistics for the authenticated user.
 */
export function getStats(req, res) {
  try {
    const claimCount = claimRepository.getClaimCount(req.user.userId);
    const bookmarkCount = bookmarkRepository.getBookmarkCount(req.user.userId);
    const user = userRepository.findById(req.user.userId);

    let interests = [];
    try { interests = JSON.parse(user.interests || '[]'); } catch { /* empty */ }

    res.json({
      stats: {
        totalVerifications: claimCount,
        totalBookmarks: bookmarkCount,
        interests,
        memberSince: user.created_at
      }
    });
  } catch (error) {
    console.error('[ProfileController] GetStats error:', error.message);
    res.status(500).json({ error: { message: 'Failed to retrieve stats.' } });
  }
}
