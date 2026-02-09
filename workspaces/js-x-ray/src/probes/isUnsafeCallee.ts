// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../ProbeRunner.ts";
import { getCallExpressionIdentifier } from "../estree/index.ts";
import { CALL_EXPRESSION_IDENTIFIER } from "../contants.ts";
import { generateWarning } from "../warnings.ts";

/**
 * @description Detect unsafe statement
 * @example
 * eval("this");
 * Function("return this")();
 */
function validateNode(
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  return isUnsafeCallee(node, ctx);
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeMainContext
) {
  const { sourceFile, data: calleeName, signals } = ctx;

  if (!calleeName) {
    return signals.Skip;
  }
  if (
    calleeName === "Function" &&
    node.callee.arguments.length > 0 &&
    node.callee.arguments[0].value === "return this"
  ) {
    return signals.Skip;
  }

  const warning = generateWarning("unsafe-stmt", {
    value: calleeName,
    location: node.loc
  });
  sourceFile.warnings.push(warning);

  return signals.Skip;
}

function isFunctionCallee(
  node: ESTree.CallExpression,
  identifier: null | string | undefined
): boolean {
  return identifier === "Function" && node.callee.type === "CallExpression";
}

function isEvalCallee(
  node: ESTree.CallExpression
): boolean {
  const identifier = getCallExpressionIdentifier(node, {
    resolveCallExpression: true
  });

  return identifier === "eval";
}

export function isUnsafeCallee(
  node: ESTree.CallExpression | ESTree.Node,
  ctx: ProbeContext
): [boolean, "eval" | "Function" | null] {
  if (node.type !== "CallExpression") {
    return [false, null];
  }

  if (isEvalCallee(node)) {
    return [true, "eval"];
  }

  if (isFunctionCallee(node, ctx.context?.[CALL_EXPRESSION_IDENTIFIER])) {
    return [true, "Function"];
  }

  return [false, null];
}

export default {
  name: "isUnsafeCallee",
  validateNode,
  main,
  breakOnMatch: false,
  context: {}
};
