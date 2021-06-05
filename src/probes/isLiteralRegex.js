// Require Internal Dependencies
import { isLiteralRegex } from "../utils.js";
import { warnings } from "../constants.js";

// Require Third-party Dependencies
import safeRegex from "safe-regex";

// Search for Literal Regex.
// then we use the safe-regex package to detect whether or not regex is safe!
function validateNode(node) {
  return [
    isLiteralRegex(node)
  ];
}

function main(node, options) {
  const { analysis } = options;

  if (!safeRegex(node.regex.pattern)) {
    analysis.addWarning(warnings.unsafeRegex, node.regex.pattern, node.loc);
  }
}

export default {
  name: "isLiteralRegex",
  validateNode, main, breakOnMatch: false
};
