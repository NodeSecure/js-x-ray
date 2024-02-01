export function verify(sourceFile) {
  if (sourceFile.counter.memberExpr > 0) {
    return false;
  }

  const hasSomePatterns = sourceFile.counter.doubleUnaryArray > 0
    || sourceFile.counter.deepBinaryExpr > 0
    || sourceFile.counter.encodedArrayValue > 0
    || sourceFile.hasDictionaryString;

  // TODO: hasPrefixedIdentifiers only work for hexadecimal id names generator
  return sourceFile.hasPrefixedIdentifiers && hasSomePatterns;
}
