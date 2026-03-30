// Import Internal Dependencies
import {
  type ObfuscatedCounters,
  type ObfuscatedIdentifier
} from "../Deobfuscator.ts";
import { notNullOrUndefined } from "../utils/index.ts";

// CONSTANTS
const kJJRegularSymbols = new Set(["$", "_"]);

export function verify(
  identifiers: ObfuscatedIdentifier[],
  counters: ObfuscatedCounters
) {
  if (
    (counters.VariableDeclarator && counters.VariableDeclarator > 0) ||
    (counters.FunctionDeclaration && counters.FunctionDeclaration > 0)
  ) {
    return false;
  }
  if (
    (counters.AssignmentExpression ?? 0) > (counters.Property ?? 0)
  ) {
    return false;
  }

  const matchCount = identifiers.filter(({ name }) => {
    if (!notNullOrUndefined(name)) {
      return false;
    }
    for (const char of name) {
      if (!kJJRegularSymbols.has(char)) {
        return false;
      }
    }

    return true;
  }).length;
  const pourcent = ((matchCount / identifiers.length) * 100);

  return pourcent > 80;
}

