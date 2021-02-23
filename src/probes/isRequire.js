/* eslint-disable consistent-return */
"use strict";

// Require Internal Dependencies
const helpers = require("../utils");
const { Warnings } = require("../ASTStats");

// Require Third-party Dependencies
const { Hex } = require("sec-literal");
const { walk } = require("estree-walker");

const breakOnMatch = true;

function validateNode(node, analysis) {
    return [
        isRequireIdentifiers(node, analysis) ||
        helpers.isRequireResolve(node) ||
        helpers.isRequireMemberExpr(node)
    ];
}

function main(node, options) {
    const { analysis } = options;
    const { dependencies, identifiers, stats } = analysis;

    const arg = node.arguments[0];

    // const foo = "http"; require(foo);
    if (arg.type === "Identifier") {
        if (identifiers.has(arg.name)) {
            dependencies.add(identifiers.get(arg.name), node.loc);
        }
        else {
            stats.addWarning(Warnings.unsafeImport, null, node.loc);
        }
    }
    // require("http")
    else if (arg.type === "Literal") {
        dependencies.add(arg.value, node.loc);
    }
    // require(["ht" + "tp"])
    else if (arg.type === "ArrayExpression") {
        const value = helpers.arrExprToString(arg.elements, identifiers).trim();
        if (value === "") {
            stats.addWarning(Warnings.unsafeImport, null, node.loc);
        }
        else {
            dependencies.add(value, node.loc);
        }
    }
    // require("ht" + "tp");
    else if (arg.type === "BinaryExpression" && arg.operator === "+") {
        const value = helpers.concatBinaryExpr(arg, identifiers);
        if (value === null) {
            stats.addWarning(Warnings.unsafeImport, null, node.loc);
        }
        else {
            dependencies.add(value, node.loc);
        }
    }
    // require(Buffer.from("...", "hex").toString());
    else if (arg.type === "CallExpression") {
        walkCallExpression(arg)
            .forEach((depName) => dependencies.add(depName, node.loc, true));

        stats.addWarning(Warnings.unsafeImport, null, node.loc);

        // We skip walking the tree to avoid anymore warnings...
        return Symbol.for("skipWalk");
    }
    else {
        stats.addWarning(Warnings.unsafeImport, null, node.loc);
    }
}

function isRequireIdentifiers(node, analysis) {
    if (node.type !== "CallExpression") {
        return false;
    }
    const fullName = node.callee.type === "MemberExpression" ? helpers.getMemberExprName(node.callee) : node.callee.name;

    return analysis.requireIdentifiers.has(fullName);
}

function walkCallExpression(nodeToWalk) {
    const dependencies = new Set();

    walk(nodeToWalk, {
        enter(node) {
            if (node.type !== "CallExpression") {
                return;
            }
            if (node.arguments.length === 0) {
                return;
            }

            if (node.arguments[0].type === "Literal" && Hex.isHex(node.arguments[0].value)) {
                dependencies.add(Buffer.from(node.arguments[0].value, "hex").toString());
                this.skip();

                return;
            }

            const fullName = node.callee.type === "MemberExpression" ? helpers.getMemberExprName(node.callee) : node.callee.name;
            switch (fullName) {
                case "Buffer.from": {
                    const [element, convert] = node.arguments;

                    if (element.type === "ArrayExpression") {
                        const depName = helpers.arrExprToString(element);
                        if (depName.trim() !== "") {
                            dependencies.add(depName);
                        }
                    }
                    else if (element.type === "Literal" && convert.type === "Literal" && convert.value === "hex") {
                        const value = Buffer.from(element.value, "hex").toString();
                        dependencies.add(value);
                    }
                    break;
                }
            }
        }
    });

    return [...dependencies];
}

module.exports = { validateNode, main, breakOnMatch };
