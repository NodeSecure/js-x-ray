// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";

// Import Internal Dependencies
import { globalIdentifiers, processMainModuleRequire } from "./constants.js";

// CONSTANTS
const kBinaryExprTypes = new Set(["Literal", "BinaryExpression", "Identifier"]);
const kExperimentalWarnings = new Set(["weak-crypto"]);

export function notNullOrUndefined(value) {
  return value !== null && value !== void 0;
}

export function* getIdName(node) {
  switch (node.type) {
    case "Identifier":
      yield node.name;
      break;
    case "RestElement":
      yield node.argument.name;
      break;
    case "AssignmentPattern":
      yield node.left.name;
      break;
    case "ArrayPattern":
      yield* node.elements.filter(notNullOrUndefined).map((id) => [...getIdName(id)]).flat();
      break;
    case "ObjectPattern":
      yield* node.properties.filter(notNullOrUndefined).map((property) => [...getIdName(property)]).flat();
      break;
  }
}

export function isRequireGlobalMemberExpr(value) {
  return [...globalIdentifiers]
    .some((name) => value.startsWith(`${name}.${processMainModuleRequire}`));
}

export function isUnsafeCallee(node) {
  if (node.type !== "CallExpression") {
    return [false, null];
  }

  if (node.callee.type === "Identifier") {
    return [node.callee.name === "eval", "eval"];
  }

  if (node.callee.type !== "CallExpression") {
    return [false, null];
  }
  const callee = node.callee.callee;

  return [callee.type === "Identifier" && callee.name === "Function", "Function"];
}

export function isLiteralRegex(node) {
  return node.type === "Literal" && Reflect.has(node, "regex");
}

export function arrExprToString(elements, identifiers = null) {
  let ret = "";
  const isArrayExpr = typeof elements === "object" && Reflect.has(elements, "elements");
  const localElements = isArrayExpr ? elements.elements : elements;

  for (const row of localElements) {
    if (row.type === "Literal") {
      if (row.value === "") {
        continue;
      }

      const value = Number(row.value);
      ret += Number.isNaN(value) ? row.value : String.fromCharCode(value);
    }
    else if (row.type === "Identifier" && identifiers !== null && identifiers.has(row.name)) {
      ret += identifiers.get(row.name);
    }
  }

  return ret;
}

export function concatBinaryExpr(node, identifiers = new Set()) {
  const { left, right } = node;
  if (!kBinaryExprTypes.has(left.type) || !kBinaryExprTypes.has(right.type)) {
    return null;
  }
  let str = "";

  for (const childNode of [left, right]) {
    switch (childNode.type) {
      case "BinaryExpression": {
        const value = concatBinaryExpr(childNode, identifiers);
        if (value !== null) {
          str += value;
        }
        break;
      }
      case "ArrayExpression": {
        str += arrExprToString(childNode.elements, identifiers);
        break;
      }
      case "Literal":
        str += childNode.value;
        break;
      case "Identifier":
        if (identifiers.has(childNode.name)) {
          str += identifiers.get(childNode.name);
        }
        break;
    }
  }

  return str;
}

export function getMemberExprName(node) {
  let name = "";

  switch (node.object.type) {
    case "MemberExpression":
      name += getMemberExprName(node.object);
      break;
    case "Identifier":
      name += node.object.name;
      break;
    case "Literal":
      name += node.object.value;
      break;
  }

  switch (node.property.type) {
    case "Identifier":
      name += `.${node.property.name}`;
      break;
    case "Literal":
      name += `.${node.property.value}`;
      break;
    case "CallExpression": {
      const args = node.property.arguments;
      if (args.length > 0 && args[0].type === "Literal" && Hex.isHex(args[0].value)) {
        name += `.${Buffer.from(args[0].value, "hex").toString()}`;
      }
      break;
    }
    case "BinaryExpression": {
      const value = concatBinaryExpr(node.property);
      if (value !== null && value.trim() !== "") {
        name += `.${value}`;
      }
      break;
    }
  }

  return name;
}

export function rootLocation() {
  return { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } };
}

export function toArrayLocation(location = rootLocation()) {
  const { start, end = start } = location;

  return [[start.line || 0, start.column || 0], [end.line || 0, end.column || 0]];
}

export function generateWarning(kind, options) {
  const { location, file = null, value = null } = options;

  if (kind === "encoded-literal") {
    return { kind, value, location: [toArrayLocation(location)] };
  }

  const result = { kind, location: toArrayLocation(location) };
  if (notNullOrUndefined(file)) {
    result.file = file;
  }
  if (notNullOrUndefined(value)) {
    result.value = value;
  }

  if (kExperimentalWarnings.has(kind)) {
    result.experimental = true;
  }

  return result;
}
