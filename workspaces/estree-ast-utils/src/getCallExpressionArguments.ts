// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";

// Import Internal Dependencies
import { concatBinaryExpression } from "./concatBinaryExpression.js";
import type { TracerOptions, NodeAst } from "./types.js";

export function getCallExpressionArguments(
  node: NodeAst,
  options: TracerOptions = {}
): string[] | null {
  const { tracer = null } = options;

  if (node.type !== "CallExpression" || node.arguments.length === 0) {
    return null;
  }

  const literalsNode: string[] = [];
  for (const arg of node.arguments) {
    switch (arg.type) {
      case "Identifier": {
        if (tracer !== null && tracer.literalIdentifiers.has(arg.name)) {
          literalsNode.push(tracer.literalIdentifiers.get(arg.name)!);
        }

        break;
      }
      case "Literal": {
        literalsNode.push(hexToString(arg.value));

        break;
      }
      case "BinaryExpression": {
        const concatenatedBinaryExpr = [...concatBinaryExpression(arg, { tracer })].join("");
        if (concatenatedBinaryExpr !== "") {
          literalsNode.push(concatenatedBinaryExpr);
        }

        break;
      }
    }
  }

  return literalsNode.length === 0 ? null : literalsNode;
}

function hexToString(value: string): string {
  return Hex.isHex(value) ? Buffer.from(value, "hex").toString() : value;
}
