// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import { generateWarning } from "../warnings.ts";
import { toArrayLocation, type SourceArrayLocation } from "../utils/toArrayLocation.ts";

// CONSTANTS
const kLogUsageMethods = new Set(["console.log", "console.info", "console.warn", "console.error", "console.debug"]);

type LogUsageContextDef = Record<string, SourceArrayLocation[]>;

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const identifierOrMemberExpr = ctx.context?.[CALL_EXPRESSION_DATA]?.identifierOrMemberExpr;

  return [
    kLogUsageMethods.has(identifierOrMemberExpr),
    identifierOrMemberExpr];
}

function initialize(
  ctx: ProbeContext
) {
  const { sourceFile } = ctx;

  for (const logUsageMethod of kLogUsageMethods) {
    sourceFile.tracer.trace(logUsageMethod, {
      followConsecutiveAssignment: true
    });
  }
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeMainContext<LogUsageContextDef>
) {
  const logIdentifer = ctx.data;
  const arrayLocation = ctx.context?.[logIdentifer];
  if (arrayLocation) {
    arrayLocation.push(toArrayLocation(node.loc ?? undefined));
  }
  else {
    ctx.context![logIdentifer] = [toArrayLocation(node.loc ?? undefined)];
  }
}

function finalize(ctx: ProbeContext<LogUsageContextDef>) {
  const { sourceFile, context } = ctx;
  if (context && Object.keys(context).length > 0) {
    const warning = generateWarning("log-usage",
      { value: Object.keys(context).join(", ") });
    sourceFile.warnings.push({ ...warning, location: Object.values(context).flat() });
  }
}

export default {
  name: "log-usage",
  validateNode,
  initialize,
  main,
  finalize,
  breakOnMatch: false,
  context: {}
};
