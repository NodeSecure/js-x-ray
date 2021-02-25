"use strict";

// Require Internal Dependencies
const { getIdName } = require("../utils");

function validateNode(node) {
    return [
        node.type === "AssignmentExpression"
    ];
}

function main(node, options) {
    const { analysis } = options;

    analysis.idtypes.assignExpr++;
    for (const name of getIdName(node.left)) {
        analysis.identifiersName.push({ name, type: "assignExpr" });
    }
}

module.exports = {
    validateNode, main, breakOnMatch: false
};
