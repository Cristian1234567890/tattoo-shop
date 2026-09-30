/**
 * WhatsApp Utility Functions
 * Builds compliant https://wa.me/<digits> URLs for direct messaging.
 */

/**
 * Strips non-digits from a phone number string.
 */
export function cleanPhoneDigits(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  let digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('00')) {
    digits = digits.substring(2);
  }
  return digits;
}

/**
 * Formats a raw phone string into a standard WhatsApp click-to-chat URL.
 *
 * Requirements:
 * - Strips non-numeric characters (+, -, spaces, parentheses, etc.)
 * - Handles international prefix detection (defaulting to Panama '507' for 7 or 8-digit local numbers)
 * - Properly handles standard international prefix format (wa.me/<digits>)
 * - Supports optional pre-filled message text
 *
 * @param rawPhone - Phone number with or without dial prefix
 * @param defaultPrefix - Default country dial code without plus (default: '507')
 * @param message - Optional pre-filled text message to encode in the query string
 * @returns Fully formatted WhatsApp URL (e.g. "https://wa.me/50760012345") or empty string
 */
export function formatWhatsAppUrl(
  rawPhone?: string | null,
  defaultPrefix = '507',
  message?: string
): string {
  if (!rawPhone || !rawPhone.trim()) {
    return '';
  }

  const trimmed = rawPhone.trim();
  let digits = cleanPhoneDigits(trimmed);

  if (!digits) {
    return '';
  }

  const cleanPrefix = (defaultPrefix || '507').replace(/\D/g, '');

  // If phone is a national number without leading '+' or '00' and without country code, prepend cleanPrefix
  if (!trimmed.startsWith('+') && !trimmed.startsWith('00') && cleanPrefix && !digits.startsWith(cleanPrefix)) {
    digits = cleanPrefix + digits;
  }

  const baseUrl = `https://wa.me/${digits}`;

  if (message && message.trim()) {
    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
  }

  return baseUrl;
}
