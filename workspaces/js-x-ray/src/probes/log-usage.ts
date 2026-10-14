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
import { matchTracedCall, moduleNameOf } from "./tracing.ts";
import { resolveBooleanValue } from "./resolveBooleanValue.ts";
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
const kThirdPartyLoggers = ["winston.createLogger", "winston", "pino"];

// Virtual identifiers are an internal tracer detail, strip them from the report.
const kVirtualCallPrefix = /__virtual_call_.*\d+__\./;

type LogUsageContextDef = AggregatedLocations;

type ObjectProperties = ESTree.ObjectExpression["properties"];

// Log methods a factory's logger exposes: a fixed list, or a resolver reading
// them off the options it was called with (no properties when it had none).
type LogMethodsResolver = (
  options: ObjectProperties,
  tracer: VariableTracer
) => readonly string[];

type LoggerMethods = readonly string[] | LogMethodsResolver;

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

  // pino adds its custom levels to the default ones, unless explicitly told
  // to use only the custom ones.
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

function resolveLogMethods(
  methods: LoggerMethods,
  optionsArgument: ESTree.Expression | undefined,
  tracer: VariableTracer
): readonly string[] {
  return typeof methods === "function" ?
    methods(resolveObjectArgument(optionsArgument, tracer)?.properties ?? [], tracer) :
    methods;
}

interface LogUsageRegistry {
  tracer: VariableTracer;
  logUsages: Set<string>;
}

function traceLogUsages(
  { tracer, logUsages }: LogUsageRegistry,
  methods: readonly string[],
  moduleName: string | null = null
): void {
  for (const method of methods) {
    logUsages.add(method);
    tracer.trace(method, {
      followConsecutiveAssignment: true,
      moduleName
    });
  }
}

function registerLoggerFactory(
  registry: LogUsageRegistry,
  factoryName: string,
  methods: LoggerMethods
): void {
  const { tracer } = registry;
  const moduleName = moduleNameOf(factoryName);

  const tracedFactories = new Set<string>([factoryName]);
  const methodsByFactory = new Map<string, readonly string[]>();

  tracer.on(VariableTracer.ReturnValueEvent, (payload: ReturnValueEventPayload) => {
    if (!tracedFactories.has(payload.name)) {
      return;
    }

    // Only child loggers are keyed in methodsByFactory, so a miss means this
    // is the root call: custom levels are declared there, children inherit.
    const loggerMethods = methodsByFactory.get(payload.name) ??
      resolveLogMethods(methods, payload.arguments[0], tracer);

    traceLogUsages(
      registry,
      loggerMethods.map((method) => `${payload.id}.${method}`),
      moduleName
    );

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
  _node: ESTree.CallExpression,
  ctx: ProbeContext
): [boolean, string?] {
  return matchTracedCall(ctx, ctx.context![kLoggerTracedFunctions]);
}

function initialize(
  ctx: ProbeContext
) {
  const { tracer } = ctx.sourceFile;
  const registry: LogUsageRegistry = { tracer, logUsages: new Set() };

  traceLogUsages(
    registry,
    kConsoleLogMethods.map((method) => `console.${method}`)
  );

  for (const identifierOrMemberExpr of kThirdPartyLoggers) {
    tracer.trace(identifierOrMemberExpr, {
      followReturnValueAssignement: true,
      followConsecutiveAssignment: true,
      moduleName: moduleNameOf(identifierOrMemberExpr)
    });
  }

  traceLogUsages(
    registry,
    kWinstonLogMethods.map((method) => `winston.${method}`),
    "winston"
  );

  tracer.trace("winston.child", {
    followReturnValueAssignement: true,
    moduleName: "winston"
  });

  registerLoggerFactory(registry, "winston.child", kWinstonLogMethods);
  registerLoggerFactory(registry, "winston.createLogger", resolveWinstonLevels);
  registerLoggerFactory(registry, "pino", resolvePinoLevels);

  ctx.context![kLoggerTracedFunctions] = registry.logUsages;
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
