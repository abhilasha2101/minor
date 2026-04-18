/**
 * Auth Routes — /api/auth/*
 */

import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.get('/me', requireAuth, authController.getMe);
router.put('/interests', requireAuth, authController.updateInterests);

export default router;
