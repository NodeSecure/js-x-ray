"use strict";

function validateNode(node) {
    return [
        node.type === "UnaryExpression"
    ];
}

function main(node, options) {
    const { analysis } = options;

    if (node.argument.type === "UnaryExpression" && node.argument.argument.type === "ArrayExpression") {
        analysis.counter.doubleUnaryArray++;
    }
}

module.exports = {
    validateNode, main, breakOnMatch: false
};
