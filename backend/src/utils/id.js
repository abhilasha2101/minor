/**
 * Lightweight UUID v4 generator.
 * Avoids pulling in the full uuid package for simple ID generation.
 */

/**
 * Generate a compact random ID (similar to UUID v4, 12-char hex).
 * @returns {string}
 */
export function v4Lite() {
  const bytes = new Uint8Array(6);
  globalThis.crypto?.getRandomValues?.(bytes) || fillFallback(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a timestamped ID combining timestamp + random hex.
 * @param {string} prefix - Optional prefix (e.g. 'req', 'hist', 'bm')
 * @returns {string}
 */
export function timestampId(prefix = '') {
  const ts = Date.now().toString(36);
  const rand = v4Lite().slice(0, 6);
  return prefix ? `${prefix}-${ts}-${rand}` : `${ts}-${rand}`;
}

function fillFallback(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = Math.floor(Math.random() * 256);
  }
}
