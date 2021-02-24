"use strict";

// Require Internal Dependencies
const helpers = require("../utils");
const { warnings } = require("../constants");

// Require Third-party Dependencies
const safeRegex = require("safe-regex");

// Search for Literal Regex.
// then we use the safe-regex package to detect whether or not regex is safe!
function validateNode(node) {
    return [
        helpers.isLiteralRegex(node)
    ];
}

function main(node, options) {
    const { analysis } = options;

    if (!safeRegex(node.regex.pattern)) {
        analysis.addWarning(warnings.unsafeRegex, node.regex.pattern, node.loc);
    }
}

module.exports = {
    validateNode, main, breakOnMatch: false
};
