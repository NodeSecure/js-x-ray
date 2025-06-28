/**
 * Dangerous Unicode control characters that can be used by hackers
 * to perform trojan source.
 */
const kUnsafeUnicodeControlCharacters = [
  "\u202A",
  "\u202B",
  "\u202D",
  "\u202E",
  "\u202C",
  "\u2066",
  "\u2067",
  "\u2068",
  "\u2069",
  "\u200E",
  "\u200F",
  "\u061C"
];

export function verify(sourceString) {
  for (const unsafeCharacter of kUnsafeUnicodeControlCharacters) {
    if (sourceString.includes(unsafeCharacter)) {
      return true;
    }
  }

  return false;
}
