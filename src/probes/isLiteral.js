"use strict";

// Require Node.js Dependencies
const repl = require("repl");

// Require Third-party Dependencies
const { Hex } = require("sec-literal");

// Require Internal Dependencies
const { globalParts, warnings } = require("../constants");

// CONSTANTS
const kNodeDeps = new Set(repl.builtinModules);

// Check all 'string' Literal values
function validateNode(node) {
    return [
        node.type === "Literal" && typeof node.value === "string"
    ];
}

function main(node, options) {
    const { analysis } = options;

    // We are searching for value obfuscated as hex of a minimum lenght of 4.
    if (/^[0-9A-Fa-f]{4,}$/g.test(node.value)) {
        const value = Buffer.from(node.value, "hex").toString();

        // If the value we are retrieving is the name of a Node.js dependency,
        // then we add it to the dependencies list and we throw an unsafe-import at the current location.
        if (kNodeDeps.has(value)) {
            analysis.dependencies.add(value, node.loc);
            analysis.addWarning(warnings.unsafeImport, null, node.loc);
        }
        else if (globalParts.has(value) || !Hex.isSafe(node.value)) {
            analysis.addWarning(warnings.encodedLiteral, node.value, node.loc);
        }
    }
    // Else we are checking all other string with our suspect method
    else {
        analysis.analyzeLiteral(node);
    }
}

module.exports = {
    validateNode, main, breakOnMatch: false
};
