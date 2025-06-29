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
  node: ESTree.Node
): [boolean, any?] {
  const id = getCallExpressionIdentifier(node);
  if (id !== "JSON.stringify") {
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

export default {
  name: "isSerializeEnv",
  validateNode,
  main,
  breakOnMatch: false
};
