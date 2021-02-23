"use strict";

// Require Internal Dependencies
const helpers = require("../utils");
const constants = require("../constants");
const { Warnings } = require("../ASTStats");

// CONSTANTS
const kUnsafeCallee = new Set(["eval", "Function"]);

const breakOnMatch = false;

// In case we are matching a Variable declaration, we have to save the identifier
// This allow the AST Analysis to retrieve required dependency when the stmt is mixed with variables.
function validateNode(node) {
    return [node.type === "VariableDeclaration"];
}

function main(node, options) {
    const { analysis } = options;

    analysis.stats.analyzeVariableDeclaration(node);
    node.declarations.forEach((variable) => checkVariableAssignment(analysis, variable));
}

function checkVariableAssignment(analysis, node) {
    if (node.init === null || node.id.type !== "Identifier") {
        return;
    }

    if (node.init.type === "Literal") {
        analysis.identifiers.set(node.id.name, String(node.init.value));
    }

    // Searching for someone who assign require to a variable, ex:
    // const r = require
    else if (node.init.type === "Identifier") {
        if (kUnsafeCallee.has(node.init.name)) {
            analysis.stats.addWarning(Warnings.unsafeAssign, node.init.name, node.loc);
        }
        else if (analysis.requireIdentifiers.has(node.init.name)) {
            analysis.requireIdentifiers.add(node.id.name);
            analysis.stats.addWarning(Warnings.unsafeAssign, node.init.name, node.loc);
        }
        else if (constants.globalParts.has(node.init.name)) {
            analysis.globalParts.set(node.id.name, node.init.name);
            helpers.getRequirablePatterns(analysis.globalParts)
                .forEach((name) => analysis.requireIdentifiers.add(name));
        }
    }

    // Same as before but for pattern like process.mainModule and require.resolve
    else if (node.init.type === "MemberExpression") {
        const value = helpers.getMemberExprName(node.init);
        const members = value.split(".");

        if (analysis.globalParts.has(members[0]) || members.every((part) => constants.globalParts.has(part))) {
            analysis.globalParts.set(node.id.name, members.slice(1).join("."));
            analysis.stats.addWarning(Warnings.unsafeAssign, value, node.loc);
        }
        helpers.getRequirablePatterns(analysis.globalParts)
            .forEach((name) => analysis.requireIdentifiers.add(name));

        if (helpers.isRequireStatement(value)) {
            analysis.requireIdentifiers.add(node.id.name);
            analysis.stats.addWarning(Warnings.unsafeAssign, value, node.loc);
        }
    }
    else if (helpers.isUnsafeCallee(node.init)[0]) {
        analysis.globalParts.set(node.id.name, "global");
        constants.globalParts.add(node.id.name);
        analysis.requireIdentifiers.add(`${node.id.name}.${constants.processMainModuleRequire}`);
    }
}

module.exports = { validateNode, main, breakOnMatch };
