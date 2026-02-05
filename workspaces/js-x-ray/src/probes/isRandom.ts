// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.ts";
import { generateWarning } from "../warnings.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  return [
    ctx.context![CALL_EXPRESSION_DATA]?.name === "Math.random"
  ];
}

function initialize(
  ctx: ProbeContext
) {
  const { tracer } = ctx.sourceFile;

  tracer.trace("Math.random", {
    followConsecutiveAssignment: true
  });
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

export default {
  name: "isRandom",
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};
