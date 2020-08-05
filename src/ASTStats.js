/* eslint-disable lines-between-class-members */
"use strict";

// Require Third-party Dependencies
const isStringBase64 = require("is-base64");

// Require Internal Dependencies
const helpers = require("./utils");

// CONSTANTS
const kDictionaryStrParts = [
    "abcdefghijklmnopqrstuvwxyz",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "0123456789"
];

const kWarningsKinds = Object.freeze({
    parsingError: Symbol("ParsingError"),
    unsafeImport: Symbol("UnsafeImport"),
    unsafeRegex: Symbol("UnsafeRegex"),
    unsafeStmt: Symbol("UnsafeStmt"),
    unsafeAssign: Symbol("UnsafeAssign"),
    encodedLiteral: Symbol("EncodedLiteral"),
    shortIdentifiers: Symbol("ShortIdentifiers"),
    suspiciousLiteral: Symbol("SuspiciousLiteral"),
    obfuscatedCode: Symbol("ObfuscatedCode")
});

const kWarningsNameStr = Object.freeze({
    [kWarningsKinds.parsingError]: "parsing-error",
    [kWarningsKinds.unsafeImport]: "unsafe-import",
    [kWarningsKinds.unsafeRegex]: "unsafe-regex",
    [kWarningsKinds.unsafeStmt]: "unsafe-stmt",
    [kWarningsKinds.unsafeAssign]: "unsafe-assign",
    [kWarningsKinds.encodedLiteral]: "encoded-literal",
    [kWarningsKinds.shortIdentifiers]: "short-identifiers",
    [kWarningsKinds.suspiciousLiteral]: "suspicious-literal",
    [kWarningsKinds.obfuscatedCode]: "obfuscated-code"
});

function walkBinaryExpression(expr, level = 1) {
    const [lt, rt] = [expr.left.type, expr.right.type];
    let hasUnaryExpression = lt === "UnaryExpression" || rt === "UnaryExpression";
    let currentLevel = lt === "BinaryExpression" || rt === "BinaryExpression" ? level + 1 : level;

    for (const currExpr of [expr.left, expr.right]) {
        if (currExpr.type === "BinaryExpression") {
            const [deepLevel, deepHasUnaryExpression] = walkBinaryExpression(currExpr, currentLevel);
            if (deepLevel > currentLevel) {
                currentLevel = deepLevel;
            }
            if (!hasUnaryExpression && deepHasUnaryExpression) {
                hasUnaryExpression = true;
            }
        }
    }

    return [currentLevel, hasUnaryExpression];
}

function sum(arr = []) {
    return arr.length === 0 ? 0 : (arr.reduce((prev, curr) => prev + curr, 0) / arr.length);
}

function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

class ASTStats {
    #hasDictionaryString = false;
    #hasPrefixedIdentifiers = false;
    #varkinds = { var: 0, let: 0, const: 0 };
    #idtypes = { assignExpr: 0, property: 0, variableDeclarator: 0, functionDeclaration: 0 };
    #counter = {
        identifiers: 0,
        doubleUnaryArray: 0,
        computedMemberExpr: 0,
        memberExpr: 0,
        deepBinaryExpr: 0,
        encodedArrayValue: 0
    };
    #identifiers = [];

    constructor() {
        this.warnings = [];
        this.literalScores = [];
    }

    addWarning(symbol, value, location = helpers.rootLocation()) {
        const warningName = kWarningsNameStr[symbol];
        this.warnings.push(helpers.generateWarning(warningName, { value, location }));
    }

    isJJEncode(prefix) {
        if (this.#counter.variableDeclarator > 0 || this.#counter.functionDeclaration > 0) {
            return false;
        }

        for (const id of this.#identifiers) {
            const charsCode = [...new Set([...id])];
            if (charsCode.some((char) => !prefix.has(char))) {
                return false;
            }
        }

        return true;
    }

    isJSFuck() {
        const hasZeroAssign = this.#idtypes.assignExpr === 0
            && this.#idtypes.functionDeclaration === 0
            && this.#idtypes.property === 0
            && this.#idtypes.variableDeclarator === 0;

        return hasZeroAssign && this.#counter.doubleUnaryArray >= 5;
    }

    isObfuscatorIO() {
        if (this.#counter.memberExpr > 0) {
            return false;
        }

        const hasSomePatterns = this.#counter.doubleUnaryArray > 0
            || this.#counter.deepBinaryExpr > 0
            || this.#counter.encodedArrayValue > 0
            || this.#hasDictionaryString;

        return this.#hasPrefixedIdentifiers && hasSomePatterns;
    }

    analyzeIdentifierNames() {
        this.#counter.identifiers = this.#identifiers.length;

        const commonPrefix = helpers.commonPrefix(this.#identifiers);
        const prefix = new Set(Object.keys(commonPrefix));

        if (this.#counter.identifiers > 4 && prefix.size > 0) {
            const iterations = Object.values(commonPrefix).sort((left, right) => left - right);
            const pCount = iterations.length === 1 ? iterations.pop() : (iterations.pop() + iterations.pop());
            this.#hasPrefixedIdentifiers = ((pCount / this.#counter.identifiers) * 100) > 90;
        }

        if (prefix.size === 0 && this.isJSFuck()) {
            return [true, "jsfuck"];
        }
        if (prefix.size === 2 && this.isJJEncode(prefix)) {
            return [true, "jjencode"];
        }
        if (prefix.size === 1) {
            const [pValue, pCount] = Object.entries(commonPrefix).pop();
            if (pCount === this.#counter.identifiers) {
                const isFreeJSObfuscator = this.#identifiers
                    .every((value) => new RegExp(`^${escapeRegExp(pValue)}[a-zA-Z]{1,2}[0-9]{0,2}$`).test(value));

                if (isFreeJSObfuscator) {
                    return [true, "freejsobfuscator"];
                }
            }
        }
        if (this.isObfuscatorIO()) {
            return [true, "obfuscator.io"];
        }
        if ((this.#counter.identifiers > 15 && this.#hasPrefixedIdentifiers) || this.#counter.encodedArrayValue > 0) {
            return [true, null];
        }

        return [false, null];
    }

    analyzeVariableDeclaration(node) {
        this.#varkinds[node.kind]++;

        for (const variableDeclarator of node.declarations) {
            this.#idtypes.variableDeclarator++;
            this.#identifiers.push(...helpers.getIdName(variableDeclarator.id));
        }
    }

    analyzeFunctionDeclarator(node) {
        if (node.id === null || node.id.type !== "Identifier") {
            return;
        }
        this.#idtypes.functionDeclaration++;
        this.#identifiers.push(node.id.name);
    }

    analyzeProperty(property) {
        if (property.key.type !== "Identifier") {
            return;
        }

        this.#idtypes.property++;
        this.#identifiers.push(property.key.name);
    }

    analyzeLiteral(node) {
        const score = helpers.strSuspectScore(node.value);
        if (score !== 0) {
            this.literalScores.push(score);
        }

        if (!this.#hasDictionaryString) {
            const isDictionaryStr = kDictionaryStrParts.every((word) => node.value.includes(word));
            if (isDictionaryStr) {
                this.#hasDictionaryString = true;
            }
        }
    }

    analyzeArrayExpression(node) {
        for (const elem of node.elements) {
            if (elem.type !== "Literal") {
                continue;
            }
            const { value, raw } = elem;

            const hasHexadecimalSequence = /\\x[a-fA-F0-9]{2}/g.exec(raw) !== null;
            const hasUnicodeSequence = /\\u[a-fA-F0-9]{4}/g.exec(raw) !== null;
            const isBase64 = isStringBase64(value, { allowEmpty: false });

            if ((hasHexadecimalSequence || hasUnicodeSequence) && isBase64) {
                this.#counter.encodedArrayValue++;
            }
        }
    }

    doNodeAnalysis(node) {
        switch (node.type) {
            case "AssignmentExpression":
                this.#idtypes.assignExpr++;
                this.#identifiers.push(...helpers.getIdName(node.left));
                break;
            case "MemberExpression":
                this.#counter[node.computed ? "computedMemberExpr" : "memberExpr"]++;
                break;
            case "ArrayExpression":
                this.analyzeArrayExpression(node);
                break;
            case "FunctionDeclaration":
                this.analyzeFunctionDeclarator(node);
                break;
            case "ObjectExpression":
                node.properties.forEach((property) => this.analyzeProperty(property));
                break;
            case "UnaryExpression":
                if (node.argument.type === "UnaryExpression" && node.argument.argument.type === "ArrayExpression") {
                    this.#counter.doubleUnaryArray++;
                }
                break;
            case "BinaryExpression": {
                const [binaryExprDeepness, hasUnaryExpression] = walkBinaryExpression(node);
                if (binaryExprDeepness >= 3 && hasUnaryExpression) {
                    this.#counter.deepBinaryExpr++;
                }
                break;
            }
        }
    }

    getResult(isMinified) {
        const [isObfuscated, kind] = this.analyzeIdentifierNames();
        if (isObfuscated) {
            this.addWarning(kWarningsKinds.obfuscatedCode, kind || "unknown");
        }

        const identifiersLengthArr = this.#identifiers.map((value) => value.length);
        const [idsLengthAvg, stringScore] = [sum(identifiersLengthArr), sum(this.literalScores)];
        if (!isMinified && identifiersLengthArr.length > 5 && idsLengthAvg <= 1.5) {
            this.addWarning(kWarningsKinds.shortIdentifiers, idsLengthAvg);
        }
        if (stringScore >= 3) {
            this.addWarning(kWarningsKinds.suspiciousLiteral, stringScore);
        }

        return { idsLengthAvg, stringScore, warnings: this.warnings };
    }
}

ASTStats.Warnings = kWarningsKinds;

module.exports = ASTStats;
