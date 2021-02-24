"use strict";

// Require Internal Dependencies
const helpers = require("../utils");

// CONSTANTS
const kJJRegularSymbols = new Set(["$", "_"]);

function verify(analysis) {
    if (analysis.counter.variableDeclarator > 0 || analysis.counter.functionDeclaration > 0) {
        return false;
    }
    if (analysis.idtypes.assignExpr > analysis.idtypes.property) {
        return false;
    }

    const matchCount = analysis.identifiersName.filter(({ name }) => {
        if (!helpers.notNullOrUndefined(name)) {
            return false;
        }
        const charsCode = [...new Set([...name])];

        return charsCode.every((char) => kJJRegularSymbols.has(char));
    }).length;
    const pourcent = ((matchCount / analysis.identifiersName.length) * 100);

    return pourcent > 80;
}

module.exports = { verify };
