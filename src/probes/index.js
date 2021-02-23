"use strict";

// Require all the probes
const isUnsafeCallee = require("./isUnsafeCallee");
const isLiteral = require("./isLiteral");
const isLiteralRegex = require("./isLiteralRegex");
const isRegexObject = require("./isRegexObject");
const isVariableDeclaration = require("./isVariableDeclaration");
const isAssignmentExprOrMemberExpr = require("./isAssignmentExprOrMemberExpr");
const isRequire = require("./isRequire");
const isImportDeclaration = require("./isImportDeclaration");
const isMemberExpression = require("./isMemberExpression");

// CONSTANTS
const kListOfProbes = [
    isUnsafeCallee,
    isLiteral,
    isLiteralRegex,
    isRegexObject,
    isVariableDeclaration,
    isAssignmentExprOrMemberExpr,
    isRequire,
    isImportDeclaration,
    isMemberExpression
];

const kSymBreak = Symbol.for("breakWalk");
const kSymSkip = Symbol.for("skipWalk");

function runOnProbes(node, analysis) {
    for (const probe of kListOfProbes) {
        const [isMatching, data = null] = probe.validateNode(node, analysis);

        if (isMatching) {
            const result = probe.main(node, { analysis, data });

            if (result === kSymSkip) {
                return "skip";
            }
            if (result === kSymBreak || probe.breakOnMatch) {
                break;
            }
        }
    }

    return null;
}

module.exports = {
    runOnProbes
};
