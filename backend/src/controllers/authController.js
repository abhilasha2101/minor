/**
 * Auth Controller — Handles user registration, login, and session validation.
 */

import { validateSignup, validateLogin, validateUpdateInterests } from '../dto/authDto.js';
import * as userRepository from '../repositories/userRepository.js';
import * as authService from '../services/authService.js';

/**
 * POST /api/auth/signup
 * Register a new user account.
 */
export async function signup(req, res) {
  try {
    const validation = validateSignup(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: { message: validation.errors.join(' ') } });
    }

    const { username, email, password, interests } = validation.data;

    // Check if email already exists
    const existing = userRepository.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: { message: 'An account with this email already exists.' }
      });
    }

    // Hash password
    const hashedPassword = await authService.hashPassword(password);

    // Create user
    const user = userRepository.createUser({
      username,
      email,
      password: hashedPassword,
      interests
    });

    // Generate session token
    const token = authService.generateToken(user);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        interests: user.interests,
        avatarColor: user.avatarColor,
        avatarUrl: user.avatar_url || '',
        bio: user.bio || '',
        location: user.location || '',
        reputationScore: user.reputation_score || 0,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('[AuthController] Signup error:', error.message);
    res.status(500).json({ error: { message: 'Registration failed. Please try again.' } });
  }
}

/**
 * POST /api/auth/login
 * Authenticate an existing user.
 */
export async function login(req, res) {
  try {
    const validation = validateLogin(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: { message: validation.errors.join(' ') } });
    }

    const { email, password } = validation.data;

    // Find user
    const user = userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: { message: 'Invalid email or password.' }
      });
    }

    // Compare password
    const isMatch = await authService.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: { message: 'Invalid email or password.' }
      });
    }

    // Generate token
    const token = authService.generateToken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    // Parse interests
    let interests = [];
    try { interests = JSON.parse(user.interests || '[]'); } catch { /* empty */ }

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        interests,
        avatarColor: user.avatar_color,
        avatarUrl: user.avatar_url || '',
        bio: user.bio || '',
        location: user.location || '',
        reputationScore: user.reputation_score || 0,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('[AuthController] Login error:', error.message);
    res.status(500).json({ error: { message: 'Login failed. Please try again.' } });
  }
}

/**
 * GET /api/auth/me
 * Get the current authenticated user's profile (requires auth).
 */
export function getMe(req, res) {
  try {
    const user = userRepository.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found.' } });
    }

    let interests = [];
    try { interests = JSON.parse(user.interests || '[]'); } catch { /* empty */ }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        interests,
        avatarColor: user.avatar_color,
        avatarUrl: user.avatar_url || '',
        bio: user.bio || '',
        location: user.location || '',
        reputationScore: user.reputation_score || 0,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('[AuthController] GetMe error:', error.message);
    res.status(500).json({ error: { message: 'Failed to retrieve profile.' } });
  }
}

/**
 * PUT /api/auth/interests
 * Update user's news interest categories (requires auth).
 */
export function updateInterests(req, res) {
  try {
    const validation = validateUpdateInterests(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: { message: validation.errors.join(' ') } });
    }

    const success = userRepository.updateInterests(req.user.userId, validation.data.interests);
    if (!success) {
      return res.status(404).json({ error: { message: 'User not found.' } });
    }

    res.json({ message: 'Interests updated.', interests: validation.data.interests });
  } catch (error) {
    console.error('[AuthController] UpdateInterests error:', error.message);
    res.status(500).json({ error: { message: 'Failed to update interests.' } });
  }
}
