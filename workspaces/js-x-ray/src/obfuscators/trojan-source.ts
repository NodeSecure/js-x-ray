/**
 * This code has been copy-pasted from:
 * https://github.com/lirantal/anti-trojan-source
 *
 * WHY?
 * Because of the high number of dependencies.
 */

// CONSTANTS
// Explicit list of dangerous confusable characters
const kExplicitConfusableChars = [
  // ARABIC LETTER MARK
  "\u061C",
  // LEFT-TO-RIGHT MARK
  "\u200E",
  // RIGHT-TO-LEFT MARK
  "\u200F",
  // LEFT-TO-RIGHT EMBEDDING
  "\u202A",
  // RIGHT-TO-LEFT EMBEDDING
  "\u202B",
  // POP DIRECTIONAL FORMATTING
  "\u202C",
  // LEFT-TO-RIGHT OVERRIDE
  "\u202D",
  // RIGHT-TO-LEFT OVERRIDE
  "\u202E",
  // LEFT-TO-RIGHT ISOLATE
  "\u2066",
  // RIGHT-TO-LEFT ISOLATE
  "\u2067",
  // FIRST STRONG ISOLATE
  "\u2068",
  // POP DIRECTIONAL ISOLATE
  "\u2069",
  // ZERO WIDTH SPACE
  "\u200B",
  // ZERO WIDTH NON-JOINER
  "\u200C",
  // ZERO WIDTH JOINER
  "\u200D",
  // WORD JOINER
  "\u2060",
  // INVISIBLE SEPARATOR
  "\u2063",
  // SOFT HYPHEN
  "\u00AD",
  // NO-BREAK SPACE
  "\u00A0",
  // VARIATION SELECTOR-1
  "\uFE00",
  // VARIATION SELECTOR-2
  "\uFE01",
  // VARIATION SELECTOR-3
  "\uFE02",
  // VARIATION SELECTOR-4
  "\uFE03",
  // VARIATION SELECTOR-5
  "\uFE04",
  // VARIATION SELECTOR-6
  "\uFE05",
  // VARIATION SELECTOR-7
  "\uFE06",
  // VARIATION SELECTOR-8
  "\uFE07",
  // VARIATION SELECTOR-9
  "\uFE08",
  // VARIATION SELECTOR-10
  "\uFE09",
  // VARIATION SELECTOR-11
  "\uFE0A",
  // VARIATION SELECTOR-12
  "\uFE0B",
  // VARIATION SELECTOR-13
  "\uFE0C",
  // VARIATION SELECTOR-14
  "\uFE0D",
  // VARIATION SELECTOR-15
  "\uFE0E",
  // VARIATION SELECTOR-16
  "\uFE0F",
  // ZERO WIDTH NO-BREAK SPACE (BOM)
  "\uFEFF",
  // MONGOLIAN VOWEL SEPARATOR
  "\u180E"
];
// Combine all confusable characters
const kConfusableChars = [
  ...kExplicitConfusableChars,
  ...generateExtendedVariationSelectors()
];

// Generate Extended Variation Selectors (U+E0100 to U+E01EF)
// These are Variation Selectors Supplement - 240 characters
function* generateExtendedVariationSelectors(): Iterable<string> {
  for (let codePoint = 0xe0100; codePoint <= 0xe01ef; codePoint++) {
    yield String.fromCodePoint(codePoint);
  }
}

export function verify(
  sourceTextToSearch: string
): boolean {
  for (const confusableChar of kConfusableChars) {
    if (sourceTextToSearch.includes(confusableChar)) {
      return true;
    }
  }

  return false;
}
