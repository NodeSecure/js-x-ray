"use strict";

// Require Internal Dependencies
const helpers = require("../utils");
const { warnings } = require("../constants");

// Detect unsafe statement like eval("this") or Function("return this")();
function validateNode(node) {
    return helpers.isUnsafeCallee(node);
}

function main(node, options) {
    const { analysis, data: calleeName } = options;

    analysis.addWarning(warnings.unsafeStmt, calleeName, node.loc);
}

module.exports = {
    name: "isUnsafeCallee",
    validateNode, main, breakOnMatch: false
};
