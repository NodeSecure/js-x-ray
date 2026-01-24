// Import Third-party Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../ProbeRunner.ts";
import { generateWarning } from "../warnings.ts";
import { toArrayLocation, type SourceArrayLocation } from "../utils/toArrayLocation.ts";

// CONSTANTS
const kLogUsageMethods = new Set(["console.log", "console.info", "console.warn", "console.error", "console.debug"]);

type LogUsageContextDef = Record<string, SourceArrayLocation[]>;

function validateNode(
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const { tracer } = ctx.sourceFile;
  const id = getCallExpressionIdentifier(node);

  if (id === null) {
    return [false];
  }

  const data = tracer.getDataFromIdentifier(id);

  return [data !== null &&
    Boolean(data.identifierOrMemberExpr) &&
    kLogUsageMethods.has(data.identifierOrMemberExpr),
  data?.identifierOrMemberExpr];
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
