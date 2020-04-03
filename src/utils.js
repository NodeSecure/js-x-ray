"use strict";

// CONSTANTS
const BINARY_EXPR_TYPES = new Set(["Literal", "BinaryExpression", "Identifier"]);

function isRequireResolve(node) {
    if (node.type !== "CallExpression" || node.callee.type !== "MemberExpression") {
        return false;
    }

    return node.callee.object.name === "require" && node.callee.property.name === "resolve";
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

function concatBinaryExpr(node, identifiers) {
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
    strCharDiversity,
    strSuspectScore,
    isRequireResolve,
    isLiteralRegex,
    isFunctionDeclarator,
    isRegexConstructor,
    isVariableDeclarator,
    concatBinaryExpr,
    arrExprToString,
    getMemberExprName
};
