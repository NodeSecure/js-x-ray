"use strict";

// CONSTANTS
const BINARY_EXPR_TYPES = new Set(["Literal", "BinaryExpression", "Identifier"]);
const GLOBAL_IDENTIFIERS = new Set(["global", "globalThis", "root", "GLOBAL", "window"]);
const SAFE_HEX_VALUE = new Set(["0123456789", "abcdef", "0123456789abcdef", "abcdef0123456789abcdef"]);
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
            yield* node.properties.filter(notNullOrUndefined)
                .map((property) => (property.type === "RestElement" ? property.argument.name : property.value.name));
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

function isSafeHexValue(rawValue) {
    return SAFE_HEX_VALUE.has(rawValue);
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

function commonStringStart(leftStr, rightStr) {
    const minLen = leftStr.length > rightStr.length ? rightStr.length : leftStr.length;
    let commonStr = "";

    for (let id = 0; id < minLen; id++) {
        if (leftStr.charAt(id) !== rightStr.charAt(id)) {
            break;
        }

        commonStr += leftStr.charAt(id);
    }

    return commonStr === "" ? null : commonStr;
}

function commonPrefix(arr) {
    const sortedArr = arr.slice().map((value) => value.toLowerCase()).sort();
    // console.log(sortedArr);
    const prefix = new Map();

    mainLoop: for (const currentPrefix of sortedArr) {
        const matchedItems = [];
        if (!prefix.has(currentPrefix)) {
            matchedItems.push({ commonPrefix: currentPrefix, commonStr: null });
        }

        for (const commonPrefix of prefix.keys()) {
            const commonStr = commonStringStart(currentPrefix, commonPrefix);
            if (commonStr === null) {
                continue;
            }
            matchedItems.push({ commonPrefix, commonStr });
        }
        matchedItems.sort((left, right) => right.commonPrefix.length - left.commonPrefix.length);

        for (const { commonPrefix, commonStr } of matchedItems) {
            if (commonStr === null) {
                break;
            }

            const count = prefix.get(commonPrefix);
            if (commonStr === commonPrefix || commonStr.startsWith(commonPrefix)) {
                prefix.set(commonPrefix, count + 1);
            }
            else if (commonPrefix.startsWith(commonStr)) {
                prefix.set(commonStr, count + 1);
            }
            continue mainLoop;
        }

        prefix.set(currentPrefix, 1);
    }

    for (const [key, value] of prefix.entries()) {
        if (value === 1) {
            prefix.delete(key);
        }
    }

    return Object.fromEntries(prefix);
}

module.exports = {
    getIdName,
    getRequirablePatterns,
    strCharDiversity,
    strSuspectScore,
    isHexValue,
    isSafeHexValue,
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
    commonPrefix,
    CONSTANTS: Object.freeze({
        GLOBAL_IDENTIFIERS,
        GLOBAL_PARTS
    })
};
