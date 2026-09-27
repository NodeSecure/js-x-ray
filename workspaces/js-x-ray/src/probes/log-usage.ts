// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../ProbeRunner.ts";
import { VariableTracer, type ReturnValueEventPayload } from "../VariableTracer.ts";
import {
  isIdentifier,
  isNode,
  isObjectExpression,
  findPropertyMatch
} from "../estree/index.ts";
import { getTracedCall, traceAll } from "./tracing.ts";
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
const kThirdPartyLoggers = [
  { moduleName: "winston", identifierOrMemberExpr: "winston.createLogger" },
  { moduleName: "winston", identifierOrMemberExpr: "winston" },
  { moduleName: "pino", identifierOrMemberExpr: "pino" }
];

// Virtual identifiers are an internal tracer detail, strip them from the report.
const kVirtualCallPrefix = /__virtual_call_.*\d+__\./;

type LogUsageContextDef = AggregatedLocations;

interface LoggerFactory {
  moduleName: string;
  /**
   * Traced call returning a logger instance.
   * @example "winston.createLogger"
   */
  factoryName: string;
  /**
   * Log methods exposed by the returned logger when it is not customized.
   */
  defaultMethods: readonly string[];
  /**
   * Narrow the log methods down from the options object given to the root
   * factory call. Returns null to keep `defaultMethods`.
   */
  resolveMethods?: (
    options: ESTree.ObjectExpression,
    tracer: VariableTracer
  ) => string[] | null;
}

// CONSTANTS
const kLoggerFactories: LoggerFactory[] = [
  {
    moduleName: "winston",
    factoryName: "winston.child",
    defaultMethods: kWinstonLogMethods
  },
  {
    moduleName: "winston",
    factoryName: "winston.createLogger",
    defaultMethods: kWinstonLogMethods,
    resolveMethods(options) {
      const levels = findPropertyMatch(options.properties, ["levels"], isObjectExpression);

      // winston replaces its default levels with the custom ones.
      return levels === null ? null : logMethodsOf(levels);
    }
  },
  {
    moduleName: "pino",
    factoryName: "pino",
    defaultMethods: kPinoLogMethods,
    resolveMethods(options, tracer) {
      const customLevels = findPropertyMatch(options.properties, ["customLevels"], isObjectExpression);
      const useOnlyCustomLevels = resolveUseOnlyCustomLevels(options, tracer);

      if (customLevels === null && !useOnlyCustomLevels) {
        return null;
      }

      // pino adds its custom levels to the default ones, unless explicitly
      // told to use only the custom ones.
      return [
        ...useOnlyCustomLevels ? [] : kPinoLogMethods,
        ...logMethodsOf(customLevels)
      ];
    }
  }
];

/**
 * @see https://getpino.io/#/docs/api?id=useonlycustomlevels-boolean
 */
function resolveUseOnlyCustomLevels(
  options: ESTree.ObjectExpression,
  tracer: VariableTracer
): boolean {
  const value = findPropertyMatch(options.properties, ["useOnlyCustomLevels"], isNode);
  if (value === null) {
    return false;
  }

  const rawValue = isIdentifier(value) ?
    tracer.literalIdentifiers.get(value.name)?.value :
    (value as ESTree.Literal).raw;

  return rawValue === "true";
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

/**
 * Resolve the options object of a factory call, following an identifier when
 * the object was assigned to a variable beforehand.
 *
 * @example
 * const opts = { customLevels: {} }; pino(opts);
 */
function resolveObjectArgument(
  node: ESTree.Expression | undefined,
  tracer: VariableTracer
): ESTree.ObjectExpression | null {
  const resolved = node !== undefined && isIdentifier(node) ?
    tracer.objectIdentifiers.get(node.name) :
    node;

  return isObjectExpression(resolved) ? resolved : null;
}

/**
 * Logger factories return a logger, whose methods must be traced in turn, and
 * whose `child()` is itself a factory. Register a listener walking that chain.
 */
function registerLoggerFactory(
  tracer: VariableTracer,
  logUsages: Set<string>,
  factory: LoggerFactory
): void {
  const { moduleName, factoryName, defaultMethods, resolveMethods } = factory;

  const tracedFactories = new Set<string>([factoryName]);
  const methodsByFactory = new Map<string, string[]>();

  tracer.on(VariableTracer.ReturnValueEvent, (payload: ReturnValueEventPayload) => {
    if (!tracedFactories.has(payload.name)) {
      return;
    }

    let loggerMethods = methodsByFactory.get(payload.name) ?? [...defaultMethods];

    // Custom levels are only declared on the root factory call, child loggers
    // inherit the methods resolved for their parent.
    if (resolveMethods && payload.name === factoryName) {
      const options = resolveObjectArgument(payload.arguments[0], tracer);
      const customMethods = options === null ? null : resolveMethods(options, tracer);

      if (customMethods !== null) {
        loggerMethods = customMethods;
      }
    }

    for (const method of loggerMethods) {
      const tracedMethod = `${payload.id}.${method}`;
      logUsages.add(tracedMethod);
      tracer.trace(tracedMethod, {
        followConsecutiveAssignment: true,
        moduleName
      });
    }

    const childLogger = `${payload.id}.child`;
    tracer.trace(childLogger, {
      followReturnValueAssignement: true,
      moduleName
    });

    methodsByFactory.set(childLogger, loggerMethods);
    tracedFactories.add(childLogger);
  });
}

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const identifierOrMemberExpr = getTracedCall(ctx)?.identifierOrMemberExpr;

  return [
    ctx.context![kLoggerTracedFunctions].has(identifierOrMemberExpr),
    identifierOrMemberExpr
  ];
}

function initialize(
  ctx: ProbeContext
) {
  const { tracer } = ctx.sourceFile;

  const logUsages = new Set(
    kConsoleLogMethods.map((method) => `console.${method}`)
  );
  traceAll(tracer, logUsages);

  for (const { moduleName, identifierOrMemberExpr } of kThirdPartyLoggers) {
    tracer.trace(identifierOrMemberExpr, {
      followReturnValueAssignement: true,
      followConsecutiveAssignment: true,
      moduleName
    });
  }

  // winston exposes its log methods on the module itself, on top of the
  // loggers it builds.
  const winstonMethods = kWinstonLogMethods.map((method) => `winston.${method}`);
  winstonMethods.forEach((method) => logUsages.add(method));
  traceAll(tracer, winstonMethods, { moduleName: "winston" });

  tracer.trace("winston.child", {
    followReturnValueAssignement: true,
    moduleName: "winston"
  });

  for (const factory of kLoggerFactories) {
    registerLoggerFactory(tracer, logUsages, factory);
  }

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
