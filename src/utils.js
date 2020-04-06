"use strict";

// CONSTANTS
const BINARY_EXPR_TYPES = new Set(["Literal", "BinaryExpression", "Identifier"]);
const GLOBAL_IDENTIFIERS = new Set(["global", "globalThis", "root", "GLOBAL", "window"]);
const GLOBAL_PARTS = new Set([...GLOBAL_IDENTIFIERS, "process", "mainModule", "require"]);
const kMainModuleStr = "process.mainModule.require";

function* getIdLength(node) {
    if (node.type === "Identifier") {
        yield node.name.length;
    }
    else if (node.type === "ArrayPattern") {
        yield* node.elements
            .filter((id) => id !== null && id !== void 0)
            .map((id) => {
                if (id.type === "AssignmentPattern") {
                    return id.left.name.length;
                }

                return (id.type === "RestElement" ? id.argument.name : id.name).length;
            });
    }
    else if (node.type === "ObjectPattern") {
        yield* node.properties
            .filter((property) => property !== null && property !== void 0)
            .map((property) => (property.type === "RestElement" ? property.argument.name : property.key.name).length);
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
        return false;
    }

    if (node.callee.type === "Identifier") {
        return node.callee.name === "eval";
    }

    if (node.callee.type !== "CallExpression") {
        return false;
    }
    const callee = node.callee.callee;

    return callee.type === "Identifier" && callee.name === "Function";
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
    if (node.type !== "VariableDeclarator" ||
        node.init === null ||
        node.id.type !== "Identifier") {
        return false;
    }

    return true;
}

function isFunctionDeclarator(node) {
    if (node.type !== "FunctionDeclaration" ||
        node.id === null ||
        node.id.type !== "Identifier") {
        return false;
    }

    return true;
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

function isHexValue(value) {
    return typeof value === "string" && /^[0-9A-Fa-f]{4,}$/g.test(value);
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
            if (args.length > 0 && args[0].type === "Literal" && isHexValue(args[0].value)) {
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

function strCharDiversity(str) {
    return new Set([...str]).size;
}

function strSuspectScore(str) {
    if (str.length < 45) {
        return 0;
    }

    const includeSpace = str.includes(" ");
    const includeSpaceAtStart = includeSpace ? str.slice(0, 45).includes(" ") : false;
    let suspectScore = includeSpaceAtStart ? 0 : 1;
    if (str.length > 200) {
        suspectScore += Math.floor(str.length / 750);
    }

    return strCharDiversity(str) >= 70 ? suspectScore + 2 : suspectScore;
}

module.exports = {
    getIdLength,
    getRequirablePatterns,
    strCharDiversity,
    strSuspectScore,
    isHexValue,
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
    CONSTANTS: Object.freeze({
        GLOBAL_IDENTIFIERS,
        GLOBAL_PARTS
    })
};
