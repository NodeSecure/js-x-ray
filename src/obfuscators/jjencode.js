// Require Internal Dependencies
import { notNullOrUndefined } from "../utils/index.js";

// CONSTANTS
const kJJRegularSymbols = new Set(["$", "_"]);

export function verify(sourceFile) {
  if (sourceFile.counter.variableDeclarator > 0 || sourceFile.counter.functionDeclaration > 0) {
    return false;
  }
  if (sourceFile.idtypes.assignExpr > sourceFile.idtypes.property) {
    return false;
  }

  const matchCount = sourceFile.identifiersName.filter(({ name }) => {
    if (!notNullOrUndefined(name)) {
      return false;
    }
    const charsCode = [...new Set([...name])];

    return charsCode.every((char) => kJJRegularSymbols.has(char));
  }).length;
  const pourcent = ((matchCount / sourceFile.identifiersName.length) * 100);

  return pourcent > 80;
}

