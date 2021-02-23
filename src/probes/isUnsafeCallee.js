"use strict";

// Require Internal Dependencies
const helpers = require("../utils");
const { Warnings } = require("../ASTStats");

const breakOnMatch = false;

// Detect unsafe statement like eval("this") or Function("return this")();
function validateNode(node) {
    return helpers.isUnsafeCallee(node);
}

function main(node, options) {
    const { analysis, data: calleeName } = options;

    analysis.stats.addWarning(Warnings.unsafeStmt, calleeName, node.loc);
}

module.exports = { validateNode, main, breakOnMatch };
