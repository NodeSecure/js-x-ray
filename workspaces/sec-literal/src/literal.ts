// Import Internal Dependencies
import { isStringBase64 } from "./utils.ts";

export type ESTreeLiteral = {
  type: "Literal";
  value: string;
  raw?: string;
};

export function isLiteral(
  anyValue: any
): anyValue is ESTreeLiteral {
  return typeof anyValue === "object" && "type" in anyValue && anyValue.type === "Literal";
}

export function toValue(
  strOrLiteral: string | ESTreeLiteral
): string {
  return isLiteral(strOrLiteral) ? strOrLiteral.value : strOrLiteral;
}

export function toRaw(
  strOrLiteral: string | ESTreeLiteral
): string | undefined {
  return isLiteral(strOrLiteral) ? strOrLiteral.raw : strOrLiteral;
}

export function defaultAnalysis(
  literalValue: ESTreeLiteral
): null | {
  hasHexadecimalSequence: boolean | null;
  hasUnicodeSequence: boolean | null;
  isBase64: boolean;
} {
  if (!isLiteral(literalValue)) {
    return null;
  }

  const hasRawValue = "raw" in literalValue;
  const hasHexadecimalSequence = hasRawValue ?
    /\\x[a-fA-F0-9]{2}/g.exec(literalValue.raw!) !== null :
    null;
  const hasUnicodeSequence = hasRawValue ?
    /\\u[a-fA-F0-9]{4}/g.exec(literalValue.raw!) !== null :
    null;
  const isBase64 = isStringBase64(
    literalValue.value,
    { allowEmpty: false }
  );

  return {
    hasHexadecimalSequence,
    hasUnicodeSequence,
    isBase64
  };
}
