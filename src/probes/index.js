// Import all the probes
import isUnsafeCallee from "./isUnsafeCallee.js";
import isLiteral from "./isLiteral.js";
import isLiteralRegex from "./isLiteralRegex.js";
import isRegexObject from "./isRegexObject.js";
import isVariableDeclaration from "./isVariableDeclaration.js";
import isRequire from "./isRequire.js";
import isImportDeclaration from "./isImportDeclaration.js";
import isMemberExpression from "./isMemberExpression.js";
import isArrayExpression from "./isArrayExpression.js";
import isFunction from "./isFunction.js";
import isAssignmentExpression from "./isAssignmentExpression.js";
import isObjectExpression from "./isObjectExpression.js";
import isUnaryExpression from "./isUnaryExpression.js";
import isWeakCrypto from "./isWeakCrypto.js";
import isClassDeclaration from "./isClassDeclaration.js";
import isMethodDefinition from "./isMethodDefinition.js";

// CONSTANTS
const kListOfProbes = [
  isUnsafeCallee,
  isLiteral,
  isLiteralRegex,
  isRegexObject,
  isVariableDeclaration,
  isRequire,
  isImportDeclaration,
  isMemberExpression,
  isAssignmentExpression,
  isObjectExpression,
  isArrayExpression,
  isFunction,
  isUnaryExpression,
  isWeakCrypto,
  isClassDeclaration,
  isMethodDefinition
];

const kSymBreak = Symbol.for("breakWalk");
const kSymSkip = Symbol.for("skipWalk");

export function runOnProbes(node, sourceFile) {
  const breakedGroups = new Set();

  for (const probe of kListOfProbes) {
    if (breakedGroups.has(probe.breakGroup)) {
      continue;
    }

    const validationFns = Array.isArray(probe.validateNode) ?
      probe.validateNode : [probe.validateNode];
    for (const validateNode of validationFns) {
      const [isMatching, data = null] = validateNode(node, sourceFile);
      if (!isMatching) {
        continue;
      }

      const result = probe.main(node, { analysis: sourceFile, data });

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
