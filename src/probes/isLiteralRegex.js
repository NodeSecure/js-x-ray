"use strict";

// Require Internal Dependencies
const helpers = require("../utils");
const { Warnings } = require("../ASTStats");

// Require Third-party Dependencies
const safeRegex = require("safe-regex");

const breakOnMatch = false;

// Search for Literal Regex.
// then we use the safe-regex package to detect whether or not regex is safe!
function validateNode(node) {
    return [helpers.isLiteralRegex(node)];
}

function main(node, options) {
    const { analysis } = options;

    if (!safeRegex(node.regex.pattern)) {
        analysis.stats.addWarning(Warnings.unsafeRegex, node.regex.pattern, node.loc);
    }
}

module.exports = { validateNode, main, breakOnMatch };
