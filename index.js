"use strict";

// Require Node.js Dependencies
const repl = require("repl");

// Require Third-party Dependencies
const { walk } = require("estree-walker");
const meriyah = require("meriyah");
const safeRegex = require("safe-regex");

// Require Internal Dependencies
const helpers = require("./src/utils");
const ASTDeps = require("./src/ASTDeps");
const ASTStats = require("./src/ASTStats");

// CONSTANTS
const kMainModuleStr = "process.mainModule.require";
const kNodeDeps = new Set(repl.builtinModules);
const kUnsafeCallee = new Set(["eval", "Function"]);
const { CONSTANTS: { GLOBAL_PARTS } } = helpers;

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

            if (node.arguments[0].type === "Literal" && helpers.isHexValue(node.arguments[0].value)) {
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

function runASTAnalysis(str, options = Object.create(null)) {
    const { module = true, isMinified = false } = options;

    // Function variables
    const dependencies = new ASTDeps();
    const stats = new ASTStats();
    const identifiers = new Map();
    const globalParts = new Map();
    const requireIdentifiers = new Set(["require", kMainModuleStr]);

    function isRequireIdentifiers(node) {
        if (node.type !== "CallExpression") {
            return false;
        }
        const fullName = node.callee.type === "MemberExpression" ? helpers.getMemberExprName(node.callee) : node.callee.name;

        return requireIdentifiers.has(fullName);
    }

    function checkVariableAssignment(node) {
        if (node.init === null || node.id.type !== "Identifier") {
            return;
        }

        if (node.init.type === "Literal") {
            identifiers.set(node.id.name, String(node.init.value));
        }

        // Searching for someone who assign require to a variable, ex:
        // const r = require
        else if (node.init.type === "Identifier") {
            if (kUnsafeCallee.has(node.init.name)) {
                stats.addWarning(ASTStats.Warnings.unsafeAssign, node.init.name, node.loc);
            }
            else if (requireIdentifiers.has(node.init.name)) {
                requireIdentifiers.add(node.id.name);
                stats.addWarning(ASTStats.Warnings.unsafeAssign, node.init.name, node.loc);
            }
            else if (GLOBAL_PARTS.has(node.init.name)) {
                globalParts.set(node.id.name, node.init.name);
                helpers.getRequirablePatterns(globalParts)
                    .forEach((name) => requireIdentifiers.add(name));
            }
        }

        // Same as before but for pattern like process.mainModule and require.resolve
        else if (node.init.type === "MemberExpression") {
            const value = helpers.getMemberExprName(node.init);
            const members = value.split(".");

            if (globalParts.has(members[0]) || members.every((part) => GLOBAL_PARTS.has(part))) {
                globalParts.set(node.id.name, members.slice(1).join("."));
                stats.addWarning(ASTStats.Warnings.unsafeAssign, value, node.loc);
            }
            helpers.getRequirablePatterns(globalParts)
                .forEach((name) => requireIdentifiers.add(name));

            if (helpers.isRequireStatement(value)) {
                requireIdentifiers.add(node.id.name);
                stats.addWarning(ASTStats.Warnings.unsafeAssign, value, node.loc);
            }
        }
        else if (helpers.isUnsafeCallee(node.init)[0]) {
            globalParts.set(node.id.name, "global");
            GLOBAL_PARTS.add(node.id.name);
            requireIdentifiers.add(`${node.id.name}.${kMainModuleStr}`);
        }
    }

    // Note: if the file start with a shebang then we remove it because 'parseScript' may fail to parse it.
    // Example: #!/usr/bin/env node
    const strToAnalyze = str.charAt(0) === "#" ? str.slice(str.indexOf("\n")) : str;
    const { body } = meriyah.parseScript(strToAnalyze, {
        next: true, loc: true, raw: true, module: Boolean(module)
    });

    // we walk each AST Nodes, this is a purely synchronous I/O
    walk(body, {
        enter(node) {
            // Skip the root of the AST.
            if (Array.isArray(node)) {
                return;
            }

            // Detect unsafe statement like eval("this") or Function("return this")();
            const [inUnsafeCallee, calleeName] = helpers.isUnsafeCallee(node);
            if (inUnsafeCallee) {
                stats.addWarning(ASTStats.Warnings.unsafeStmt, calleeName, node.loc);
            }
            stats.doNodeAnalysis(node);

            // Check all 'string' Literal values
            if (node.type === "Literal" && typeof node.value === "string") {
                // We are searching for value obfuscated as hex of a minimum lenght of 4.
                if (/^[0-9A-Fa-f]{4,}$/g.test(node.value)) {
                    const value = Buffer.from(node.value, "hex").toString();

                    // If the value we are retrieving is the name of a Node.js dependency,
                    // then we add it to the dependencies list and we throw an unsafe-import at the current location.
                    if (kNodeDeps.has(value)) {
                        dependencies.add(value, node.loc);
                        stats.addWarning(ASTStats.Warnings.unsafeImport, null, node.loc);
                    }
                    else if (!helpers.isSafeHexValue(node.value)) {
                        stats.addWarning(ASTStats.Warnings.encodedLiteral, node.value, node.loc);
                    }
                }
                // Else we are checking all other string with our suspect method
                else {
                    stats.analyzeLiteral(node);
                }
            }

            // Detect TryStatement and CatchClause to known which dependency is required in a Try {} clause
            if (node.type === "TryStatement" && typeof node.handler !== "undefined") {
                dependencies.isInTryStmt = true;
            }
            else if (node.type === "CatchClause") {
                dependencies.isInTryStmt = false;
            }

            // Search for literal Regex (or Regex Object constructor).
            // then we use the safe-regex package to detect whether or not regex is safe!
            if (helpers.isLiteralRegex(node) && !safeRegex(node.regex.pattern)) {
                stats.addWarning(ASTStats.Warnings.unsafeRegex, node.regex.pattern, node.loc);
            }
            else if (helpers.isRegexConstructor(node) && node.arguments.length > 0) {
                const arg = node.arguments[0];
                const pattern = helpers.isLiteralRegex(arg) ? arg.regex.pattern : arg.value;

                if (!safeRegex(pattern)) {
                    stats.addWarning(ASTStats.Warnings.unsafeRegex, pattern, node.loc);
                }
            }

            // In case we are matching a Variable declaration, we have to save the identifier
            // This allow the AST Analysis to retrieve required dependency when the stmt is mixed with variables.
            if (node.type === "VariableDeclaration") {
                stats.analyzeVariableDeclaration(node);
                node.declarations.forEach((variable) => checkVariableAssignment(variable));
            }
            else if (node.type === "AssignmentExpression" && node.left.type === "MemberExpression") {
                const assignName = helpers.getMemberExprName(node.left);
                if (node.right.type === "Identifier" && requireIdentifiers.has(node.right.name)) {
                    requireIdentifiers.add(assignName);
                }
            }

            // Searching for all CJS require pattern (require, require.resolve).
            if (isRequireIdentifiers(node) || helpers.isRequireResolve(node) || helpers.isRequireMemberExpr(node)) {
                const arg = node.arguments[0];

                // const foo = "http"; require(foo);
                if (arg.type === "Identifier") {
                    if (identifiers.has(arg.name)) {
                        dependencies.add(identifiers.get(arg.name), node.loc);
                    }
                    else {
                        stats.addWarning(ASTStats.Warnings.unsafeImport, null, node.loc);
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
                        stats.addWarning(ASTStats.Warnings.unsafeImport, null, node.loc);
                    }
                    else {
                        dependencies.add(value, node.loc);
                    }
                }
                // require("ht" + "tp");
                else if (arg.type === "BinaryExpression" && arg.operator === "+") {
                    const value = helpers.concatBinaryExpr(arg, identifiers);
                    if (value === null) {
                        stats.addWarning(ASTStats.Warnings.unsafeImport, null, node.loc);
                    }
                    else {
                        dependencies.add(value, node.loc);
                    }
                }
                // require(Buffer.from("...", "hex").toString());
                else if (arg.type === "CallExpression") {
                    walkCallExpression(arg)
                        .forEach((depName) => dependencies.add(depName, node.loc, true));

                    stats.addWarning(ASTStats.Warnings.unsafeImport, null, node.loc);

                    // We skip walking the tree to avoid anymore warnings...
                    this.skip();
                }
                else {
                    stats.addWarning(ASTStats.Warnings.unsafeImport, null, node.loc);
                }
            }

            // if we are dealing with an ESM import declaration (easier than require ^^)
            else if (node.type === "ImportDeclaration" && node.source.type === "Literal") {
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

    const { idsLengthAvg, stringScore, warnings } = stats.getResult(isMinified);

    return {
        dependencies, warnings, idsLengthAvg, stringScore,
        isOneLineRequire: body.length <= 1 && dependencies.size <= 1
    };
}

module.exports = {
    runASTAnalysis,
    generateWarning: helpers.generateWarning,
    rootLocation: helpers.rootLocation,
    CONSTANTS: {
        Warnings: Object.freeze({
            parsingError: "ast-error",
            unsafeImport: "unsafe-import",
            unsafeRegex: "unsafe-regex",
            unsafeStmt: "unsafe-stmt",
            unsafeAssign: "unsafe-assign",
            encodedLiteral: "encoded-literal",
            shortIdentifiers: "short-identifiers",
            suspiciousLiteral: "suspicious-literal",
            obfuscatedCode: "obfuscated-code"
        })
    }
};
