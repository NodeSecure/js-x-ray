// Require Internal Dependencies
import { getIdName, getMemberExprName, isUnsafeCallee, isRequireGlobalMemberExpr } from "../utils.js";
import { warnings, globalParts, processMainModuleRequire } from "../constants.js";

// CONSTANTS
const kUnsafeCallee = new Set(["eval", "Function"]);

// In case we are matching a Variable declaration, we have to save the identifier
// This allow the AST Analysis to retrieve required dependency when the stmt is mixed with variables.
function validateNode(node) {
  return [
    node.type === "VariableDeclaration"
  ];
}

function main(mainNode, options) {
  const { analysis } = options;

  analysis.varkinds[mainNode.kind]++;

  for (const node of mainNode.declarations) {
    analysis.idtypes.variableDeclarator++;
    for (const name of getIdName(node.id)) {
      analysis.identifiersName.push({ name, type: "variableDeclarator" });
    }

    if (node.init === null || node.id.type !== "Identifier") {
      continue;
    }

    if (node.init.type === "Literal") {
      analysis.identifiers.set(node.id.name, String(node.init.value));
    }

    // Searching for someone who assign require to a variable, ex:
    // const r = require
    else if (node.init.type === "Identifier") {
      if (kUnsafeCallee.has(node.init.name)) {
        analysis.addWarning(warnings.unsafeAssign, node.init.name, node.loc);
      }
      else if (analysis.requireIdentifiers.has(node.init.name)) {
        analysis.requireIdentifiers.add(node.id.name);
        analysis.addWarning(warnings.unsafeAssign, node.init.name, node.loc);
      }
      else if (globalParts.has(node.init.name)) {
        analysis.globalParts.set(node.id.name, node.init.name);
        getRequirablePatterns(analysis.globalParts)
          .forEach((name) => analysis.requireIdentifiers.add(name));
      }
    }

    // Same as before but for pattern like process.mainModule and require.resolve
    else if (node.init.type === "MemberExpression") {
      const value = getMemberExprName(node.init);
      const members = value.split(".");

      if (analysis.globalParts.has(members[0]) || members.every((part) => globalParts.has(part))) {
        analysis.globalParts.set(node.id.name, members.slice(1).join("."));
        analysis.addWarning(warnings.unsafeAssign, value, node.loc);
      }
      getRequirablePatterns(analysis.globalParts)
        .forEach((name) => analysis.requireIdentifiers.add(name));

      if (isRequireStatement(value)) {
        analysis.requireIdentifiers.add(node.id.name);
        analysis.addWarning(warnings.unsafeAssign, value, node.loc);
      }
    }
    else if (isUnsafeCallee(node.init)[0]) {
      analysis.globalParts.set(node.id.name, "global");
      globalParts.add(node.id.name);
      analysis.requireIdentifiers.add(`${node.id.name}.${processMainModuleRequire}`);
    }
  }
}

function isRequireStatement(value) {
  return value.startsWith("require") ||
    value.startsWith(processMainModuleRequire) ||
    isRequireGlobalMemberExpr(value);
}

function getRequirablePatterns(parts) {
  const result = new Set();

  for (const [id, path] of parts.entries()) {
    if (path === "process") {
      result.add(`${id}.mainModule.require`);
    }
    else if (path === "mainModule") {
      result.add(`${id}.require`);
    }
    else if (path.includes("require")) {
      result.add(id);
    }
  }

  return [...result];
}

export default {
  name: "isVariableDeclaration",
  validateNode, main, breakOnMatch: false
};
