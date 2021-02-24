/* eslint-disable consistent-return */
"use strict";

// Require Internal Dependencies
const helpers = require("../utils");
const { Warnings } = require("../ASTStats");

// Require Third-party Dependencies
const { Hex } = require("sec-literal");
const { walk } = require("estree-walker");

function validateNode(node, analysis) {
    return [
        isRequireIdentifiers(node, analysis) ||
        isRequireResolve(node) ||
        isRequireMemberExpr(node)
    ];
}

function isRequireResolve(node) {
    if (node.type !== "CallExpression" || node.callee.type !== "MemberExpression") {
        return false;
    }

    return node.callee.object.name === "require" && node.callee.property.name === "resolve";
}

function isRequireMemberExpr(node) {
    if (node.type !== "CallExpression" || node.callee.type !== "MemberExpression") {
        return false;
    }

    return helpers.isRequireGlobalMemberExpr(helpers.getMemberExprName(node.callee));
}

function isRequireIdentifiers(node, analysis) {
    if (node.type !== "CallExpression") {
        return false;
    }
    const fullName = node.callee.type === "MemberExpression" ? helpers.getMemberExprName(node.callee) : node.callee.name;

    return analysis.requireIdentifiers.has(fullName);
}

function main(node, options) {
    const { analysis } = options;
    const { dependencies, identifiers, stats } = analysis;

    const arg = node.arguments[0];
    switch (arg.type) {
        // const foo = "http"; require(foo);
        case "Identifier":
            if (identifiers.has(arg.name)) {
                dependencies.add(identifiers.get(arg.name), node.loc);
            }
            else {
                stats.addWarning(Warnings.unsafeImport, null, node.loc);
            }
            break;

        // require("http")
        case "Literal":
            dependencies.add(arg.value, node.loc);
            break;

        // require(["ht" + "tp"])
        case "ArrayExpression": {
            const value = helpers.arrExprToString(arg.elements, identifiers).trim();
            if (value === "") {
                stats.addWarning(Warnings.unsafeImport, null, node.loc);
            }
            else {
                dependencies.add(value, node.loc);
            }
            break;
        }

        // require("ht" + "tp");
        case "BinaryExpression": {
            if (arg.operator !== "+") {
                break;
            }

            const value = helpers.concatBinaryExpr(arg, identifiers);
            if (value === null) {
                stats.addWarning(Warnings.unsafeImport, null, node.loc);
            }
            else {
                dependencies.add(value, node.loc);
            }
            break;
        }

        // require(Buffer.from("...", "hex").toString());
        case "CallExpression": {
            parseRequireCallExpression(arg)
                .forEach((depName) => dependencies.add(depName, node.loc, true));

            stats.addWarning(Warnings.unsafeImport, null, node.loc);

            // We skip walking the tree to avoid anymore warnings...
            return Symbol.for("skipWalk");
        }

        default:
            stats.addWarning(Warnings.unsafeImport, null, node.loc);
    }
}

function parseRequireCallExpression(nodeToWalk) {
    const dependencies = new Set();

    walk(nodeToWalk, {
        enter(node) {
            if (node.type !== "CallExpression" || node.arguments.length === 0) {
                return;
            }

            if (node.arguments[0].type === "Literal" && Hex.isHex(node.arguments[0].value)) {
                dependencies.add(Buffer.from(node.arguments[0].value, "hex").toString());

                return this.skip();
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

module.exports = {
    validateNode, main, breakOnMatch: true, breakGroup: "import"
};
