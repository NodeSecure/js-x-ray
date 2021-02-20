"use strict";

// Require Third-party Dependencies
const { Hex } = require("sec-literal");

// CONSTANTS
const BINARY_EXPR_TYPES = new Set(["Literal", "BinaryExpression", "Identifier"]);
const GLOBAL_IDENTIFIERS = new Set(["global", "globalThis", "root", "GLOBAL", "window"]);
const GLOBAL_PARTS = new Set([...GLOBAL_IDENTIFIERS, "process", "mainModule", "require"]);
const kMainModuleStr = "process.mainModule.require";

function notNullOrUndefined(value) {
    return value !== null && value !== void 0;
}

function* getIdName(node) {
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

function getRequirablePatterns(parts) {
    const result = new Set();

    for (const [id, path] of parts.entries()) {
        if (path === "process") {
            result.add(`${id}.mainModule.require`);
        }
        else if (path === "mainModule") {
            result.add(`${id}.require`);
        }
        else if (path.includes("require")) {
            result.add(id);
        }
    }

    return [...result];
}

function isRequireGlobalMemberExpr(value) {
    return [...GLOBAL_IDENTIFIERS].some((name) => value.startsWith(`${name}.${kMainModuleStr}`));
}

function isRequireStatement(value) {
    return value.startsWith("require") || value.startsWith(kMainModuleStr) || isRequireGlobalMemberExpr(value);
}

function isRequireMemberExpr(node) {
    if (node.type !== "CallExpression" || node.callee.type !== "MemberExpression") {
        return false;
    }

    return isRequireGlobalMemberExpr(getMemberExprName(node.callee));
}

function isRequireResolve(node) {
    if (node.type !== "CallExpression" || node.callee.type !== "MemberExpression") {
        return false;
    }

    return node.callee.object.name === "require" && node.callee.property.name === "resolve";
}

function isUnsafeCallee(node) {
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

function isRegexConstructor(node) {
    if (node.type !== "NewExpression" || node.callee.type !== "Identifier") {
        return false;
    }

    return node.callee.name === "RegExp";
}

function isLiteralRegex(node) {
    return node.type === "Literal" && Reflect.has(node, "regex");
}

function isVariableDeclarator(node) {
    return node.type !== "VariableDeclarator" || node.init === null || node.id.type !== "Identifier";
}

function isFunctionDeclarator(node) {
    return node.type !== "FunctionDeclaration" || node.id === null || node.id.type !== "Identifier";
}

function arrExprToString(elements, identifiers = null) {
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

function concatBinaryExpr(node, identifiers = new Set()) {
    const { left, right } = node;
    if (!BINARY_EXPR_TYPES.has(left.type) || !BINARY_EXPR_TYPES.has(right.type)) {
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

function getMemberExprName(node) {
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

function rootLocation() {
    return { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } };
}

function toArrayLocation(location = rootLocation()) {
    const { start, end = start } = location;

    return [[start.line || 0, start.column || 0], [end.line || 0, end.column || 0]];
}

function generateWarning(kind, options) {
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

    return result;
}

module.exports = {
    notNullOrUndefined,
    getIdName,
    getRequirablePatterns,
    isUnsafeCallee,
    isRequireStatement,
    isRequireResolve,
    isRequireMemberExpr,
    isLiteralRegex,
    isRequireGlobalMemberExpr,
    isFunctionDeclarator,
    isRegexConstructor,
    isVariableDeclarator,
    concatBinaryExpr,
    arrExprToString,
    getMemberExprName,
    generateWarning,
    toArrayLocation,
    rootLocation,
    CONSTANTS: Object.freeze({
        GLOBAL_IDENTIFIERS,
        GLOBAL_PARTS
    })
};
