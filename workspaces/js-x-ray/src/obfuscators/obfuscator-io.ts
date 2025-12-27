// Import Internal Dependencies
import {
  Deobfuscator,
  type ObfuscatedCounters
} from "../Deobfuscator.ts";

export function verify(
  deobfuscator: Deobfuscator,
  counters: ObfuscatedCounters
) {
  if (
    (counters.MemberExpression?.false ?? 0) > 0 ||
    !counters.DoubleUnaryExpression
  ) {
    return false;
  }

  const hasSomePatterns = counters.DoubleUnaryExpression > 0
    || deobfuscator.deepBinaryExpression > 0
    || deobfuscator.encodedArrayValue > 0
    || deobfuscator.hasDictionaryString;

  // TODO: hasPrefixedIdentifiers only work for hexadecimal id names generator
  return deobfuscator.hasPrefixedIdentifiers && hasSomePatterns;
}
