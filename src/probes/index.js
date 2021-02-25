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
const isArrayExpression = require("./isArrayExpression");
const isFunctionDeclaration = require("./isFunctionDeclaration");
const isAssignmentExpression = require("./isAssignmentExpression");
const isObjectExpression = require("./isObjectExpression");
const isUnaryExpression = require("./isUnaryExpression");

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
    isMemberExpression,
    isAssignmentExpression,
    isObjectExpression,
    isArrayExpression,
    isFunctionDeclaration,
    isUnaryExpression
];

const kSymBreak = Symbol.for("breakWalk");
const kSymSkip = Symbol.for("skipWalk");

function runOnProbes(node, analysis) {
    const breakedGroups = new Set();

    for (const probe of kListOfProbes) {
        if (breakedGroups.has(probe.breakGroup)) {
            continue;
        }

        const [isMatching, data = null] = probe.validateNode(node, analysis);
        if (isMatching) {
            const result = probe.main(node, { analysis, data });

            if (result === kSymSkip) {
                return "skip";
            }
            if (result === kSymBreak || probe.breakOnMatch) {
                const breakGroup = probe.breakGroup || null;
                if (breakGroup === null) {
                    break;
                }
                else {
                    breakedGroups.add(breakGroup);
                }
            }
        }
    }

    return null;
}

module.exports = {
    runOnProbes
};
