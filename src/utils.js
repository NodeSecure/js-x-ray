// Import Third-party Dependencies
import {
  getCallExpressionIdentifier
} from "@nodesecure/estree-ast-utils";

export function notNullOrUndefined(value) {
  return value !== null && value !== void 0;
}

export function isUnsafeCallee(node) {
  const identifier = getCallExpressionIdentifier(node);

  // For Function we are looking for this: `Function("...")();`
  // A double CallExpression
  return [
    identifier === "eval" || (identifier === "Function" && node.callee.type === "CallExpression"),
    identifier
  ];
}

export function isUnsafeConstEvalRequireImport(node) {
  const isUnsafe = (node.type === "VariableDeclaration" &&
    node.kind === "const" &&
    node.declarations[0].init &&
    node.declarations[0].init.callee &&
    node.declarations[0].init.callee.callee &&
    node.declarations[0].init.callee.callee.name === "eval" &&
    node.declarations[0].init.callee.arguments[0].value === "require");

  return [
    isUnsafe,
    isUnsafe && node.declarations[0].init.arguments[0].value
  ];
}

export function rootLocation() {
  return { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } };
}

export function toArrayLocation(location = rootLocation()) {
  const { start, end = start } = location;

  return [
    [start.line || 0, start.column || 0],
    [end.line || 0, end.column || 0]
  ];
}

export function extractNode(expectedType) {
  return (callback, nodes) => {
    const finalNodes = Array.isArray(nodes) ? nodes : [nodes];

    for (const node of finalNodes) {
      if (notNullOrUndefined(node) && node.type === expectedType) {
        callback(node);
      }
    }
  };
}
