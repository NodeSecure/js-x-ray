// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeMainContext, ProbeContext } from "../ProbeRunner.ts";
import { generateWarning } from "../warnings.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";

function validateNode(
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  if (node.type !== "CallExpression") {
    return [false];
  }

  const { tracer } = ctx.sourceFile;

  if (!tracer.importedModules.has("vm")) {
    return [false];
  }

  return [ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr === "vm.runInNewContext"];
}

function initialize(ctx: ProbeContext) {
  const { tracer } = ctx.sourceFile;

  tracer.trace("vm.runInNewContext", {
    followConsecutiveAssignment: true,
    moduleName: "vm"
  });
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeMainContext
) {
  ctx.sourceFile.warnings.push(
    generateWarning("unsafe-vm-context", {
      value: "vm.runInNewContext",
      location: node.loc
    })
  );
}
export default {
  name: "unsafe-vm-context",
  nodeTypes: ["CallExpression"],
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};
