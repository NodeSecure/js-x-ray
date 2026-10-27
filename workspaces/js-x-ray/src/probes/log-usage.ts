// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../ProbeRunner.ts";
import { defineProbe } from "../defineProbe.ts";
import { VariableTracer, type ReturnValueEventPayload } from "../VariableTracer.ts";
import {
  isIdentifier,
  isNode,
  isObjectExpression,
  findPropertyMatch
} from "../estree/index.ts";
import { matchTracedCall, moduleNameOf, traceAll } from "./tracing.ts";
import { resolveBooleanValue } from "./resolvers/index.ts";
import {
  collectLocation,
  pushAggregatedWarning,
  type AggregatedLocations
} from "./warningAggregator.ts";

// CONSTANTS
const kLoggerTracedFunctions = Symbol("kRunLoggerTracedFunctions");
const kConsoleLogMethods = ["log", "info", "warn", "error", "debug"];
const kPinoLogMethods = ["info", "warn", "error", "fatal", "debug", "trace"];
const kWinstonLogMethods = ["info", "warn", "error", "http", "debug", "verbose", "silly", "log"];

// Virtual identifiers are an internal tracer detail, strip them from the report.
const kVirtualCallPrefix = /__virtual_call_.*\d+__\./;

type LogUsageContextDef = AggregatedLocations;

type ObjectProperties = ESTree.ObjectExpression["properties"];

// Log methods of the created logger, read off the factory options (empty when none).
type LevelsResolver = (
  options: ObjectProperties,
  tracer: VariableTracer
) => readonly string[];

interface TracedLogger {
  moduleName: string;
  methods: readonly string[];
}

const kLoggerFactories = new Map<string, LevelsResolver>([
  ["winston.createLogger", resolveWinstonLevels],
  ["pino", resolvePinoLevels]
]);

function resolveWinstonLevels(
  options: ObjectProperties
): readonly string[] {
  const levels = findPropertyMatch(options, ["levels"], isObjectExpression);

  // winston replaces its default levels with the custom ones.
  return levels === null ? kWinstonLogMethods : logMethodsOf(levels);
}

function resolvePinoLevels(
  options: ObjectProperties,
  tracer: VariableTracer
): readonly string[] {
  const customLevels = findPropertyMatch(options, ["customLevels"], isObjectExpression);
  // @see https://getpino.io/#/docs/api?id=useonlycustomlevels-boolean
  const useOnlyCustomLevels = resolveBooleanValue(
    findPropertyMatch(options, ["useOnlyCustomLevels"], isNode),
    tracer.literalIdentifiers
  ) === true;

  // pino adds its custom levels to the default ones, unless told to use only the custom ones.
  return [
    ...useOnlyCustomLevels ? [] : kPinoLogMethods,
    ...logMethodsOf(customLevels)
  ];
}

function logMethodsOf(
  levels: ESTree.ObjectExpression | null
): string[] {
  if (levels === null) {
    return [];
  }

  const methods: string[] = [];
  for (const level of levels.properties) {
    if (level.type === "Property" && isIdentifier(level.key)) {
      methods.push(level.key.name);
    }
  }

  return methods;
}

function resolveObjectArgument(
  node: ESTree.Expression | undefined,
  tracer: VariableTracer
): ESTree.ObjectExpression | null {
  const resolved = node !== undefined && isIdentifier(node) ?
    tracer.objectIdentifiers.get(node.name) :
    node;

  return isObjectExpression(resolved) ? resolved : null;
}

function createRootLogger(
  { name, arguments: args }: ReturnValueEventPayload,
  tracer: VariableTracer
): TracedLogger | null {
  const resolveLevels = kLoggerFactories.get(name);
  if (resolveLevels === undefined) {
    return null;
  }
  const options = resolveObjectArgument(args[0], tracer)?.properties ?? [];

  return {
    moduleName: moduleNameOf(name),
    methods: resolveLevels(options, tracer)
  };
}

function validateNode(
  _node: ESTree.CallExpression,
  ctx: ProbeContext
): [boolean, string?] {
  return matchTracedCall(ctx, ctx.context![kLoggerTracedFunctions]);
}

function initialize(
  ctx: ProbeContext
) {
  const { tracer } = ctx.sourceFile;
  const logUsages = new Set<string>();
  // `<logger>.child` -> the logger it returns, which inherits its parent levels.
  const childFactories = new Map<string, TracedLogger>();

  function traceLogger(id: string, logger: TracedLogger) {
    const { moduleName } = logger;

    for (const method of logger.methods) {
      const logUsage = `${id}.${method}`;
      logUsages.add(logUsage);
      tracer.trace(logUsage, {
        followConsecutiveAssignment: true,
        moduleName
      });
    }

    const childFactory = `${id}.child`;
    tracer.trace(childFactory, {
      followReturnValueAssignement: true,
      moduleName
    });
    childFactories.set(childFactory, logger);
  }

  const consoleLogUsages = kConsoleLogMethods.map((method) => `console.${method}`);
  traceAll(tracer, consoleLogUsages);
  consoleLogUsages.forEach((logUsage) => logUsages.add(logUsage));

  for (const identifierOrMemberExpr of ["winston", ...kLoggerFactories.keys()]) {
    tracer.trace(identifierOrMemberExpr, {
      followReturnValueAssignement: true,
      followConsecutiveAssignment: true,
      moduleName: moduleNameOf(identifierOrMemberExpr)
    });
  }

  traceLogger("winston", { moduleName: "winston", methods: kWinstonLogMethods });

  tracer.on(VariableTracer.ReturnValueEvent, (payload: ReturnValueEventPayload) => {
    const logger = childFactories.get(payload.name) ?? createRootLogger(payload, tracer);
    if (logger !== null) {
      traceLogger(payload.id, logger);
    }
  });

  ctx.context![kLoggerTracedFunctions] = logUsages;
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeMainContext<LogUsageContextDef>
) {
  collectLocation(ctx, ctx.data, node.loc);
}

function finalize(ctx: ProbeContext<LogUsageContextDef>) {
  pushAggregatedWarning(ctx, "log-usage", {
    formatValue: (method) => method.replace(kVirtualCallPrefix, "")
  });
}

export default defineProbe({
  name: "log-usage",
  nodeTypes: ["CallExpression"],
  validateNode,
  initialize,
  main,
  finalize,
  breakOnMatch: false,
  context: {}
});
