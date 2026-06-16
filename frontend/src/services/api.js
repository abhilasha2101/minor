/**
 * API Service Layer for Veritas AI Frontend.
 * All backend communication logic — Auth, Verify, Profile, Community endpoints.
 */

// Safe evaluation of the API Base URL to prevent Vercel/Netlify relative routing regressions.
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // Guard 1: Verify that the environment variable exists and starts with a valid protocol
  if (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://'))) {
    // Strip trailing slash if present to avoid double-slash formatting errors
    return envUrl.replace(/\/$/, '');
  }
  
  // Guard 2: In development, fall back to '/api' which is proxied locally via Vite
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // Guard 3: In production, fall back to the absolute backend URL to prevent requests from misrouting to the frontend host
  return 'https://veritas-ai-backend.up.railway.app/api';
};

const API_BASE = getApiBase();

// ──────────────────────────────────────────────
// Token Management
// ──────────────────────────────────────────────

let authToken = null;

/**
 * Set the authentication token (called after login/signup).
 * @param {string|null} token
 */
export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

/**
 * Get stored auth token (from memory or localStorage).
 * @returns {string|null}
 */
export function getAuthToken() {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
}

/**
 * Build headers with optional Authorization.
 * @returns {object}
 */
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Generic fetch wrapper with error handling.
 */
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) }
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data.error?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

// ──────────────────────────────────────────────
// Auth Endpoints
// ──────────────────────────────────────────────

/**
 * Register a new user.
 * @param {{ username: string, email: string, password: string, interests: string[] }} userData
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function signupUser(userData) {
  const data = await apiRequest(`${API_BASE}/auth/signup`, {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  if (data.token) setAuthToken(data.token);
  return data;
}

/**
 * Login an existing user.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function loginUser(credentials) {
  const data = await apiRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  if (data.token) setAuthToken(data.token);
  return data;
}

/**
 * Get the current authenticated user's profile.
 * @returns {Promise<{ user: object }>}
 */
export async function getCurrentUser() {
  return apiRequest(`${API_BASE}/auth/me`);
}

/**
 * Update user interests.
 * @param {string[]} interests
 * @returns {Promise<object>}
 */
export async function updateUserInterests(interests) {
  return apiRequest(`${API_BASE}/auth/interests`, {
    method: 'PUT',
    body: JSON.stringify({ interests })
  });
}

/**
 * Logout — clear token.
 */
export function logoutUser() {
  setAuthToken(null);
}

// ──────────────────────────────────────────────
// Verify Endpoints
// ──────────────────────────────────────────────

/**
 * Verify a text-based news claim.
 * @param {string} claim - The news claim to verify
 * @param {AbortSignal} [signal] - Optional AbortSignal for cancellation
 * @returns {Promise<object>}
 */
export async function verifyNewsClaim(claim, signal) {
  const response = await fetch(`${API_BASE}/verify/text`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ news: claim }),
    signal
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Request failed with status ${response.status}`);
  }
  return data;
}

/**
 * Verify an image/screenshot claim.
 * @param {string} base64Data - Base64 encoded image
 * @param {AbortSignal} [signal] - Optional AbortSignal for cancellation
 * @returns {Promise<object>}
 */
export async function verifyImageClaim(base64Data, signal) {
  const response = await fetch(`${API_BASE}/verify/image`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ image: base64Data }),
    signal
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Request failed with status ${response.status}`);
  }
  return data;
}

/**
 * Submit feedback on a verification result.
 * @param {string} summary
 * @param {boolean} isPositive
 * @param {string} [claimId]
 * @returns {Promise<object>}
 */
export async function submitFeedback(summary, isPositive, claimId) {
  return apiRequest(`${API_BASE}/verify/feedback`, {
    method: 'POST',
    body: JSON.stringify({ summary, isPositive, claimId })
  });
}

// ──────────────────────────────────────────────
// Profile Endpoints
// ──────────────────────────────────────────────

/**
 * Get user's verification history.
 * @returns {Promise<{ history: object[] }>}
 */
export async function getUserHistory() {
  return apiRequest(`${API_BASE}/profile/history`);
}

/**
 * Clear user's verification history.
 * @returns {Promise<object>}
 */
export async function clearUserHistory() {
  return apiRequest(`${API_BASE}/profile/history`, { method: 'DELETE' });
}

/**
 * Get user's bookmarks.
 * @returns {Promise<{ bookmarks: object[] }>}
 */
export async function getUserBookmarks() {
  return apiRequest(`${API_BASE}/profile/bookmarks`);
}

/**
 * Add a bookmark.
 * @param {object} article
 * @returns {Promise<object>}
 */
export async function addBookmark(article) {
  return apiRequest(`${API_BASE}/profile/bookmarks`, {
    method: 'POST',
    body: JSON.stringify(article)
  });
}

/**
 * Remove a bookmark.
 * @param {string} bookmarkId
 * @returns {Promise<object>}
 */
export async function removeBookmark(bookmarkId) {
  return apiRequest(`${API_BASE}/profile/bookmarks/${bookmarkId}`, {
    method: 'DELETE'
  });
}

/**
 * Get user stats.
 * @returns {Promise<{ stats: object }>}
 */
export async function getUserStats() {
  return apiRequest(`${API_BASE}/profile/stats`);
}

/**
 * Update user profile details (bio, location, username).
 * @param {object} details
 * @returns {Promise<object>}
 */
export async function updateProfileDetails(details) {
  return apiRequest(`${API_BASE}/profile/details`, {
    method: 'PUT',
    body: JSON.stringify(details)
  });
}

// ──────────────────────────────────────────────
// Community Endpoints
// ──────────────────────────────────────────────

/**
 * Get all community fact-check requests.
 * @returns {Promise<{ requests: object[] }>}
 */
export async function getCommunityRequests() {
  return apiRequest(`${API_BASE}/community/requests`);
}

/**
 * Submit a new community fact-check request.
 * @param {{ claim: string, category: string }} data
 * @returns {Promise<object>}
 */
export async function addCommunityRequest(data) {
  return apiRequest(`${API_BASE}/community/requests`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Toggle upvote on a community request.
 * @param {string} requestId
 * @returns {Promise<{ upvoted: boolean, upvotes: number }>}
 */
export async function upvoteCommunityRequest(requestId) {
  return apiRequest(`${API_BASE}/community/requests/${requestId}/upvote`, {
    method: 'POST'
  });
}

// ──────────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────────

/**
 * Check backend server health.
 * @returns {Promise<object>}
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error('Backend offline');
  return response.json();
}

// ──────────────────────────────────────────────
// Response Parsing
// ──────────────────────────────────────────────

/**
 * Parse the verification response from the new backend format.
 * The new backend returns { result: {...}, raw: {...} }.
 * @param {object} data - API response
 * @returns {object} Normalized verification result
 */
export function parseVerificationResponse(data) {
  // New backend returns pre-parsed result
  if (data.result) {
    return data.result;
  }

  // Fallback: parse raw Gemini format (backward compatibility)
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('No text response from AI');

  let parsed;
  try {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object boundaries found');
    parsed = JSON.parse(rawText.slice(start, end + 1));
  } catch {
    try {
      const clean = rawText.replace(/```json|```/gi, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      throw new Error('Failed to parse fact report format.');
    }
  }

  return {
    verdict: ['TRUE', 'FALSE', 'MISLEADING', 'UNVERIFIED'].includes(parsed.verdict) ? parsed.verdict : 'UNVERIFIED',
    confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 0))),
    summary: parsed.summary || 'Summary unavailable.',
    key_findings: Array.isArray(parsed.key_findings) ? parsed.key_findings : [],
    sources_checked: Array.isArray(parsed.sources_checked) ? parsed.sources_checked : [],
    red_flags: Array.isArray(parsed.red_flags) ? parsed.red_flags : [],
    advice: parsed.advice || ''
  };
}
