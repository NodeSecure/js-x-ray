"use strict";

// Search for Array
function validateNode(node) {
    return [
        node.type === "ArrayExpression"
    ];
}

function main(node, options) {
    const { analysis } = options;

    for (const elem of node.elements) {
        if (elem !== null && elem.type === "Literal") {
            analysis.analyzeLiteral(elem, true);
        }
    }
}

module.exports = {
    name: "isArrayExpression",
    validateNode, main, breakOnMatch: false
};
