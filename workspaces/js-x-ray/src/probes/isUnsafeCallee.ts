// Import Third-party Dependencies
import type { ESTree } from "meriyah";
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.js";
import { generateWarning } from "../warnings.js";
import { ProbeSignals } from "../ProbeRunner.js";

/**
 * @description Detect unsafe statement
 * @example
 * eval("this");
 * Function("return this")();
 */
function validateNode(
  node: ESTree.Node
): [boolean, any?] {
  return isUnsafeCallee(node);
}

function main(
  node: ESTree.CallExpression,
  options: { sourceFile: SourceFile; data?: string; }
) {
  const { sourceFile, data: calleeName } = options;

  if (!calleeName) {
    return ProbeSignals.Skip;
  }
  if (
    calleeName === "Function" &&
    node.callee.arguments.length > 0 &&
    node.callee.arguments[0].value === "return this"
  ) {
    return ProbeSignals.Skip;
  }

  const warning = generateWarning("unsafe-stmt", {
    value: calleeName,
    location: node.loc
  });
  sourceFile.warnings.push(warning);

  return ProbeSignals.Skip;
}

function isEvalCallee(
  node: ESTree.CallExpression
): boolean {
  const identifier = getCallExpressionIdentifier(node, {
    resolveCallExpression: false
  });

  return identifier === "eval";
}

function isFunctionCallee(
  node: ESTree.CallExpression
): boolean {
  const identifier = getCallExpressionIdentifier(node);

  return identifier === "Function" && node.callee.type === "CallExpression";
}

export function isUnsafeCallee(
  node: ESTree.CallExpression | ESTree.Node
): [boolean, "eval" | "Function" | null] {
  if (node.type !== "CallExpression") {
    return [false, null];
  }

  if (isEvalCallee(node)) {
    return [true, "eval"];
  }

  if (isFunctionCallee(node)) {
    return [true, "Function"];
  }

  return [false, null];
}

export default {
  name: "isUnsafeCallee",
  validateNode,
  main,
  breakOnMatch: false
};
