/**
 * Community DTO — Validates and sanitizes community fact-check request bodies.
 */

const VALID_CATEGORIES = ['National', 'International', 'Science', 'Technology', 'Business', 'Sports', 'Health', 'Entertainment', 'General'];

/**
 * Validate new community fact-check request.
 * @param {object} body - Request body
 * @returns {{ valid: boolean, errors: string[], data?: object }}
 */
export function validateCommunityRequest(body) {
  const errors = [];
  const { claim, category } = body || {};

  if (!claim || typeof claim !== 'string') {
    errors.push('A claim text is required.');
  } else if (claim.trim().length < 10) {
    errors.push('Claim must be at least 10 characters.');
  } else if (claim.trim().length > 1000) {
    errors.push('Claim must not exceed 1000 characters.');
  }

  let cleanCategory = 'General';
  if (category && typeof category === 'string') {
    cleanCategory = VALID_CATEGORIES.includes(category) ? category : 'General';
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      claim: claim.trim(),
      category: cleanCategory
    }
  };
}

/**
 * Validate upvote toggle request.
 * @param {object} params - Route params
 * @returns {{ valid: boolean, errors: string[], data?: object }}
 */
export function validateUpvote(params) {
  const { requestId } = params || {};

  if (!requestId || typeof requestId !== 'string') {
    return { valid: false, errors: ['Request ID is required.'] };
  }

  return { valid: true, errors: [], data: { requestId } };
}
