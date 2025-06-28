// CONSTANTS
const kJSFuckMinimumDoubleUnaryExpr = 5;

export function verify(counters) {
  const hasZeroAssign = counters.AssignmentExpression === 0
    && counters.FunctionDeclaration === 0
    && counters.Property === 0
    && counters.VariableDeclarator === 0;

  return hasZeroAssign && counters.DoubleUnaryExpression >= kJSFuckMinimumDoubleUnaryExpr;
}
