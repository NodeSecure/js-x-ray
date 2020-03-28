"use strict";

// Require Third-party Dependencies
const { walk } = require("estree-walker");
const meriyah = require("meriyah");
const safeRegex = require("safe-regex");

// Require Internal Dependencies
const helpers = require("./src/utils");
const ASTDeps = require("./src/ASTDeps");

// CONSTANTS
const kMainModuleStr = "process.mainModule.";

function generateWarning(kind = "unsafe-import", options) {
    const { location, file = null, value = null } = options;
    const { start, end = start } = location;

    const result = { kind, file, start, end };
    if (value !== null) {
        result.value = value;
    }

    return result;
}

function searchRuntimeDependencies(str, options = Object.create(null)) {
    const { module = false } = options;

    // Function variables
    const identifiers = new Map();
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
                identifiers.set(node.id.name, node.init.value);
            }

            if (!module && (helpers.isRequireStatment(node) || helpers.isRequireResolve(node))) {
                const arg = node.arguments[0];
                if (arg.type === "Identifier") {
                    if (identifiers.has(arg.name)) {
                        dependencies.add(identifiers.get(arg.name), { location: node.loc });
                    }
                    else {
                        warnings.push(generateWarning("unsafe-import", { location: node.loc }));
                    }
                }
                else if (arg.type === "Literal") {
                    dependencies.add(arg.value, { location: node.loc });
                }
                else if (arg.type === "ArrayExpression") {
                    const value = helpers.arrExprToString(arg.elements, identifiers);
                    if (value.trim() === "") {
                        warnings.push(generateWarning("unsafe-import", { location: node.loc }));
                    }
                    else {
                        dependencies.add(value, { location: node.loc });
                    }
                }
                else if (arg.type === "BinaryExpression" && arg.operator === "+") {
                    const value = helpers.concatBinaryExpr(arg, identifiers);
                    if (value === null) {
                        warnings.push(generateWarning("unsafe-import", { location: node.loc }));
                    }
                    else {
                        dependencies.add(value, { location: node.loc });
                    }
                }
                else {
                    warnings.push(generateWarning("unsafe-import", { location: node.loc }));
                }
            }
            // if we are dealing with an ESM import declaration (easier than require ^^)
            else if (module && node.type === "ImportDeclaration" && node.source.type === "Literal") {
                dependencies.add(node.source.value, { location: node.loc });
            }
            // searching for "process.mainModule" pattern (kMainModuleStr)
            else if (node.type === "MemberExpression") {
                // retrieve the member name, like: foo.bar.hello
                // in our case we are searching for process.mainModule.*
                const memberName = helpers.getMemberExprName(node);

                if (memberName.startsWith(kMainModuleStr)) {
                    dependencies.add(memberName.slice(kMainModuleStr.length), { location: node.loc });
                }
            }
        }
    });

    return {
        dependencies,
        warnings,
        isOneLineRequire: !module && body.length === 1 && dependencies.size === 1
    };
}

module.exports = {
    searchRuntimeDependencies,
    generateWarning
};
