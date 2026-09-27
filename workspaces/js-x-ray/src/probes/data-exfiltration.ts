// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import {
  getCallExpressionIdentifier,
  isStringLiteral,
  type Literal
} from "../estree/index.ts";
import { VariableTracer, type ImportEventPayload } from "../VariableTracer.ts";
import type { ProbeContext } from "../ProbeRunner.ts";
import {
  getTracedCall,
  traceAll,
  traceAllFromModule,
  type ModuleScopedIdentifier
} from "./tracing.ts";
import {
  collectLocation,
  pushAggregatedWarning,
  type AggregatedLocations
} from "./warningAggregator.ts";

// CONSTANTS
const kSensitiveMethods: ModuleScopedIdentifier[] = [
  "os.userInfo",
  "os.networkInterfaces",
  "os.cpus",
  "dns.getServers"
];

const sensitivePathRegex = /~\/\.(ssh|aws|npmrc|gitconfig|bashrc)(\/[^\s"'`]+)?/;

type DataExfiltrationContextDef = AggregatedLocations;

function validateJSONStringify(
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  if (ctx.sourceFile.sensitivity === "aggressive") {
    return [false];
  }

  if (getTracedCall(ctx)?.identifierOrMemberExpr !== "JSON.stringify") {
    return [false];
  }

  const castedNode = node as ESTree.CallExpression;
  if (castedNode.arguments.length === 0) {
    return [false];
  }

  return [true];
}

function validateLiteral(
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  if (isStringLiteral(node) && sensitivePathRegex.test(node.value)) {
    ctx.setEntryPoint("literal");

    return [true];
  }

  return [false];
}

function sensitiveLiteralHandler(
  node: Literal<string>,
  ctx: ProbeContext<DataExfiltrationContextDef>
) {
  collectLocation(ctx, node.value, node.loc);
}

function sensitiveMethodsHandler(
  node: ESTree.CallExpression,
  ctx: ProbeContext<DataExfiltrationContextDef>
) {
  const { sourceFile } = ctx;

  const firstArg = node.arguments[0];
  if (firstArg.type !== "CallExpression") {
    return;
  }
  const id = getCallExpressionIdentifier(firstArg);

  if (!id) {
    return;
  }
  const data = sourceFile.tracer.getDataFromIdentifier(id);
  if (kSensitiveMethods.some((method) => data?.identifierOrMemberExpr === method)) {
    collectLocation(ctx, data!.identifierOrMemberExpr, firstArg.loc);
  }
}

function initialize(
  ctx: ProbeContext<DataExfiltrationContextDef>
) {
  const { sourceFile, context } = ctx;
  const { tracer } = sourceFile;

  traceAll(tracer, ["JSON.stringify"]);
  const sensitiveModules = traceAllFromModule(tracer, kSensitiveMethods);

  if (sourceFile.sensitivity !== "aggressive") {
    return;
  }
  tracer.on(VariableTracer.ImportEvent, ({
    moduleName,
    location
  }: ImportEventPayload) => {
    // Only the import itself is reported, not every later usage.
    if (sensitiveModules.has(moduleName) && !(moduleName in context!)) {
      collectLocation(ctx, moduleName, location);
    }
  });
}

function finalize(ctx: ProbeContext<DataExfiltrationContextDef>) {
  pushAggregatedWarning(ctx, "data-exfiltration");
}

const dateExifiltration = {
  name: "dataExfiltration",
  nodeTypes: ["CallExpression", "Literal"],
  validateNode: [validateJSONStringify, validateLiteral],
  initialize,
  finalize,
  main: {
    default: sensitiveMethodsHandler,
    literal: sensitiveLiteralHandler
  },
  breakOnMatch: false,
  context: {}
};

export default dateExifiltration;
