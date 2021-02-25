"use strict";

// Require Internal Dependencies
const helpers = require("../utils");
const { processMainModuleRequire } = require("../constants");

// searching for "process.mainModule" pattern (processMainModuleRequire)
function validateNode(node) {
    return [
        node.type === "MemberExpression"
    ];
}

function main(node, options) {
    const { analysis } = options;

    analysis.counter[node.computed ? "computedMemberExpr" : "memberExpr"]++;

    // retrieve the member name, like: foo.bar.hello
    // in our case we are searching for process.mainModule.*
    const memberName = helpers.getMemberExprName(node);

    if (memberName.startsWith(processMainModuleRequire)) {
        analysis.dependencies.add(memberName.slice(processMainModuleRequire.length), node.loc);
    }

    // TODO: require.main ?
}

module.exports = {
    validateNode, main, breakOnMatch: true, breakGroup: "import"
};
