// Import Internal Dependencies
import { notNullOrUndefined } from "../utils/index.js";

// CONSTANTS
const kJJRegularSymbols = new Set(["$", "_"]);

export function verify(identifiers, counters) {
  if (counters.VariableDeclarator > 0 || counters.FunctionDeclaration > 0) {
    return false;
  }
  if (counters.AssignmentExpression > counters.Property) {
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

