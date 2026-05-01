/**
 * Verify Controller — Handles news claim verification (text + image).
 * Proxies requests to the Gemini service and logs results to the database.
 */

import { validateTextClaim, validateImageClaim, validateFeedback } from '../dto/verifyDto.js';
import * as geminiService from '../services/geminiService.js';
import * as claimRepository from '../repositories/claimRepository.js';
import { getDatabase } from '../config/database.js';

/**
 * POST /api/verify/text
 * Verify a text-based news claim.
 */
export async function verifyText(req, res) {
  try {
    const validation = validateTextClaim(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: { message: validation.errors.join(' ') } });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: { message: 'Server API configuration missing. GEMINI_API_KEY is not configured.' }
      });
    }

    // Call Gemini API
    const rawResponse = await geminiService.verifyTextClaim(validation.data.claim, apiKey);

    // Parse the response
    const parsed = geminiService.parseGeminiResponse(rawResponse);

    // Log to database if user is authenticated
    if (req.user?.userId) {
      try {
        claimRepository.saveClaim(req.user.userId, {
          claim: validation.data.claim,
          type: 'text',
          ...parsed
        });
      } catch (logErr) {
        console.warn('[VerifyController] Failed to log claim to DB:', logErr.message);
      }
    }

    res.json({
      result: parsed,
      raw: rawResponse // Include raw for any frontend needs
    });
  } catch (error) {
    console.error('[VerifyController] Text verification error:', error.message);
    res.status(500).json({
      error: { message: error.message || 'Verification failed. Please try again.' }
    });
  }
}

/**
 * POST /api/verify/image
 * Verify an image/screenshot via OCR + Gemini analysis.
 */
export async function verifyImage(req, res) {
  try {
    const validation = validateImageClaim(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: { message: validation.errors.join(' ') } });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: { message: 'Server API configuration missing. GEMINI_API_KEY is not configured.' }
      });
    }

    // Call Gemini API with image
    const rawResponse = await geminiService.verifyImageClaim(validation.data.image, apiKey);

    // Parse the response
    const parsed = geminiService.parseGeminiResponse(rawResponse);

    // Log to database if user is authenticated
    if (req.user?.userId) {
      try {
        claimRepository.saveClaim(req.user.userId, {
          claim: '[Image Verification]',
          type: 'image',
          ...parsed
        });
      } catch (logErr) {
        console.warn('[VerifyController] Failed to log image claim to DB:', logErr.message);
      }
    }

    res.json({
      result: parsed,
      raw: rawResponse
    });
  } catch (error) {
    console.error('[VerifyController] Image verification error:', error.message);
    res.status(500).json({
      error: { message: error.message || 'Image verification failed. Please try again.' }
    });
  }
}

/**
 * POST /api/verify/feedback
 * Submit user feedback on a verification result.
 */
export function submitFeedback(req, res) {
  try {
    const validation = validateFeedback(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: { message: validation.errors.join(' ') } });
    }

    const { summary, isPositive, claimId } = validation.data;

    // Store feedback in database
    const db = getDatabase();
    db.prepare(`
      INSERT INTO feedback (user_id, claim_id, summary, is_positive)
      VALUES (?, ?, ?, ?)
    `).run(
      req.user?.userId || null,
      claimId,
      summary,
      isPositive ? 1 : 0
    );

    console.log(JSON.stringify({
      level: 'info',
      message: 'User verdict feedback received',
      timestamp: new Date().toISOString(),
      isPositive,
      userId: req.user?.userId || 'anonymous'
    }));

    res.json({ success: true, message: 'Feedback logged.' });
  } catch (error) {
    console.error('[VerifyController] Feedback error:', error.message);
    res.status(500).json({ error: { message: 'Failed to submit feedback.' } });
  }
}
