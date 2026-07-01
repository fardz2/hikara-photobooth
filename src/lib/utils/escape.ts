/**
 * Escapes JSON string output for safe embedding in HTML <script> tags.
 * Prevents XSS from data containing </script> sequences.
 * Only escapes the sequences that break out of script context.
 */
export function escapeJsonForHtml(json: string): string {
  return json.replace(/<\//g, "<\\/");
}
