/**
 * Builds a simply query string from object.
 *
 * @param {object} obj
 * @return {string}
 */
export function buildQuery(obj) {
  return Object.keys(obj).filter((k) => obj[k]).map((k) => {
    const value = obj[k];
    const v = typeof value === 'object' ? JSON.stringify(value) : value;
    return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
  }).join('&');
}

/**
 * Will invoke the provided function when the DOM is ready.
 * If already ready, the callback will be invoked immediately.
 *
 * @param {Function} callback The ready callback.
 */
export function domReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function fn() {
      document.removeEventListener('DOMContentLoaded', fn);
      callback();
    });
  } else {
    callback();
  }
}

/**
 * Extracts an event fields object from a node.
 *
 * @param {DOMNode} node
 * @param {string} attrName
 * @return {object}
 */
export function extractFieldsFrom(node) {
  if (node.nodeType !== 1) return {};
  const data = node.getAttribute('data-fortnight-fields');
  if (!data) return {};
  try {
    return JSON.parse(decodeURIComponent(data)) || {};
  } catch (e) {
    return {};
  }
}

/**
 * Determines if a node is trackable for the provided action.
 *
 * @param {DOMNode} node
 * @param {string} action
 * @return {boolean}
 */
export function isTrackable(node, action) {
  if (node.nodeType !== 1) return false;
  const value = node.getAttribute('data-fortnight-action');
  return action === value;
}
