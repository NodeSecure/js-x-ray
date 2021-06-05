export function verify(analysis) {
  if (analysis.counter.memberExpr > 0) {
    return false;
  }

  const hasSomePatterns = analysis.counter.doubleUnaryArray > 0
    || analysis.counter.deepBinaryExpr > 0
    || analysis.counter.encodedArrayValue > 0
    || analysis.hasDictionaryString;

  // TODO: hasPrefixedIdentifiers only work for hexadecimal id names generator
  return analysis.hasPrefixedIdentifiers && hasSomePatterns;
}
