// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.ts";
import { defineProbe } from "../defineProbe.ts";
import { generateWarning } from "../warnings.ts";
import { matchTracedCall, traceAll } from "./tracing.ts";

// CONSTANTS
const kTracedFunctions = new Set(["Math.random"]);

function validateNode(
  _node: ESTree.CallExpression,
  ctx: ProbeContext
): [boolean, any?] {
  return matchTracedCall(ctx, kTracedFunctions);
}

function initialize(
  ctx: ProbeContext
) {
  traceAll(ctx.sourceFile.tracer, kTracedFunctions);
}

function main(
  node: ESTree.MemberExpression,
  ctx: ProbeContext
) {
  const { sourceFile } = ctx;

  sourceFile.warnings.push(generateWarning("insecure-random", {
    value: null,
    location: node.loc
  }));
}

export default defineProbe({
  name: "isRandom",
  nodeTypes: ["CallExpression"],
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
});
