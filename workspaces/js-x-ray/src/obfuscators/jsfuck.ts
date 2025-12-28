// Import Internal Dependencies
import {
  type ObfuscatedCounters
} from "../Deobfuscator.ts";

// CONSTANTS
const kJSFuckMinimumDoubleUnaryExpr = 5;

export function verify(
  counters: ObfuscatedCounters
) {
  const hasZeroAssign = counters.AssignmentExpression === 0
    && counters.FunctionDeclaration === 0
    && counters.Property === 0
    && counters.VariableDeclarator === 0;

  return hasZeroAssign &&
    (counters.DoubleUnaryExpression ?? 0) >= kJSFuckMinimumDoubleUnaryExpr;
}
