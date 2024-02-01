/* eslint-disable consistent-return */

// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";
import { walk } from "estree-walker";
import {
  concatBinaryExpression,
  arrayExpressionToString,
  getMemberExpressionIdentifier,
  getCallExpressionIdentifier,
  getCallExpressionArguments
} from "@nodesecure/estree-ast-utils";
import { ProbeSignals } from "../../ProbeRunner.js";
import { RequireCallExpressionWalker } from "./RequireCallExpressionWalker.js";

function validateNodeRequire(node, { tracer }) {
  const id = getCallExpressionIdentifier(node, {
    resolveCallExpression: false
  });
  if (id === null) {
    return [false];
  }

  const data = tracer.getDataFromIdentifier(id);

  return [
    data !== null && data.name === "require",
    id ?? void 0
  ];
}

function validateNodeEvalRequire(node) {
  const id = getCallExpressionIdentifier(node);

  if (id !== "eval") {
    return [false];
  }
  if (node.callee.type !== "CallExpression") {
    return [false];
  }

  const args = getCallExpressionArguments(node.callee);

  return [
    args.length > 0 && args.at(0) === "require",
    id
  ];
}

function teardown({ analysis }) {
  analysis.dependencyAutoWarning = false;
}

function main(node, options) {
  const { analysis, data: calleeName } = options;
  const { tracer } = analysis;

  if (node.arguments.length === 0) {
    return;
  }
  const arg = node.arguments.at(0);

  if (calleeName === "eval") {
    analysis.dependencyAutoWarning = true;
  }

  switch (arg.type) {
    // const foo = "http"; require(foo);
    case "Identifier":
      if (analysis.tracer.literalIdentifiers.has(arg.name)) {
        analysis.addDependency(
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
      analysis.addDependency(arg.value, node.loc);
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
        analysis.addDependency(value, node.loc);
      }
      break;
    }

    // require("ht" + "tp");
    case "BinaryExpression": {
      if (arg.operator !== "+") {
        analysis.addWarning("unsafe-import", null, node.loc);
        break;
      }

      try {
        const iter = concatBinaryExpression(arg, {
          tracer, stopOnUnsupportedNode: true
        });

        analysis.addDependency([...iter].join(""), node.loc);
      }
      catch {
        analysis.addWarning("unsafe-import", null, node.loc);
      }
      break;
    }

    // require(Buffer.from("...", "hex").toString());
    case "CallExpression": {
      const walker = new RequireCallExpressionWalker(tracer);
      const { dependencies, triggerWarning } = walker.walk(arg);
      dependencies.forEach((depName) => analysis.addDependency(depName, node.loc, true));

      if (triggerWarning) {
        analysis.addWarning("unsafe-import", null, node.loc);
      }

      // We skip walking the tree to avoid anymore warnings...
      return ProbeSignals.Skip;
    }

    default:
      analysis.addWarning("unsafe-import", null, node.loc);
  }
}

export default {
  name: "isRequire",
  validateNode: [validateNodeRequire, validateNodeEvalRequire],
  main,
  breakOnMatch: true,
  breakGroup: "import"
};
