"use strict";

function validateNode(node) {
    return [
        node.type === "BinaryExpression"
    ];
}

function main(node, options) {
    const { analysis } = options;

    const [binaryExprDeepness, hasUnaryExpression] = walkBinaryExpression(node);
    if (binaryExprDeepness >= 3 && hasUnaryExpression) {
        analysis.counter.deepBinaryExpr++;
    }
}

function walkBinaryExpression(expr, level = 1) {
    const [lt, rt] = [expr.left.type, expr.right.type];
    let hasUnaryExpression = lt === "UnaryExpression" || rt === "UnaryExpression";
    let currentLevel = lt === "BinaryExpression" || rt === "BinaryExpression" ? level + 1 : level;

    for (const currExpr of [expr.left, expr.right]) {
        if (currExpr.type === "BinaryExpression") {
            const [deepLevel, deepHasUnaryExpression] = walkBinaryExpression(currExpr, currentLevel);
            if (deepLevel > currentLevel) {
                currentLevel = deepLevel;
            }
            if (!hasUnaryExpression && deepHasUnaryExpression) {
                hasUnaryExpression = true;
            }
        }
    }

    return [currentLevel, hasUnaryExpression];
}

module.exports = {
    validateNode, main, breakOnMatch: false
};
