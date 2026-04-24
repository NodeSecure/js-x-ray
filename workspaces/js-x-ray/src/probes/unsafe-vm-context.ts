// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeMainContext, ProbeContext } from "../ProbeRunner.ts";
import { generateWarning } from "../warnings.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import { VariableTracer, type ReturnValueEventPayload } from "../VariableTracer.ts";

// CONSTANTS
const kRunInContextTracedFunctions = Symbol("runInContextTracedFunctions");

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

  const identifierOrMemberExpr = ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr;

  if (ctx.context![kRunInContextTracedFunctions]?.has(identifierOrMemberExpr)) {
    ctx.setEntryPoint("script");

    return [true];
  }

  return [identifierOrMemberExpr === "vm.runInNewContext"];
}

function initialize(ctx: ProbeContext) {
  const { tracer } = ctx.sourceFile;

  const runInContextTracedFunctions = new Set<string>();

  ctx.context![kRunInContextTracedFunctions] = runInContextTracedFunctions;

  tracer.trace("vm.runInNewContext", {
    followConsecutiveAssignment: true,
    moduleName: "vm"
  });

  tracer.trace("vm.Script", {
    followReturnValueAssignement: true,
    followConsecutiveAssignment: true,
    moduleName: "vm"
  });

  tracer.on(VariableTracer.ReturnValueEvent, (payload: ReturnValueEventPayload) => {
    if (payload.name === "vm.Script") {
      const runInContractTracedFunction = `${payload.id}.runInContext`;
      runInContextTracedFunctions.add(runInContractTracedFunction);
      tracer.trace(runInContractTracedFunction, {
        followConsecutiveAssignment: true
      });
    }
  });
}

function runInNewContextHandler(
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

function scriptRunInContextHandler(
  node: ESTree.CallExpression,
  ctx: ProbeMainContext
) {
  ctx.sourceFile.warnings.push(
    generateWarning("unsafe-vm-context", {
      value: "(new vm.Script(code, options)).runInContext",
      location: node.loc
    })
  );
}

export default {
  name: "unsafe-vm-context",
  nodeTypes: ["CallExpression"],
  validateNode,
  main: {
    default: runInNewContextHandler,
    script: scriptRunInContextHandler
  },
  initialize,
  breakOnMatch: false,
  context: {}
};
