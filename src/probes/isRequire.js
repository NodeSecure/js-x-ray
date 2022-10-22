/* eslint-disable consistent-return */

// Import Internal Dependencies
import { isRequireGlobalMemberExpr } from "../utils.js";

// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";
import { walk } from "estree-walker";
import {
  concatBinaryExpression,
  arrayExpressionToString,
  getMemberExpressionIdentifier
} from "@nodesecure/estree-ast-utils";

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

  return isRequireGlobalMemberExpr(
    [...getMemberExpressionIdentifier(node.callee)].join(".")
  );
}

function isRequireIdentifiers(node, analysis) {
  if (node.type !== "CallExpression") {
    return false;
  }
  const fullName = node.callee.type === "MemberExpression" ?
    [...getMemberExpressionIdentifier(node.callee)].join(".") :
    node.callee.name;

  return analysis.requireIdentifiers.has(fullName);
}

function main(node, options) {
  const { analysis } = options;
  const { tracer } = analysis;

  const arg = node.arguments[0];
  switch (arg.type) {
    // const foo = "http"; require(foo);
    case "Identifier":
      if (analysis.tracer.literalIdentifiers.has(arg.name)) {
        analysis.dependencies.add(
          analysis.tracer.literalIdentifiers.get(arg.name),
          node.loc
        );
      }
      else {
        analysis.addWarning("unsafe-import", null, node.loc);
      }
      break;

    // require("http")
    case "Literal":
      analysis.dependencies.add(arg.value, node.loc);
      break;

    // require(["ht", "tp"])
    case "ArrayExpression": {
      const value = [...arrayExpressionToString(arg, { tracer })]
        .join("")
        .trim();

      if (value === "") {
        analysis.addWarning("unsafe-import", null, node.loc);
      }
      else {
        analysis.dependencies.add(value, node.loc);
      }
      break;
    }

    // require("ht" + "tp");
    case "BinaryExpression": {
      if (arg.operator !== "+") {
        break;
      }

      try {
        const iter = concatBinaryExpression(arg, {
          tracer, stopOnUnsupportedNode: true
        });

        analysis.dependencies.add([...iter].join(""), node.loc);
      }
      catch {
        analysis.addWarning("unsafe-import", null, node.loc);
      }
      break;
    }

    // require(Buffer.from("...", "hex").toString());
    case "CallExpression": {
      const { dependencies } = parseRequireCallExpression(arg);
      dependencies.forEach((depName) => analysis.dependencies.add(depName, node.loc, true));

      analysis.addWarning("unsafe-import", null, node.loc);

      // We skip walking the tree to avoid anymore warnings...
      return Symbol.for("skipWalk");
    }

    default:
      analysis.addWarning("unsafe-import", null, node.loc);
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

      const fullName = node.callee.type === "MemberExpression" ?
        [...getMemberExpressionIdentifier(node.callee)].join(".") :
        node.callee.name;

      switch (fullName) {
        case "Buffer.from": {
          const [element, convert] = node.arguments;

          if (element.type === "ArrayExpression") {
            const depName = [...arrayExpressionToString(element)].join("").trim();
            if (depName !== "") {
              dependencies.add(depName);
            }
          }
          else if (element.type === "Literal" && convert.type === "Literal" && convert.value === "hex") {
            const value = Buffer.from(element.value, "hex").toString();
            dependencies.add(value);
          }
          break;
        }
        case "require.resolve": {
          const [element] = node.arguments;

          if (element.type === "Literal") {
            dependencies.add(element.value);
          }
          break;
        }
      }
    }
  });

  return {
    dependencies: [...dependencies]
  };
}

export default {
  name: "isRequire",
  validateNode, main, breakOnMatch: true, breakGroup: "import"
};
