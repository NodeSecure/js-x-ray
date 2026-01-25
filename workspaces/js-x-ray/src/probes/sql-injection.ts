// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeMainContext } from "../ProbeRunner.ts";
import { toLiteral } from "../utils/toLiteral.ts";
import { generateWarning } from "../warnings.ts";

// CONSTANTS
const kSqlInjectionRegex = /(select\s+.*\s+from|insert\s+into|delete\s+from|update\s+.*\s+set)/i;

function validateNode(
  node: ESTree.Node
): [boolean, any?] {
  if (node.type !== "CallExpression") {
    return [false];
  }

  for (const argNode of node.arguments) {
    if (argNode.type !== "TemplateLiteral" || argNode.expressions.length === 0) {
      continue;
    }

    const literal = toLiteral(argNode);
    if (kSqlInjectionRegex.test(literal)) {
      return [true, literal];
    }
  }

  return [false];
}

function main(
  node: ESTree.TemplateLiteral,
  ctx: ProbeMainContext
) {
  ctx.sourceFile.warnings.push(
    generateWarning("sql-injection", {
      value: ctx.data,
      location: node.loc
    })
  );
}

export default {
  name: "sql-injection",
  validateNode,
  main,
  breakOnMatch: false
};
