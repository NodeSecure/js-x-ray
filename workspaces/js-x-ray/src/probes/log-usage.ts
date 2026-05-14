// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import { generateWarning } from "../warnings.ts";
import { toArrayLocation, type SourceArrayLocation } from "../utils/toArrayLocation.ts";
import { VariableTracer, type ReturnValueEventPayload } from "../VariableTracer.ts";

// CONSTANTS
const kLoggerTracedFunctions = Symbol("kRunLoggerTracedFunctions");
const kPinoLogMethods = ["info", "warn", "error", "fatal", "debug", "trace"];

type LogUsageContextDef = Record<string, SourceArrayLocation[]>;

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const identifierOrMemberExpr = ctx.context?.[CALL_EXPRESSION_DATA]?.identifierOrMemberExpr;

  return [
    ctx.context![kLoggerTracedFunctions].has(identifierOrMemberExpr),
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

  const childLoggerFunctions = new Map<string, string[]>();

  sourceFile.tracer.on(VariableTracer.ReturnValueEvent, (payload: ReturnValueEventPayload) => {
    if (!pinoLoggerFactoryTracedFunctions.has(payload.name)) {
      return;
    }

    let pinoLoggerMethods: string[] = childLoggerFunctions.get(payload.name) ?? [...kPinoLogMethods];

    pino: if (payload.name === "pino") {
      const pinoContext = payload.arguments[0];
      if (!pinoContext || pinoContext.type !== "ObjectExpression") {
        break pino;
      }
      let customLevels: ESTree.ObjectLiteralElementLike | undefined;
      let useOnlyCustomLevels: ESTree.ObjectLiteralElementLike | undefined;
      for (const objectEl of pinoContext.properties) {
        if (customLevels && useOnlyCustomLevels) {
          break;
        }
        if (objectEl.type !== "Property"
          || objectEl.key.type !== "Identifier") {
          continue;
        }
        if (objectEl.key.name === "customLevels") {
          customLevels = objectEl;
        }

        if (objectEl.key.name === "useOnlyCustomLevels") {
          useOnlyCustomLevels = objectEl;
        }
      }

      let useOnlyCustomLevelsRaw: string | undefined;

      if (useOnlyCustomLevels?.type === "Property" && useOnlyCustomLevels.value.type === "Literal") {
        useOnlyCustomLevelsRaw = useOnlyCustomLevels.value.raw;
      }

      if (useOnlyCustomLevels?.type === "Property" && useOnlyCustomLevels.value.type === "Identifier") {
        const resolvedIdentifer = sourceFile.tracer.literalIdentifiers.get(useOnlyCustomLevels.value.name);
        useOnlyCustomLevelsRaw = resolvedIdentifer?.value;
      }

      if (useOnlyCustomLevelsRaw === "true") {
        pinoLoggerMethods = [];
      }

      addLogMethods(customLevels, pinoLoggerMethods);
    }

    for (const method of pinoLoggerMethods) {
      const infoTracedFunction = `${payload.id}.${method}`;
      logUsages.add(infoTracedFunction);
      sourceFile.tracer.trace(infoTracedFunction, {
        followConsecutiveAssignment: true,
        moduleName: "pino"
      });
    }

    const childLogger = `${payload.id}.child`;

    sourceFile.tracer.trace(childLogger, {
      followReturnValueAssignement: true,
      moduleName: "pino"
    });

    childLoggerFunctions.set(childLogger, pinoLoggerMethods);
    pinoLoggerFactoryTracedFunctions.add(childLogger);
  });

  ctx.context![kLoggerTracedFunctions] = logUsages;
}

function addLogMethods(customLevels: ESTree.ObjectLiteralElementLike | undefined,
  loggerMethods: string[]) {
  if (customLevels?.type !== "Property" || customLevels.value.type !== "ObjectExpression") {
    return;
  }
  customLevels.value.properties.forEach((level) => {
    if (level.type === "Property" && level.key.type === "Identifier") {
      loggerMethods.push(level.key.name);
    }
  });
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
