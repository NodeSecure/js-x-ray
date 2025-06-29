// Import Internal Dependencies
import { notNullOrUndefined } from "../utils/index.js";
import {
  type ObfuscatedIdentifier,
  type ObfuscatedCounters
} from "../Deobfuscator.js";

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
    const charsCode = [...new Set([...name])];

    return charsCode.every((char) => kJJRegularSymbols.has(char));
  }).length;
  const pourcent = ((matchCount / identifiers.length) * 100);

  return pourcent > 80;
}

