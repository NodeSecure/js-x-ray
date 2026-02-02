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

function validateDefineProperty(
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  if (node.type !== "CallExpression") {
    return [false];
  }
  const id = getCallExpressionIdentifier(node);

  if (
    (id !== "Object.defineProperty" && id !== "Reflect.defineProperty")
  ) {
    return [false];
  }

  const firstArg = node.arguments.at(0);
  if (firstArg?.type !== "MemberExpression") {
    return [false];
  }

  return validateMemberExpression(firstArg, ctx);
}

function validateMemberExpression(
  node: ESTree.MemberExpression,
  ctx: ProbeContext
): [boolean, any?] {
  const iter = getMemberExpressionIdentifier(node, {
    externalIdentifierLookup: (name: string) => ctx.sourceFile.tracer.literalIdentifiers.get(name)?.value ?? null
  });

  const jsTypeName = iter.next().value;
  if (typeof jsTypeName !== "string" || !JS_TYPES.has(jsTypeName)) {
    return [false];
  }

  return [
    iter.next().value === "prototype",
    `${jsTypeName}.prototype`
  ];
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
  main
};
