// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { toLiteral } from "../estree/index.ts";
import type { ProbeMainContext, ProbeContext } from "../ProbeRunner.ts";
import { defineProbe } from "../defineProbe.ts";
import { generateWarning } from "../warnings.ts";

// CONSTANTS
const kSqlInjectionRegex = /(select\s+.*\s+from|insert\s+into|delete\s+from|update\s+.*\s+set)/i;

function validateNode(
  node: ESTree.CallExpression,
  { sourceFile: { tracer } }: ProbeContext
): [boolean, any?] {
  for (const argNode of node.arguments) {
    switch (argNode.type) {
      case "Identifier": {
        const literalIdentifier = tracer.literalIdentifiers.get(argNode.name);

        if (
          literalIdentifier?.type !== "TemplateLiteral" ||
          !kSqlInjectionRegex.test(literalIdentifier.value)
        ) {
          break;
        }

        return [true, literalIdentifier.value];
      }

      case "TemplateLiteral": {
        if (argNode.expressions.length === 0) {
          break;
        }
        const literal = toLiteral(argNode);
        if (!kSqlInjectionRegex.test(literal)) {
          break;
        }

        return [true, literal];
      }
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

export default defineProbe({
  name: "sql-injection",
  nodeTypes: ["CallExpression"],
  validateNode,
  main,
  breakOnMatch: false
});
