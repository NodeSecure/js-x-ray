// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import { generateWarning } from "../warnings.ts";
import { toArrayLocation, type SourceArrayLocation } from "../utils/toArrayLocation.ts";
import { VariableTracer, type ReturnValueEventPayload } from "../VariableTracer.ts";

// CONSTANTS
const kRunInContextTracedFunctions = Symbol("runInContextTracedFunctions");
const kPinoLogMethods = ["info", "warn", "error", "fatal", "debug", "trace"];

type LogUsageContextDef = Record<string, SourceArrayLocation[]>;

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const identifierOrMemberExpr = ctx.context?.[CALL_EXPRESSION_DATA]?.identifierOrMemberExpr;

  return [
    ctx.context![kRunInContextTracedFunctions].has(identifierOrMemberExpr),
    identifierOrMemberExpr];
}

function initialize(
  ctx: ProbeContext
) {
  const { sourceFile } = ctx;

  const logUsages = new Set(["console.log", "console.info", "console.warn", "console.error", "console.debug"]);

  for (const logUsageMethod of logUsages) {
    sourceFile.tracer.trace(logUsageMethod, {
      followConsecutiveAssignment: true
    });
  }

  sourceFile.tracer.trace("pino", {
    followReturnValueAssignement: true,
    followConsecutiveAssignment: true,
    moduleName: "pino"
  });

  const pinoLoggerFactoryTracedFunctions = new Set<string>(["pino"]);

  sourceFile.tracer.on(VariableTracer.ReturnValueEvent, (payload: ReturnValueEventPayload) => {
    if (!pinoLoggerFactoryTracedFunctions.has(payload.name)) {
      return;
    }

    for (const method of kPinoLogMethods) {
      const infoTracedFunction = `${payload.id}.${method}`;
      logUsages.add(infoTracedFunction);
      sourceFile.tracer.trace(infoTracedFunction, {
        followConsecutiveAssignment: true,
        moduleName: "pino"
      });
    }

    sourceFile.tracer.trace(`${payload.id}.child`, {
      followReturnValueAssignement: true
    });

    pinoLoggerFactoryTracedFunctions.add(`${payload.id}.child`);
  });

  ctx.context![kRunInContextTracedFunctions] = logUsages;
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
      {
        value: Object.keys(context).map((method) => method.replace(/__virtual_call_\d+__\./, "")).join(", ")
      });
    sourceFile.warnings.push({ ...warning, location: Object.values(context).flat() });
  }
}

export default {
  name: "log-usage",
  nodeTypes: ["CallExpression"],
  validateNode,
  initialize,
  main,
  finalize,
  breakOnMatch: false,
  context: {}
};
