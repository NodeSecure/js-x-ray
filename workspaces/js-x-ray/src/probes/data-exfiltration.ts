// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import {
  getCallExpressionIdentifier,
  isLiteral,
  type Literal
} from "../estree/index.ts";
import { VariableTracer, type ImportEventPayload } from "../VariableTracer.ts";
import type { ProbeContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import { rootLocation, toArrayLocation, type SourceArrayLocation } from "../utils/toArrayLocation.ts";
import { generateWarning } from "../warnings.ts";

// CONSTANTS
const kSensitiveModules = new Set(["os", "dns"]);

const kSensitiveMethods = [
  "os.userInfo",
  "os.networkInterfaces",
  "os.cpus",
  "dns.getServers"
];

const sensitivePathRegex = /~\/\.(ssh|aws|npmrc|gitconfig|bashrc)(\/[^\s"'`]+)?/;

type DataExfiltrationContextDef = Record<string, SourceArrayLocation[]>;

function validateJSONStringify(
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  if (ctx.sourceFile.sensitivity === "aggressive") {
    return [false];
  }

  if (ctx.context?.[CALL_EXPRESSION_DATA]?.identifierOrMemberExpr !== "JSON.stringify") {
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
  if (isLiteral(node) && sensitivePathRegex.test(node.value)) {
    ctx.setEntryPoint("literal");

    return [true];
  }

  return [false];
}

function sensitiveLiteralHandler(
  node: Literal<string>,
  ctx: ProbeContext<DataExfiltrationContextDef>
) {
  addInContext(node.value, node.loc, ctx);
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
  if (kSensitiveMethods.some((method) => data?.identifierOrMemberExpr === method
    && sourceFile.tracer.importedModules.has(method.split(".")[0]))) {
    addInContext(data?.identifierOrMemberExpr!, firstArg.loc, ctx);
  }
}

function addInContext(
  value: string,
  loc: ESTree.SourceLocation | null | undefined,
  ctx: ProbeContext<DataExfiltrationContextDef>
) {
  const arrayLocation = ctx.context?.[value];
  if (arrayLocation) {
    arrayLocation.push(toArrayLocation(loc ?? rootLocation()));
  }
  else {
    ctx.context![value!] = [toArrayLocation(loc ?? rootLocation())];
  }
}

function initialize(
  ctx: ProbeContext<DataExfiltrationContextDef>
) {
  const { sourceFile, context } = ctx;
  const { tracer } = sourceFile;
  tracer
    .trace("JSON.stringify", {
      followConsecutiveAssignment: true
    })
    .trace("os.userInfo", {
      moduleName: "os",
      followConsecutiveAssignment: true
    })
    .trace("os.networkInterfaces", {
      moduleName: "os",
      followConsecutiveAssignment: true
    })
    .trace("os.cpus", {
      moduleName: "os",
      followConsecutiveAssignment: true
    })
    .trace("dns.getServers", {
      moduleName: "dns",
      followConsecutiveAssignment: true
    });

  if (sourceFile.sensitivity !== "aggressive") {
    return;
  }
  tracer.on(VariableTracer.ImportEvent, ({
    moduleName,
    location
  }: ImportEventPayload) => {
    if (kSensitiveModules.has(moduleName) && !(moduleName in context!)) {
      context![moduleName] = [toArrayLocation(location ?? undefined)];
    }
  });
}

function finalize(ctx: ProbeContext<DataExfiltrationContextDef>) {
  const { sourceFile, context } = ctx;
  if (context && Object.keys(context).length > 0) {
    const warning = generateWarning("data-exfiltration",
      { value: Object.keys(context).join(", ") });
    sourceFile.warnings.push({ ...warning, location: Object.values(context).flat() });
  }
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
