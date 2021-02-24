"use strict";

// Require Internal Dependencies
const helpers = require("../utils");
const { warnings } = require("../constants");

// Require Third-party Dependencies
const safeRegex = require("safe-regex");

// Search for Regex Object constructor.
// then we use the safe-regex package to detect whether or not regex is safe!
function validateNode(node) {
    return [
        isRegexConstructor(node) && node.arguments.length > 0
    ];
}

function main(node, options) {
    const { analysis } = options;

    const arg = node.arguments[0];
    const pattern = helpers.isLiteralRegex(arg) ? arg.regex.pattern : arg.value;

    if (!safeRegex(pattern)) {
        analysis.addWarning(warnings.unsafeRegex, pattern, node.loc);
    }
}

function isRegexConstructor(node) {
    if (node.type !== "NewExpression" || node.callee.type !== "Identifier") {
        return false;
    }

    return node.callee.name === "RegExp";
}

module.exports = {
    validateNode, main, breakOnMatch: false
};
