/**
 * Community Routes — /api/community/*
 */

import { Router } from 'express';
import * as communityController from '../controllers/communityController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public (with optional auth to show user's upvote state)
router.get('/requests', optionalAuth, communityController.getRequests);

// Protected — must be logged in to submit or upvote
router.post('/requests', requireAuth, communityController.createRequest);
router.post('/requests/:requestId/upvote', requireAuth, communityController.toggleUpvote);

export default router;
