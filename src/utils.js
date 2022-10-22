// Import Third-party Dependencies
import {
  getCallExpressionIdentifier
} from "@nodesecure/estree-ast-utils";

// Import Internal Dependencies
import { globalIdentifiers, processMainModuleRequire } from "./constants.js";

export function notNullOrUndefined(value) {
  return value !== null && value !== void 0;
}

export function isRequireGlobalMemberExpr(value) {
  return [...globalIdentifiers]
    .some((name) => value.startsWith(`${name}.${processMainModuleRequire}`));
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

export function isLiteralRegex(node) {
  return node.type === "Literal" && "regex" in node;
}

export function rootLocation() {
  return { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } };
}

export function toArrayLocation(location = rootLocation()) {
  const { start, end = start } = location;

  return [[start.line || 0, start.column || 0], [end.line || 0, end.column || 0]];
}
