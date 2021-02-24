"use strict";

// Require Internal Dependencies
const { warnings } = require("../constants");

// Looking for ESM ImportDeclaration
// see: https://github.com/estree/estree/blob/master/es2015.md#importdeclaration
function validateNode(node) {
    return [
        node.type === "ImportDeclaration" && node.source.type === "Literal"
    ];
}

function main(node, options) {
    const { analysis } = options;

    // Searching for dangerous import "data:text/javascript;..." statement.
    // see: https://2ality.com/2019/10/eval-via-import.html
    if (node.source.value.startsWith("data:text/javascript")) {
        analysis.addWarning(warnings.unsafeImport, node.source.value, node.loc);
    }
    analysis.dependencies.add(node.source.value, node.loc);
}

module.exports = {
    validateNode, main, breakOnMatch: true, breakGroup: "import"
};
