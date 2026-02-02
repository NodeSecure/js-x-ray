// Import Third-party Dependencies
import {
  getCallExpressionIdentifier
} from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
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

type DataExfiltrationContextDef = Record<string, SourceArrayLocation[]>;

function validateNode(
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

function main(
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
    const arrayLocation = ctx.context?.[data?.identifierOrMemberExpr!];
    if (arrayLocation) {
      arrayLocation.push(toArrayLocation(firstArg.loc ?? rootLocation()));
    }
    else {
      ctx.context![data?.identifierOrMemberExpr!] = [toArrayLocation(firstArg.loc ?? rootLocation())];
    }
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
  validateNode,
  initialize,
  finalize,
  main,
  breakOnMatch: false,
  context: {}
};

export default dateExifiltration;
