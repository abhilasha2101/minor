/**
 * Verification DTO — Validates and sanitizes claim verification request bodies.
 */

/**
 * Validate text-claim verification input.
 * @param {object} body - Request body
 * @returns {{ valid: boolean, errors: string[], data?: object }}
 */
export function validateTextClaim(body) {
  const errors = [];
  const { news } = body || {};

  if (!news || typeof news !== 'string') {
    errors.push('News claim is required and must be a string.');
    return { valid: false, errors };
  }

  const cleaned = news.trim().replace(/\s+/g, ' ');

  if (cleaned.length < 10) {
    errors.push('News claim is too short to verify. Please enter a complete headline (minimum 10 characters).');
  }
  if (cleaned.length > 2000) {
    errors.push('News claim exceeds 2000 characters.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], data: { claim: cleaned } };
}

/**
 * Validate image-claim verification input.
 * @param {object} body - Request body
 * @returns {{ valid: boolean, errors: string[], data?: object }}
 */
export function validateImageClaim(body) {
  const errors = [];
  const { image } = body || {};

  if (!image || typeof image !== 'string') {
    errors.push('Base64 image data payload is required.');
    return { valid: false, errors };
  }

  // Basic sanity check: must be base64-ish and not exceed ~10MB raw
  if (image.length > 15_000_000) {
    errors.push('Image payload exceeds maximum size (10MB).');
    return { valid: false, errors };
  }

  return { valid: true, errors: [], data: { image } };
}

/**
 * Validate feedback submission.
 * @param {object} body - Request body
 * @returns {{ valid: boolean, errors: string[], data?: object }}
 */
export function validateFeedback(body) {
  const { summary, isPositive, claimId } = body || {};

  if (typeof isPositive !== 'boolean') {
    return { valid: false, errors: ['isPositive must be a boolean.'] };
  }

  return {
    valid: true,
    errors: [],
    data: {
      summary: typeof summary === 'string' ? summary.slice(0, 500) : '',
      isPositive,
      claimId: typeof claimId === 'string' ? claimId : null
    }
  };
}
