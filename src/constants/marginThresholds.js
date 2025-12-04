/**
 * Margin threshold constants for lane status determination
 */
export const MARGIN_THRESHOLDS = {
  ERROR: 8,      // Margin below 8% = Error status
  WARNING: 12    // Margin below 12% = Warning status, >= 12% = Valid
};

/**
 * Determine lane status based on margin percentage
 * @param {number|string} margin - The margin percentage
 * @returns {string} - 'Error', 'Warning', or 'Valid'
 */
export function getLaneStatus(margin) {
  const marginValue = parseFloat(margin);
  if (marginValue < MARGIN_THRESHOLDS.ERROR) {
    return 'Error';
  }
  if (marginValue < MARGIN_THRESHOLDS.WARNING) {
    return 'Warning';
  }
  return 'Valid';
}

/**
 * Get warning messages based on margin
 * @param {number|string} margin - The margin percentage
 * @returns {string[]} - Array of warning messages
 */
export function getMarginWarnings(margin) {
  const marginValue = parseFloat(margin);
  if (marginValue < MARGIN_THRESHOLDS.ERROR) {
    return ['Margin below threshold'];
  }
  return [];
}




