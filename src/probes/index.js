// Import all the probes
import isUnsafeCallee from "./isUnsafeCallee.js";
import isLiteral from "./isLiteral.js";
import isLiteralRegex from "./isLiteralRegex.js";
import isRegexObject from "./isRegexObject.js";
import isVariableDeclaration from "./isVariableDeclaration.js";
import isAssignmentExprOrMemberExpr from "./isAssignmentExprOrMemberExpr.js";
import isRequire from "./isRequire.js";
import isImportDeclaration from "./isImportDeclaration.js";
import isMemberExpression from "./isMemberExpression.js";
import isArrayExpression from "./isArrayExpression.js";
import isFunctionDeclaration from "./isFunctionDeclaration.js";
import isAssignmentExpression from "./isAssignmentExpression.js";
import isObjectExpression from "./isObjectExpression.js";
import isUnaryExpression from "./isUnaryExpression.js";

// CONSTANTS
const kListOfProbes = [
  isUnsafeCallee,
  isLiteral,
  isLiteralRegex,
  isRegexObject,
  isVariableDeclaration,
  isAssignmentExprOrMemberExpr,
  isRequire,
  isImportDeclaration,
  isMemberExpression,
  isAssignmentExpression,
  isObjectExpression,
  isArrayExpression,
  isFunctionDeclaration,
  isUnaryExpression
];

const kSymBreak = Symbol.for("breakWalk");
export const kSymSkip = Symbol.for("skipWalk");

export function runOnProbes(node, analysis) {
  const breakedGroups = new Set();

  for (const probe of kListOfProbes) {
    if (breakedGroups.has(probe.breakGroup)) {
      continue;
    }

    const [isMatching, data = null] = probe.validateNode(node, analysis);
    if (isMatching) {
      const result = probe.main(node, { analysis, data });

      if (result === kSymSkip) {
        return "skip";
      }
      if (result === kSymBreak || probe.breakOnMatch) {
        const breakGroup = probe.breakGroup || null;
        if (breakGroup === null) {
          break;
        }
        else {
          breakedGroups.add(breakGroup);
        }
      }
    }
  }

  return null;
}
