"use strict";

// Require Internal Dependencies
const ASTDeps = require("./ASTDeps");
const ASTStats = require("./ASTStats");
const { runOnProbes } = require("./probes");
const constants = require("./constants");

class Analysis {
    constructor() {
        this.dependencies = new ASTDeps();
        this.stats = new ASTStats();

        this.identifiers = new Map();
        this.globalParts = new Map();
        this.requireIdentifiers = new Set(["require", constants.processMainModuleRequire]);
    }

    walk(node) {
        // Detect TryStatement and CatchClause to known which dependency is required in a Try {} clause
        if (node.type === "TryStatement" && typeof node.handler !== "undefined") {
            this.dependencies.isInTryStmt = true;
        }
        else if (node.type === "CatchClause") {
            this.dependencies.isInTryStmt = false;
        }

        const action = runOnProbes(node, this);
        this.stats.doNodeAnalysis(node);

        return action;
    }
}

module.exports = Analysis;
