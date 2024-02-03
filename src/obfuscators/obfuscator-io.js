export function verify(deobfuscator, counters) {
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
