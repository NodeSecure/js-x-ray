"use strict";

function validateNode(node) {
    return [
        node.type === "ObjectExpression"
    ];
}

function main(node, options) {
    const { analysis } = options;

    for (const property of node.properties) {
        if (property.type !== "Property" || property.key.type !== "Identifier") {
            continue;
        }

        analysis.idtypes.property++;
        analysis.identifiersName.push({ name: property.key.name, type: "property" });
    }
}

module.exports = {
    validateNode, main, breakOnMatch: false
};
