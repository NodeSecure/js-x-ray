/* eslint-disable no-misleading-character-class */
/**
 * This code has been copy-pasted from:
 * https://github.com/lirantal/anti-trojan-source
 *
 * WHY?
 * Because of the high number of dependencies.
 */

// CONSTANTS
// Single compiled regex covering all dangerous confusable/invisible characters:
//   - Explicit BMP confusables (bidirectional marks, zero-width chars, variation selectors, etc.)
//   - Extended Variation Selectors Supplement U+E0100..U+E01EF (240 chars)
// The /u flag is required for the supplementary-plane range \u{E0100}-\u{E01EF}.
const kConfusableRegex =
  /[\u00A0\u00AD\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060\u2063\u2066-\u2069\uFE00-\uFE0F\uFEFF\u{E0100}-\u{E01EF}]/u;

export function verify(
  sourceTextToSearch: string
): boolean {
  return kConfusableRegex.test(sourceTextToSearch);
}
