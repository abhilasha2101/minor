/**
 * Profile Routes — /api/profile/*
 * All routes require authentication.
 */

import { Router } from 'express';
import * as profileController from '../controllers/profileController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All profile routes require authentication
router.use(requireAuth);

// History
router.get('/history', profileController.getHistory);
router.delete('/history', profileController.clearHistory);

// Bookmarks
router.get('/bookmarks', profileController.getBookmarks);
router.post('/bookmarks', profileController.addBookmark);
router.delete('/bookmarks/:id', profileController.removeBookmark);

// Stats
router.get('/stats', profileController.getStats);

// Profile Details
router.put('/details', profileController.updateDetails);

export default router;
