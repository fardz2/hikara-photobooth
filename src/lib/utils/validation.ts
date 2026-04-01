/**
 * Validates if the phone number follows the Indonesian 62 format.
 * Format: 62 followed by at least 8 digits.
 */
export function isValidWhatsApp(phone: string): boolean {
  return /^62\d{8,}$/.test(phone);
}
