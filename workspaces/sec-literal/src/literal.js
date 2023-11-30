// Import Third-party Dependencies
import isStringBase64 from "is-base64";

/**
 * @param {SecLiteral.Literal | string} anyValue
 * @returns {string}
 */
export function isLiteral(anyValue) {
  return typeof anyValue === "object" && "type" in anyValue && anyValue.type === "Literal";
}

/**
 * @param {SecLiteral.Literal | string} strOrLiteral
 * @returns {string}
 */
export function toValue(strOrLiteral) {
  return isLiteral(strOrLiteral) ? strOrLiteral.value : strOrLiteral;
}

/**
 * @param {SecLiteral.Literal | string} strOrLiteral
 * @returns {string}
 */
export function toRaw(strOrLiteral) {
  return isLiteral(strOrLiteral) ? strOrLiteral.raw : strOrLiteral;
}

/**
 * @param {!SecLiteral.Literal} literalValue
 * @returns {SecLiteral.LiteralDefaultAnalysis}
 */
export function defaultAnalysis(literalValue) {
  if (!isLiteral(literalValue)) {
    return null;
  }

  const hasRawValue = "raw" in literalValue;
  const hasHexadecimalSequence = hasRawValue ? /\\x[a-fA-F0-9]{2}/g.exec(literalValue.raw) !== null : null;
  const hasUnicodeSequence = hasRawValue ? /\\u[a-fA-F0-9]{4}/g.exec(literalValue.raw) !== null : null;
  const isBase64 = isStringBase64(literalValue.value, { allowEmpty: false });

  return { hasHexadecimalSequence, hasUnicodeSequence, isBase64 };
}
