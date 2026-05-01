/**
 * Verify Routes — /api/verify/*
 */

import { Router } from 'express';
import * as verifyController from '../controllers/verifyController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Rate limiter for verification endpoints (15 requests/minute)
const verifyLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 15 });

// Verification routes (optional auth — logs to DB if authenticated)
router.post('/text', verifyLimiter, optionalAuth, verifyController.verifyText);
router.post('/image', verifyLimiter, optionalAuth, verifyController.verifyImage);

// Feedback route (optional auth)
router.post('/feedback', optionalAuth, verifyController.submitFeedback);

export default router;
