// Import Third-party Dependencies
import {
  getCallExpressionIdentifier,
  getMemberExpressionIdentifier
} from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { SourceFile } from "../SourceFile.js";
import { generateWarning } from "../warnings.js";
import { ProbeSignals } from "../ProbeRunner.js";

/**
 * @description Detect serialization of process.env which could indicate environment variable exfiltration
 * @example
 * JSON.stringify(process.env)
 * JSON.stringify(process["env"])
 * JSON.stringify(process["env"])
 * JSON.stringify(process[`env`])
 */
function validateNode(
  node: ESTree.Node,
  { tracer }: SourceFile
): [boolean, any?] {
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

function main(
  node: ESTree.Node,
  options: { sourceFile: SourceFile; }
) {
  const { sourceFile } = options;

  const warning = generateWarning("serialize-environment", {
    value: "JSON.stringify(process.env)",
    location: node.loc
  });
  sourceFile.warnings.push(warning);

  return ProbeSignals.Skip;
}

function initialize(
  { tracer }: SourceFile
) {
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
  validateNode,
  initialize,
  main,
  breakOnMatch: false
};
