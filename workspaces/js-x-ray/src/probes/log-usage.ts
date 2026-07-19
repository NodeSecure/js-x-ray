// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import { generateWarning } from "../warnings.ts";
import { toArrayLocation, type SourceArrayLocation } from "../utils/toArrayLocation.ts";
import { VariableTracer, type ReturnValueEventPayload } from "../VariableTracer.ts";
import { isIdentifier } from "../estree/index.ts";

// CONSTANTS
const kLoggerTracedFunctions = Symbol("kRunLoggerTracedFunctions");
const kPinoLogMethods = ["info", "warn", "error", "fatal", "debug", "trace"];
const kWinstonLogMethods = ["info", "warn", "error", "http", "debug", "verbose", "silly", "log"];
const kThirdPartyLoggers = [{
  moduleName: "winston",
  identifierOrMemberExpr: "winston.createLogger"
},
{
  moduleName: "winston",
  identifierOrMemberExpr: "winston"
},
{
  moduleName: "pino",
  identifierOrMemberExpr: "pino"
}
];

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

  for (const { moduleName, identifierOrMemberExpr } of kThirdPartyLoggers) {
    sourceFile.tracer.trace(identifierOrMemberExpr, {
      followReturnValueAssignement: true,
      followConsecutiveAssignment: true,
      moduleName
    });
  }

  createWinstonTracerListener(sourceFile.tracer, logUsages);
  createWinstonCreateLoggerTracerListener(sourceFile.tracer, logUsages);
  createPinoTracerListener(sourceFile.tracer, logUsages);

  ctx.context![kLoggerTracedFunctions] = logUsages;
}

function createWinstonTracerListener(tracer: VariableTracer, logUsages: Set<string>) {
  tracer.trace("winston.child", {
    followReturnValueAssignement: true,
    moduleName: "winston"
  });

  for (const method of kWinstonLogMethods) {
    const loggerMethod = `winston.${method}`;
    logUsages.add(loggerMethod);
    tracer.trace(loggerMethod, {
      followConsecutiveAssignment: true,
      moduleName: "winston"
    });
  }

  const winstonLoggerFactoryTracedFunctions = new Set<string>(["winston.child"]);

  tracer.on(VariableTracer.ReturnValueEvent, (payload: ReturnValueEventPayload) => {
    if (!winstonLoggerFactoryTracedFunctions.has(payload.name)) {
      return;
    }

    for (const method of kWinstonLogMethods) {
      const infoTracedFunction = `${payload.id}.${method}`;
      logUsages.add(infoTracedFunction);
      tracer.trace(infoTracedFunction, {
        followConsecutiveAssignment: true,
        moduleName: "winston"
      });
    }

    const childLogger = `${payload.id}.child`;

    tracer.trace(childLogger, {
      followReturnValueAssignement: true,
      moduleName: "winston"
    });

    winstonLoggerFactoryTracedFunctions.add(childLogger);
  });
}

function createWinstonCreateLoggerTracerListener(tracer: VariableTracer, logUsages: Set<string>) {
  const winstonCreateLoggerFactoryTracedFunctions = new Set<string>(["winston.createLogger"]);

  const winstonCreateLoggerChildLoggerFunctions = new Map<string, string[]>();

  tracer.on(VariableTracer.ReturnValueEvent, (payload: ReturnValueEventPayload) => {
    if (!winstonCreateLoggerFactoryTracedFunctions.has(payload.name)) {
      return;
    }

    let winstonLoggerMethods = winstonCreateLoggerChildLoggerFunctions.get(payload.name) ?? [...kWinstonLogMethods];

    winston: if (payload.name === "winston.createLogger") {
      const winstonContext = payload.arguments[0];
      if (!winstonContext || winstonContext.type !== "ObjectExpression") {
        break winston;
      }

      const levels = winstonContext.properties
        .find((objEl) => objEl.type === "Property" && isIdentifier(objEl.key) && objEl.key.name === "levels");

      if (!levels) {
        break winston;
      }

      winstonLoggerMethods = [];

      addLogMethods(levels, winstonLoggerMethods);
    }

    for (const method of winstonLoggerMethods) {
      const infoTracedFunction = `${payload.id}.${method}`;
      logUsages.add(infoTracedFunction);
      tracer.trace(infoTracedFunction, {
        followConsecutiveAssignment: true,
        moduleName: "winston"
      });
    }

    const childLogger = `${payload.id}.child`;

    tracer.trace(childLogger, {
      followReturnValueAssignement: true,
      moduleName: "winston"
    });

    winstonCreateLoggerChildLoggerFunctions.set(childLogger, winstonLoggerMethods);
    winstonCreateLoggerFactoryTracedFunctions.add(childLogger);
  });
}

function createPinoTracerListener(tracer: VariableTracer, logUsages: Set<string>) {
  const pinoLoggerFactoryTracedFunctions = new Set<string>(["pino"]);

  const pinoLoggerChildLoggerFunctions = new Map<string, string[]>();

  tracer.on(VariableTracer.ReturnValueEvent, (payload: ReturnValueEventPayload) => {
    if (!pinoLoggerFactoryTracedFunctions.has(payload.name)) {
      return;
    }

    let pinoLoggerMethods: string[] = pinoLoggerChildLoggerFunctions.get(payload.name) ?? [...kPinoLogMethods];

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

      if (useOnlyCustomLevels?.type === "Property" && isIdentifier(useOnlyCustomLevels.value)) {
        const resolvedIdentifer = tracer.literalIdentifiers.get(useOnlyCustomLevels.value.name);
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
      tracer.trace(infoTracedFunction, {
        followConsecutiveAssignment: true,
        moduleName: "pino"
      });
    }

    const childLogger = `${payload.id}.child`;

    tracer.trace(childLogger, {
      followReturnValueAssignement: true,
      moduleName: "pino"
    });

    pinoLoggerChildLoggerFunctions.set(childLogger, pinoLoggerMethods);
    pinoLoggerFactoryTracedFunctions.add(childLogger);
  });
}

function addLogMethods(customLevels: ESTree.ObjectLiteralElementLike | undefined,
  loggerMethods: string[]) {
  if (customLevels?.type !== "Property" || customLevels.value.type !== "ObjectExpression") {
    return;
  }
  customLevels.value.properties.forEach((level) => {
    if (level.type === "Property" && isIdentifier(level.key)) {
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
