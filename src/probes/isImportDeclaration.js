"use strict";

// Require Internal Dependencies
const { Warnings } = require("../ASTStats");

const breakOnMatch = true;

// // if we are dealing with an ESM import declaration (easier than require ^^)
function validateNode(node) {
    return [node.type === "ImportDeclaration" && node.source.type === "Literal"];
}

function main(node, options) {
    const { analysis } = options;

    if (node.source.value.startsWith("data:text/javascript;base64")) {
        analysis.stats.addWarning(Warnings.unsafeImport, node.source.value, node.loc);
    }
    analysis.dependencies.add(node.source.value, node.loc);
}

module.exports = { validateNode, main, breakOnMatch };
