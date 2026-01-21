// Import Third-party Dependencies
import {
  getCallExpressionIdentifier,
  getMemberExpressionIdentifier
} from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type {
  ProbeContext,
  ProbeMainContext
} from "../ProbeRunner.ts";
import { generateWarning } from "../warnings.ts";

/**
 * @description Detect serialization of process.env which could indicate environment variable exfiltration
 * @example
 * JSON.stringify(process.env)
 * JSON.stringify(process["env"])
 * JSON.stringify(process["env"])
 * JSON.stringify(process[`env`])
 */
function validateJsonStringify(
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const { tracer } = ctx.sourceFile;

  const id = getCallExpressionIdentifier(node);

  if (id === null) {
    return [false];
  }
  const data = tracer.getDataFromIdentifier(id);

  if (data === null || data.identifierOrMemberExpr !== "JSON.stringify") {
    return [false];
  }

  const castedNode = node as ESTree.CallExpression;
  if (castedNode.arguments.length === 0) {
    return [false];
  }

  const firstArg = castedNode.arguments[0];
  if (firstArg.type === "MemberExpression") {
    const memberExprId = [...getMemberExpressionIdentifier(firstArg)].join(".");
    if (memberExprId === "process.env") {
      return [true];
    }
  }

  if (firstArg.type === "Identifier") {
    const data = tracer.getDataFromIdentifier(firstArg.name);
    if (data !== null) {
      return [true];
    }
  }

  return [false];
}

/**
 * @description Detect direct process.env access (for aggressive mode)
 * @example
 * process.env
 * const env = process.env
 */
function validateProcessEnv(
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  if (node.type !== "MemberExpression") {
    return [false];
  }

  const memberExprId = [...getMemberExpressionIdentifier(node as ESTree.MemberExpression)].join(".");
  if (memberExprId === "process.env") {
    ctx.setEntryPoint("process.env");

    return [true];
  }

  return [false];
}

function defaultHandler(
  node: ESTree.Node,
  ctx: ProbeMainContext
) {
  const { sourceFile, signals } = ctx;

  const warning = generateWarning("serialize-environment", {
    value: "JSON.stringify(process.env)",
    location: node.loc
  });
  sourceFile.warnings.push(warning);

  return signals.Skip;
}

function processEnvHandler(
  node: ESTree.Node,
  ctx: ProbeMainContext
) {
  const { sourceFile, signals } = ctx;

  // Only trigger warning in aggressive mode
  if (sourceFile.sensitivity !== "aggressive") {
    return null;
  }

  const warning = generateWarning("serialize-environment", {
    value: "process.env",
    location: node.loc
  });
  sourceFile.warnings.push(warning);

  return signals.Skip;
}

function initialize(
  ctx: ProbeContext
) {
  const { tracer } = ctx.sourceFile;

  tracer
    .trace("process.env", {
      followConsecutiveAssignment: true
    })
    .trace("JSON.stringify", {
      followConsecutiveAssignment: true
    });
}

export default {
  name: "isSerializeEnv",
  validateNode: [validateJsonStringify, validateProcessEnv],
  initialize,
  main: {
    default: defaultHandler,
    "process.env": processEnvHandler
  },
  breakOnMatch: false
};
