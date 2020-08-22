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
const kJSFuckMinimumDoubleUnaryExpr = 5;
const kMinimumIdsCount = 5;
const kJJRegularSymbols = new Set(["$", "_"]);

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
        this.handledEncodedLiteralValues = new Map();
        this.literalScores = [];
    }

    addWarning(symbol, value, location = helpers.rootLocation()) {
        if (symbol === kWarningsKinds.encodedLiteral && this.handledEncodedLiteralValues.has(value)) {
            const index = this.handledEncodedLiteralValues.get(value);
            this.warnings[index].location.push(helpers.toArrayLocation(location));

            return;
        }
        const warningName = kWarningsNameStr[symbol];
        this.warnings.push(helpers.generateWarning(warningName, { value, location }));
        if (symbol === kWarningsKinds.encodedLiteral) {
            this.handledEncodedLiteralValues.set(value, this.warnings.length - 1);
        }
    }

    isJJEncode() {
        if (this.#counter.variableDeclarator > 0 || this.#counter.functionDeclaration > 0) {
            return false;
        }
        if (this.#idtypes.assignExpr > this.#idtypes.property) {
            return false;
        }

        const matchCount = this.#identifiers.filter(({ name }) => {
            if (!helpers.notNullOrUndefined(name)) {
                return false;
            }
            const charsCode = [...new Set([...name])];

            return charsCode.every((char) => kJJRegularSymbols.has(char));
        }).length;
        const pourcent = ((matchCount / this.#identifiers.length) * 100);

        return pourcent > 80;
    }

    isJSFuck() {
        const hasZeroAssign = this.#idtypes.assignExpr === 0
            && this.#idtypes.functionDeclaration === 0
            && this.#idtypes.property === 0
            && this.#idtypes.variableDeclarator === 0;

        return hasZeroAssign && this.#counter.doubleUnaryArray >= kJSFuckMinimumDoubleUnaryExpr;
    }

    isFreeJSObfuscator(prefix) {
        const pValue = Object.keys(prefix).pop();
        const regexStr = `^${escapeRegExp(pValue)}[a-zA-Z]{1,2}[0-9]{0,2}$`;

        return this.#identifiers.every(({ name }) => new RegExp(regexStr).test(name));
    }

    isObfuscatorIO() {
        if (this.#counter.memberExpr > 0) {
            return false;
        }

        const hasSomePatterns = this.#counter.doubleUnaryArray > 0
            || this.#counter.deepBinaryExpr > 0
            || this.#counter.encodedArrayValue > 0
            || this.#hasDictionaryString;

        // TODO: hasPrefixedIdentifiers only work for hexadecimal id names generator
        return this.#hasPrefixedIdentifiers && hasSomePatterns;
    }

    calcAvgPrefixedIdentifiers(prefix) {
        const valuesArr = Object.values(prefix).slice().sort((left, right) => left - right);
        if (valuesArr.length === 0) {
            return 0;
        }
        const nbOfPrefixedIds = valuesArr.length === 1 ? valuesArr.pop() : (valuesArr.pop() + valuesArr.pop());
        const maxIds = this.#counter.identifiers - this.#idtypes.property;

        return ((nbOfPrefixedIds / maxIds) * 100);
    }

    analyzeIdentifierNames() {
        this.#counter.identifiers = this.#identifiers.length;
        let encoderName = null;

        if (this.isJSFuck()) {
            encoderName = "jsfuck";
        }
        else if (this.isJJEncode()) {
            encoderName = "jjencode";
        }
        else {
            const prefix = helpers.commonPrefix(this.#identifiers.map((value) => value.name), "low");
            const uPrefixNames = new Set(Object.keys(prefix));

            if (this.#counter.identifiers > kMinimumIdsCount && uPrefixNames.size > 0) {
                this.#hasPrefixedIdentifiers = this.calcAvgPrefixedIdentifiers(prefix) > 80;
            }

            if (uPrefixNames.size === 1 && this.isFreeJSObfuscator(prefix)) {
                encoderName = "freejsobfuscator";
            }
            else if (this.isObfuscatorIO()) {
                encoderName = "obfuscator.io";
            }
            else if ((this.#counter.identifiers > (kMinimumIdsCount * 3) && this.#hasPrefixedIdentifiers)
                && this.#counter.encodedArrayValue > 0) {
                encoderName = "unknown";
            }
        }

        return [encoderName !== null, encoderName];
    }

    analyzeVariableDeclaration(node) {
        this.#varkinds[node.kind]++;

        for (const variableDeclarator of node.declarations) {
            this.#idtypes.variableDeclarator++;

            for (const name of helpers.getIdName(variableDeclarator.id)) {
                this.#identifiers.push({ name, type: "variableDeclarator" });
            }
        }
    }

    analyzeFunctionDeclarator(node) {
        if (node.id === null || node.id.type !== "Identifier") {
            return;
        }
        this.#idtypes.functionDeclaration++;
        this.#identifiers.push({ name: node.id.name, type: "functionDeclaration" });
    }

    analyzeProperty(property) {
        // TODO: handle SpreadElement
        if (property.type !== "Property" || property.key.type !== "Identifier") {
            return;
        }

        this.#idtypes.property++;
        this.#identifiers.push({ name: property.key.name, type: "property" });
    }

    analyzeLiteral(node, inArrayExpr = false) {
        if (typeof node.value !== "string") {
            return;
        }

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

        const hasHexadecimalSequence = /\\x[a-fA-F0-9]{2}/g.exec(node.raw) !== null;
        const hasUnicodeSequence = /\\u[a-fA-F0-9]{4}/g.exec(node.raw) !== null;
        const isBase64 = isStringBase64(node.value, { allowEmpty: false });

        if ((hasHexadecimalSequence || hasUnicodeSequence) && isBase64) {
            if (inArrayExpr) {
                this.#counter.encodedArrayValue++;
            }
            else {
                this.addWarning(kWarningsKinds.encodedLiteral, node.value, node.loc);
            }
        }
    }

    analyzeArrayExpression(node) {
        for (const elem of node.elements) {
            if (elem !== null && elem.type === "Literal") {
                this.analyzeLiteral(elem, true);
            }
        }
    }

    doNodeAnalysis(node) {
        switch (node.type) {
            case "AssignmentExpression": {
                this.#idtypes.assignExpr++;
                for (const name of helpers.getIdName(node.left)) {
                    this.#identifiers.push({ name, type: "assignExpr" });
                }
                break;
            }
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

        const identifiersLengthArr = this.#identifiers
            .filter((value) => value.type !== "property").map((value) => value.name.length);

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
