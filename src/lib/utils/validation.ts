/**
 * Validates if the phone number follows the Indonesian 62 format.
 * Format: 62 followed by 8-13 digits.
 */
export function isValidWhatsApp(phone: string): boolean {
  return /^62[2-9]\d{7,12}$/.test(phone);
}

/**
 * Normalizes an Indonesian phone number to the 62... format.
 * - Removes non-digits
 * - 08... -> 628...
 * - 8... -> 628...
 * - 6208... -> 628...
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("08")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  } else if (cleaned.startsWith("6208")) {
    cleaned = "628" + cleaned.slice(4);
  }

  return cleaned;
}
