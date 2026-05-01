/**
 * Community Controller — Handles the crowd-sourced fact-check request board.
 */

import { validateCommunityRequest, validateUpvote } from '../dto/communityDto.js';
import * as communityRepository from '../repositories/communityRepository.js';

/**
 * GET /api/community/requests
 * Get all community fact-check requests with upvote info.
 */
export function getRequests(req, res) {
  try {
    const userId = req.user?.userId || null;
    const requests = communityRepository.getAllRequests(userId);
    res.json({ requests });
  } catch (error) {
    console.error('[CommunityController] GetRequests error:', error.message);
    res.status(500).json({ error: { message: 'Failed to load community requests.' } });
  }
}

/**
 * POST /api/community/requests
 * Submit a new community fact-check request (requires auth).
 */
export function createRequest(req, res) {
  try {
    const validation = validateCommunityRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: { message: validation.errors.join(' ') } });
    }

    const request = communityRepository.createRequest(
      validation.data,
      req.user.userId,
      req.user.username
    );

    res.status(201).json({ message: 'Request submitted.', request });
  } catch (error) {
    console.error('[CommunityController] CreateRequest error:', error.message);
    res.status(500).json({ error: { message: 'Failed to submit request.' } });
  }
}

/**
 * POST /api/community/requests/:requestId/upvote
 * Toggle upvote on a community request (requires auth).
 */
export function toggleUpvote(req, res) {
  try {
    const validation = validateUpvote(req.params);
    if (!validation.valid) {
      return res.status(400).json({ error: { message: validation.errors.join(' ') } });
    }

    const result = communityRepository.toggleUpvote(
      validation.data.requestId,
      req.user.userId
    );

    res.json({
      message: result.upvoted ? 'Upvoted.' : 'Upvote removed.',
      upvoted: result.upvoted,
      upvotes: result.newCount
    });
  } catch (error) {
    if (error.message === 'Community request not found.') {
      return res.status(404).json({ error: { message: error.message } });
    }
    console.error('[CommunityController] ToggleUpvote error:', error.message);
    res.status(500).json({ error: { message: 'Failed to toggle upvote.' } });
  }
}
