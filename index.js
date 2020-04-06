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
const kMainModuleStr = "process.mainModule.require";
const kNodeDeps = new Set(builtins());
const kUnsafeCallee = new Set(["eval", "Function"]);
const { CONSTANTS: { GLOBAL_PARTS } } = helpers;

function generateWarning(kind = "unsafe-import", options) {
    const { location, file = null, value = null } = options;
    const { start, end = start } = location;

    const result = { kind, file, start, end };
    if (value !== null) {
        result.value = value;
    }

    return result;
}

function rootLocation() {
    return { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } };
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
    const identifiers = new Map();
    const globalParts = new Map();
    const warnings = [];
    const suspectScores = [];
    const identifiersLength = [];
    const requireIdentifiers = new Set(["require", kMainModuleStr]);

    function isRequireIdentifiers(node) {
        if (node.type !== "CallExpression") {
            return false;
        }
        const fullName = node.callee.type === "MemberExpression" ? helpers.getMemberExprName(node.callee) : node.callee.name;

        return requireIdentifiers.has(fullName);
    }

    function checkVariableAssignment(node) {
        identifiersLength.push(...helpers.getIdLength(node.id));
        if (node.init === null || node.id.type !== "Identifier") {
            return;
        }

        if (node.init.type === "Literal") {
            identifiers.set(node.id.name, node.init.value);
        }

        // Searching for someone who assign require to a variable, ex:
        // const r = require
        else if (node.init.type === "Identifier") {
            if (kUnsafeCallee.has(node.init.name)) {
                warnings.push(generateWarning("unsafe-assign", { location: node.loc, value: node.init.name }));
            }
            else if (requireIdentifiers.has(node.init.name)) {
                requireIdentifiers.add(node.id.name);
                warnings.push(generateWarning("unsafe-assign", { location: node.loc, value: node.init.name }));
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
                warnings.push(generateWarning("unsafe-assign", { location: node.loc, value }));
            }
            helpers.getRequirablePatterns(globalParts)
                .forEach((name) => requireIdentifiers.add(name));

            if (helpers.isRequireStatement(value)) {
                requireIdentifiers.add(node.id.name);
                warnings.push(generateWarning("unsafe-assign", { location: node.loc, value }));
            }
        }
        else if (helpers.isUnsafeCallee(node.init)) {
            globalParts.set(node.id.name, "global");
            GLOBAL_PARTS.add(node.id.name);
            requireIdentifiers.add(`${node.id.name}.${kMainModuleStr}`);
        }
    }

    // Note: if the file start with a shebang then we remove it because 'parseScript' may fail to parse it.
    // Example: #!/usr/bin/env node
    const strToAnalyze = str.charAt(0) === "#" ? str.slice(str.indexOf("\n")) : str;
    const { body } = meriyah.parseScript(strToAnalyze, {
        next: true, loc: true, module: Boolean(module)
    });

    // we walk each AST Nodes, this is a purely synchronous I/O
    walk(body, {
        enter(node) {
            // Skip the root of the AST.
            if (Array.isArray(node)) {
                return;
            }

            // Detect unsafe statement like eval("this") or Function("return this")();
            if (helpers.isUnsafeCallee(node)) {
                warnings.push(generateWarning("unsafe-stmt", { value: node.callee.name, location: node.loc }));
            }

            // Check all 'string' Literal values
            if (node.type === "Literal" && typeof node.value === "string") {
                // We are searching for value obfuscated as hex of a minimum lenght of 4.
                if (/^[0-9A-Fa-f]{4,}$/g.test(node.value)) {
                    const value = Buffer.from(node.value, "hex").toString();

                    // If the value we are retrieving is the name of a Node.js dependency,
                    // then we add it to the dependencies list and we throw an unsafe-import at the current location.
                    if (kNodeDeps.has(value)) {
                        dependencies.add(value, node.loc);
                        warnings.push(generateWarning("unsafe-import", { location: node.loc }));
                    }
                    else {
                        warnings.push(generateWarning("hexa-value", { location: node.loc, value }));
                    }
                }
                // Else we are checking all other string with our suspect method
                else {
                    const score = helpers.strSuspectScore(node.value);
                    if (score !== 0) {
                        suspectScores.push(score);
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
            else if (helpers.isRegexConstructor(node) && node.arguments.length > 0) {
                const arg = node.arguments[0];
                const pattern = helpers.isLiteralRegex(arg) ? arg.regex.pattern : arg.value;

                if (!safeRegex(pattern)) {
                    warnings.push(generateWarning("unsafe-regex", { location: node.loc, value: pattern }));
                }
            }

            // In case we are matching a Variable declaration, we have to save the identifier
            // This allow the AST Analysis to retrieve required dependency when the stmt is mixed with variables.
            if (node.type === "VariableDeclaration") {
                node.declarations.forEach((variable) => checkVariableAssignment(variable));
            }
            else if (node.type === "AssignmentExpression" && node.left.type === "MemberExpression") {
                const assignName = helpers.getMemberExprName(node.left);
                if (node.right.type === "Identifier" && requireIdentifiers.has(node.right.name)) {
                    requireIdentifiers.add(assignName);
                }
            }

            // Add the identifier length of functions!
            else if (helpers.isFunctionDeclarator(node)) {
                identifiersLength.push(node.id.name.length);
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
                        warnings.push(generateWarning("unsafe-import", { location: node.loc }));
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
                        warnings.push(generateWarning("unsafe-import", { location: node.loc }));
                    }
                    else {
                        dependencies.add(value, node.loc);
                    }
                }
                // require("ht" + "tp");
                else if (arg.type === "BinaryExpression" && arg.operator === "+") {
                    const value = helpers.concatBinaryExpr(arg, identifiers);
                    if (value === null) {
                        warnings.push(generateWarning("unsafe-import", { location: node.loc }));
                    }
                    else {
                        dependencies.add(value, node.loc);
                    }
                }
                // require(Buffer.from("...", "hex").toString());
                else if (arg.type === "CallExpression") {
                    walkCallExpression(arg)
                        .forEach((depName) => dependencies.add(depName, node.loc, true));

                    warnings.push(generateWarning("unsafe-import", { location: node.loc }));

                    // We skip walking the tree to avoid anymore warnings...
                    this.skip();
                }
                else {
                    warnings.push(generateWarning("unsafe-import", { location: node.loc }));
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

    const idsLengthAvg = identifiersLength.length === 0 ?
        0 : (identifiersLength.reduce((prev, curr) => prev + curr, 0) / identifiersLength.length);
    const stringScore = suspectScores.length === 0 ?
        0 : (suspectScores.reduce((prev, curr) => prev + curr, 0) / suspectScores.length);

    if (!isMinified && identifiersLength.length > 5 && idsLengthAvg <= 1.5) {
        warnings.push(generateWarning("short-ids", { value: idsLengthAvg, location: rootLocation() }));
    }
    if (stringScore >= 3) {
        warnings.push(generateWarning("suspicious-string", { value: stringScore, location: rootLocation() }));
    }

    return {
        dependencies,
        warnings,
        idsLengthAvg,
        stringScore,
        isOneLineRequire: body.length <= 1 && dependencies.size <= 1
    };
}

module.exports = {
    runASTAnalysis,
    generateWarning,
    rootLocation
};
