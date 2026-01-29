// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { concatBinaryExpression } from "./concatBinaryExpression.ts";
import { toLiteral } from "./toLiteral.ts";
import {
  type DefaultOptions,
  noop
} from "./options.ts";

export function getCallExpressionArguments(
  node: ESTree.Node,
  options: DefaultOptions = {}
): string[] | null {
  const { externalIdentifierLookup = noop } = options;

  if (
    // eslint-disable-next-line no-eq-null
    node == null ||
    node.type !== "CallExpression" ||
    node.arguments.length === 0
  ) {
    return null;
  }

  const literalsNode: string[] = [];
  for (const arg of node.arguments) {
    switch (arg.type) {
      case "Identifier": {
        const identifierValue = externalIdentifierLookup(arg.name);
        if (identifierValue !== null) {
          literalsNode.push(identifierValue);
        }

        break;
      }
      case "Literal": {
        if (typeof arg.value === "string") {
          literalsNode.push(hexToString(arg.value));
        }

        break;
      }
      case "TemplateLiteral": {
        const literal = toLiteral(arg);
        literalsNode.push(literal);

        break;
      }
      case "BinaryExpression": {
        const concatenatedBinaryExpr = [
          ...concatBinaryExpression(arg, { externalIdentifierLookup })
        ].join("");
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
