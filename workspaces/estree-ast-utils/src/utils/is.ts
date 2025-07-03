// Import Third-party Dependencies
import type { ESTree } from "meriyah";

export type Literal<T> = ESTree.Literal & {
  value: T;
};

export type RegExpLiteral<T> = ESTree.RegExpLiteral & {
  value: T;
};

export function isNode(
  value: any
): value is ESTree.Node {
  return (
    value !== null &&
    typeof value === "object" &&
    "type" in value &&
    typeof value.type === "string"
  );
}

export function isCallExpression(
  node: any
): node is ESTree.CallExpression {
  return isNode(node) && node.type === "CallExpression";
}

export function isLiteral(
  node: any
): node is Literal<string> {
  return isNode(node) &&
    node.type === "Literal" &&
    typeof node.value === "string";
}
