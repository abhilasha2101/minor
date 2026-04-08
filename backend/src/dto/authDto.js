/**
 * Authentication DTO — Validates and sanitizes sign-up/sign-in request bodies.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_CATEGORIES = ['National', 'International', 'Science', 'Technology', 'Business', 'Sports', 'Health', 'Entertainment'];

/**
 * Validate sign-up payload.
 * @param {object} body - Request body
 * @returns {{ valid: boolean, errors: string[], data?: object }}
 */
export function validateSignup(body) {
  const errors = [];
  const { username, email, password, interests } = body || {};

  // Username
  if (!username || typeof username !== 'string') {
    errors.push('Username is required.');
  } else if (username.trim().length < 2 || username.trim().length > 50) {
    errors.push('Username must be 2–50 characters.');
  }

  // Email
  if (!email || typeof email !== 'string') {
    errors.push('Email is required.');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  // Password
  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  } else if (password.length > 128) {
    errors.push('Password must not exceed 128 characters.');
  }

  // Interests (optional but must be valid array)
  let cleanInterests = [];
  if (interests) {
    if (!Array.isArray(interests)) {
      errors.push('Interests must be an array of category strings.');
    } else {
      cleanInterests = interests.filter(i => typeof i === 'string' && VALID_CATEGORIES.includes(i));
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      interests: cleanInterests
    }
  };
}

/**
 * Validate login payload.
 * @param {object} body - Request body
 * @returns {{ valid: boolean, errors: string[], data?: object }}
 */
export function validateLogin(body) {
  const errors = [];
  const { email, password } = body || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      email: email.trim().toLowerCase(),
      password
    }
  };
}

/**
 * Validate update interests payload.
 * @param {object} body - Request body
 * @returns {{ valid: boolean, errors: string[], data?: object }}
 */
export function validateUpdateInterests(body) {
  const { interests } = body || {};

  if (!interests || !Array.isArray(interests)) {
    return { valid: false, errors: ['Interests must be an array of category strings.'] };
  }

  const clean = interests.filter(i => typeof i === 'string' && VALID_CATEGORIES.includes(i));

  return { valid: true, errors: [], data: { interests: clean } };
}

export { VALID_CATEGORIES };
