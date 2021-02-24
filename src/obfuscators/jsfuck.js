"use strict";

// CONSTANTS
const kJSFuckMinimumDoubleUnaryExpr = 5;

function verify(analysis) {
    const hasZeroAssign = analysis.idtypes.assignExpr === 0
        && analysis.idtypes.functionDeclaration === 0
        && analysis.idtypes.property === 0
        && analysis.idtypes.variableDeclarator === 0;

    return hasZeroAssign && analysis.counter.doubleUnaryArray >= kJSFuckMinimumDoubleUnaryExpr;
}

module.exports = {
    verify
};
