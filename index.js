"use strict";

// Require Third-party Dependencies
const { walk } = require("estree-walker");
const meriyah = require("meriyah");
const safeRegex = require("safe-regex");
const builtins = require("builtins");

// Require Internal Dependencies
const helpers = require("./src/utils");
const ASTDeps = require("./src/ASTDeps");

// CONSTANTS
const kMainModuleStr = "process.mainModule.";
const kNodeDeps = new Set(builtins());

function generateWarning(kind = "unsafe-import", options) {
    const { location, file = null, value = null } = options;
    const { start, end = start } = location;

    const result = { kind, file, start, end };
    if (value !== null) {
        result.value = value;
    }

    return result;
}

function walkCallExpression(nodeToWalk) {
    const dependencies = new Set();

    walk(nodeToWalk, {
        enter(node) {
            if (node.type !== "CallExpression") {
                return;
            }

            switch (helpers.getMemberExprName(node.callee)) {
                case "Buffer.from": {
                    const [element, convert] = node.arguments;

                    if (element.type === "ArrayExpression") {
                        const depName = helpers.arrExprToString(node.arguments[0]);
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

function searchRuntimeDependencies(str, options = Object.create(null)) {
    const { module = false } = options;

    // Function variables
    const identifiers = new Map();
    const identifiersLength = new Set();
    const dependencies = new ASTDeps();
    const warnings = [];

    // Note: if the file start with a shebang then we remove it because 'parseScript' may fail to parse it.
    // Example: #!/usr/bin/env node
    const strToAnalyze = str.charAt(0) === "#" ? str.slice(str.indexOf("\n")) : str;
    const { body } = meriyah.parseScript(strToAnalyze, {
        next: true, loc: true, module: Boolean(module)
    });

    // we walk each AST Nodes, this is a purely synchronous I/O
    walk(body, {
        enter(node) {
            // Check all literal values
            if (node.type === "Literal") {
                if (/^[0-9A-Fa-f]{4,}$/g.test(node.value) && typeof node.value === "string") {
                    const value = Buffer.from(node.value, "hex").toString();
                    if (kNodeDeps.has(value)) {
                        dependencies.add(value, node.loc);
                        warnings.push(generateWarning("unsafe-import", { location: node.loc }));
                    }
                    else {
                        warnings.push(generateWarning("hexa-value", { location: node.loc, value }));
                    }
                }
            }

            // Detect TryStatement and CatchClause to known which dependency is required in a Try {} clause
            if (node.type === "TryStatement") {
                dependencies.isInTryStmt = true;
            }
            else if (node.type === "CatchClause") {
                dependencies.isInTryStmt = false;
            }

            // Search for literal Regex (or Regex Object constructor).
            // then we use the safe-regex package to detect whether or not regex is safe!
            if (helpers.isLiteralRegex(node) && !safeRegex(node.regex.pattern)) {
                warnings.push(generateWarning("unsafe-regex", { location: node.loc, value: node.regex.pattern }));
            }
            else if (helpers.isRegexConstructor(node)) {
                const arg = node.arguments[0];
                const pattern = helpers.isLiteralRegex(arg) ? arg.regex.pattern : arg.value;

                if (!safeRegex(pattern)) {
                    warnings.push(generateWarning("unsafe-regex", { location: node.loc, value: pattern }));
                }
            }

            // In case we are matching a Variable, save it in identifiers
            // This allow the AST Analysis to retrieve required dependency when the stmt is mixed with variables.
            if (helpers.isVariableDeclarator(node)) {
                if (node.init.type === "Literal") {
                    identifiersLength.add(node.id.name.length);
                    identifiers.set(node.id.name, node.init.value);
                }
                else if (node.init.type === "Identifier" && (node.init.name === "require" || node.init.name === "process")) {
                    warnings.push(generateWarning("unsafe-assign", { location: node.loc, value: node.init.name }));
                }
                else if (node.init.type === "MemberExpression") {
                    const [value] = helpers.getMemberExprName(node.init).split(".", 1);
                    if (value === "require" || value === "process") {
                        warnings.push(generateWarning("unsafe-assign", { location: node.loc, value }));
                    }
                }
            }

            // Add the identifier length of functions!
            else if (helpers.isFunctionDeclarator(node)) {
                identifiersLength.add(node.id.name.length);
            }

            if (!module && (helpers.isRequireStatment(node) || helpers.isRequireResolve(node))) {
                const arg = node.arguments[0];
                if (arg.type === "Identifier") {
                    if (identifiers.has(arg.name)) {
                        dependencies.add(identifiers.get(arg.name), node.loc);
                    }
                    else {
                        warnings.push(generateWarning("unsafe-import", { location: node.loc }));
                    }
                }
                else if (arg.type === "Literal") {
                    dependencies.add(arg.value, node.loc);
                }
                else if (arg.type === "ArrayExpression") {
                    const value = helpers.arrExprToString(arg.elements, identifiers);
                    if (value.trim() === "") {
                        warnings.push(generateWarning("unsafe-import", { location: node.loc }));
                    }
                    else {
                        dependencies.add(value, node.loc);
                    }
                }
                else if (arg.type === "BinaryExpression" && arg.operator === "+") {
                    const value = helpers.concatBinaryExpr(arg, identifiers);
                    if (value === null) {
                        warnings.push(generateWarning("unsafe-import", { location: node.loc }));
                    }
                    else {
                        dependencies.add(value, node.loc);
                    }
                }
                else if (arg.type === "CallExpression") {
                    walkCallExpression(arg.callee)
                        .forEach((depName) => dependencies.add(depName, node.loc));

                    warnings.push(generateWarning("unsafe-import", { location: node.loc }));
                    this.skip();
                }
                else {
                    warnings.push(generateWarning("unsafe-import", { location: node.loc }));
                }
            }
            // if we are dealing with an ESM import declaration (easier than require ^^)
            else if (module && node.type === "ImportDeclaration" && node.source.type === "Literal") {
                dependencies.add(node.source.value, node.loc);
            }
            // searching for "process.mainModule" pattern (kMainModuleStr)
            else if (node.type === "MemberExpression") {
                // retrieve the member name, like: foo.bar.hello
                // in our case we are searching for process.mainModule.*
                const memberName = helpers.getMemberExprName(node);

                if (memberName.startsWith(kMainModuleStr)) {
                    dependencies.add(memberName.slice(kMainModuleStr.length), node.loc);
                }
            }
        }
    });

    const idsLengthAvg = ([...identifiersLength].reduce((prev, curr) => prev + curr, 0) / identifiersLength.size);
    if (idsLengthAvg <= 1) {
        warnings.push(generateWarning("short-ids", { value: idsLengthAvg, location: { start: { line: 0, column: 0 } } }));
    }

    return {
        dependencies,
        warnings,
        idsLengthAvg,
        isOneLineRequire: !module && body.length === 1 && dependencies.size === 1
    };
}

module.exports = {
    searchRuntimeDependencies,
    generateWarning
};
