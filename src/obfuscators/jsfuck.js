// CONSTANTS
const kJSFuckMinimumDoubleUnaryExpr = 5;

export function verify(sourceFile) {
  const hasZeroAssign = sourceFile.idtypes.assignExpr === 0
    && sourceFile.idtypes.functionDeclaration === 0
    && sourceFile.idtypes.property === 0
    && sourceFile.idtypes.variableDeclarator === 0;

  return hasZeroAssign && sourceFile.counter.doubleUnaryArray >= kJSFuckMinimumDoubleUnaryExpr;
}
