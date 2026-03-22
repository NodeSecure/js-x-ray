// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import {
  getCallExpressionIdentifier,
  getMemberExpressionIdentifier
} from "../estree/index.ts";
import type {
  ProbeMainContext,
  ProbeContext
} from "../ProbeRunner.ts";
import { generateWarning } from "../warnings.ts";

// CONSTANTS
export const JS_TYPES = new Set([
  "AggregateError",
  "Array",
  "ArrayBuffer",
  "BigInt",
  "BigInt64Array",
  "BigUint64Array",
  "Boolean",
  "DataView",
  "Date",
  "Error",
  "EvalError",
  "FinalizationRegistry",
  "Float32Array",
  "Float64Array",
  "Function",
  "Int16Array",
  "Int32Array",
  "Int8Array",
  "Map",
  "Number",
  "Object",
  "Promise",
  "Proxy",
  "RangeError",
  "ReferenceError",
  "Reflect",
  "RegExp",
  "Set",
  "SharedArrayBuffer",
  "String",
  "Symbol",
  "SyntaxError",
  "TypeError",
  "Uint16Array",
  "Uint32Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "URIError",
  "WeakMap",
  "WeakRef",
  "WeakSet"
]);

/**
 * @description Search for monkey patching of built-in prototypes.
 * @example
 * Array.prototype.map = function() {};
 */
function validateNodeAssignment(
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  if (
    node.type !== "AssignmentExpression" ||
    node.left.type !== "MemberExpression"
  ) {
    return [false];
  }

  return validateMemberExpression(node.left, ctx);
}

function resolveDefinePropertyIdentifier(
  node: ESTree.CallExpression,
  ctx: ProbeContext
): string | null {
  const id = getCallExpressionIdentifier(node);
  if (id === "Object.defineProperty" || id === "Reflect.defineProperty") {
    return id;
  }

  if (id === null || !id.includes(".")) {
    return null;
  }

  const [objectPart, ...rest] = id.split(".");
  const methodName = rest.join(".");

  if (methodName !== "defineProperty") {
    return null;
  }

  const resolved = resolveJsTypeName(objectPart, ctx);
  if (resolved === "Object" || resolved === "Reflect") {
    return `${resolved}.defineProperty`;
  }

  return null;
}

function validateDefineProperty(
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  if (node.type !== "CallExpression") {
    return [false];
  }

  const resolvedId = resolveDefinePropertyIdentifier(node, ctx);
  if (resolvedId === null) {
    return [false];
  }

  const firstArg = node.arguments.at(0);
  if (firstArg?.type !== "MemberExpression") {
    return [false];
  }

  return validateMemberExpression(firstArg, ctx);
}

function resolveJsTypeName(
  name: string,
  ctx: ProbeContext
): string | null {
  if (JS_TYPES.has(name)) {
    return name;
  }

  const tracedData = ctx.sourceFile.tracer.getDataFromIdentifier(name);
  if (tracedData !== null && JS_TYPES.has(tracedData.identifierOrMemberExpr)) {
    return tracedData.identifierOrMemberExpr;
  }

  return null;
}

function validateMemberExpression(
  node: ESTree.MemberExpression,
  ctx: ProbeContext
): [boolean, any?] {
  const iter = getMemberExpressionIdentifier(node, {
    externalIdentifierLookup: (name: string) => ctx.sourceFile.tracer.literalIdentifiers.get(name)?.value ?? null
  });

  const rawName = iter.next().value;
  if (typeof rawName !== "string") {
    return [false];
  }

  const jsTypeName = resolveJsTypeName(rawName, ctx);
  if (jsTypeName === null) {
    return [false];
  }

  return [
    iter.next().value === "prototype",
    `${jsTypeName}.prototype`
  ];
}

function initialize(
  ctx: ProbeContext
) {
  const { tracer } = ctx.sourceFile;

  for (const jsType of JS_TYPES) {
    tracer.trace(jsType, {
      followConsecutiveAssignment: true
    });
  }
}

function main(
  node: ESTree.Node,
  options: ProbeMainContext
) {
  const { sourceFile, data: prototypeName } = options;

  sourceFile.warnings.push(
    generateWarning("monkey-patch", { value: prototypeName, location: node.loc })
  );
}

export default {
  name: "isMonkeyPatch",
  validateNode: [
    validateNodeAssignment,
    validateDefineProperty
  ],
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};
