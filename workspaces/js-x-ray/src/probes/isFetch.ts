// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.ts";
import { matchTracedCall, traceAll } from "./tracing.ts";

// CONSTANTS
const kTracedFunctions = new Set(["fetch"]);

function validateNode(
  _node: ESTree.Node,
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
  _node: ESTree.Node,
  { sourceFile }: ProbeContext
) {
  sourceFile.flags.add("fetch");
}

export default {
  name: "isFetch",
  nodeTypes: ["CallExpression"],
  validateNode,
  initialize,
  main,
  breakOnMatch: false,
  context: {}
};
