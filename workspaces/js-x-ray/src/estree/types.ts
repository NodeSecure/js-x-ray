// Import Third-party Dependencies
import type { ESTree } from "meriyah";

export type Literal<T> = ESTree.Literal & {
  value: T;
};

export type RegExpLiteral<T> = ESTree.RegExpLiteral & {
  value: T;
};

export function isNode(
  value: unknown
): value is ESTree.Node {
  return (
    value !== null &&
    typeof value === "object" &&
    "type" in value &&
    typeof value.type === "string"
  );
}

export function isLiteral(
  node: unknown
): node is Literal<string> {
  return isNode(node) &&
    node.type === "Literal" &&
    typeof node.value === "string";
}

export function isNumericLiteral(
  node: unknown
): node is Literal<number> {
  return isNode(node) &&
    node.type === "Literal" &&
    typeof (node as ESTree.Literal).value === "number";
}

export function isTemplateLiteral(
  node: unknown
): node is ESTree.TemplateLiteral {
  if (!isNode(node) || node.type !== "TemplateLiteral") {
    return false;
  }

  const firstQuasi = node.quasis.at(0);
  if (!firstQuasi) {
    return false;
  }

  return (
    firstQuasi.type === "TemplateElement" &&
    typeof firstQuasi.value.raw === "string"
  );
}

export type FunctionNode =
  | ESTree.FunctionDeclaration
  | ESTree.FunctionExpression
  | ESTree.ArrowFunctionExpression;

export function isFunctionNode(
  node: unknown
): node is FunctionNode {
  return isNode(node) && (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  );
}

export function isCallExpression(
  node: unknown
): node is ESTree.CallExpression {
  return isNode(node) && node.type === "CallExpression";
}

export function isIdentifier(
  node: unknown
): node is ESTree.Identifier {
  return isNode(node) && node.type === "Identifier";
}

export function isMemberExpression(
  node: unknown
): node is ESTree.MemberExpression {
  return isNode(node) && node.type === "MemberExpression";
}

export interface DefaultOptions {
  externalIdentifierLookup?(name: string): string | null;
}

export function noop(_name: string): string | null {
  return null;
}
