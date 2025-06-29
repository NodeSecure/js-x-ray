// Import Internal Dependencies
import { Deobfuscator } from "../Deobfuscator.js";

export function verify(
  deobfuscator: Deobfuscator,
  counters: Record<string, number>
) {
  // @ts-ignore
  if ((counters.MemberExpression?.false ?? 0) > 0) {
    return false;
  }

  const hasSomePatterns = counters.DoubleUnaryExpression > 0
    || deobfuscator.deepBinaryExpression > 0
    || deobfuscator.encodedArrayValue > 0
    || deobfuscator.hasDictionaryString;

  // TODO: hasPrefixedIdentifiers only work for hexadecimal id names generator
  return deobfuscator.hasPrefixedIdentifiers && hasSomePatterns;
}
