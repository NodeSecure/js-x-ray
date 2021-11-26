/**
 * This is one of the way to get a valid require.
 *
 * @see https://nodejs.org/api/process.html#process_process_mainmodule
 */
export const processMainModuleRequire = "process.mainModule.require";

/**
 * JavaScript dangerous global identifiers that can be used by hackers
 */
export const globalIdentifiers = new Set(["global", "globalThis", "root", "GLOBAL", "window"]);

/**
 * Dangerous Global identifiers parts
 */
export const globalParts = new Set([...globalIdentifiers, "process", "mainModule", "require"]);

/**
 * Dangerous Unicode control characters that can be used by hackers
 * to perform trojan source.
 */
export const unsafeUnicodeControlCharacters = [
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

export const warnings = Object.freeze({
  parsingError: Symbol("ParsingError"),
  unsafeImport: Symbol("UnsafeImport"),
  unsafeRegex: Symbol("UnsafeRegex"),
  unsafeStmt: Symbol("UnsafeStmt"),
  unsafeAssign: Symbol("UnsafeAssign"),
  encodedLiteral: Symbol("EncodedLiteral"),
  shortIdentifiers: Symbol("ShortIdentifiers"),
  suspiciousLiteral: Symbol("SuspiciousLiteral"),
  obfuscatedCode: Symbol("ObfuscatedCode")
});
