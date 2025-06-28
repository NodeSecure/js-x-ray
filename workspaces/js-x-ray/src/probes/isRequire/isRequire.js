/* eslint-disable consistent-return */

// Import Third-party Dependencies
import {
  concatBinaryExpression,
  arrayExpressionToString,
  getCallExpressionIdentifier,
  getCallExpressionArguments
} from "@nodesecure/estree-ast-utils";

// Import Internal Dependencies
import { ProbeSignals } from "../../ProbeRunner.js";
import { RequireCallExpressionWalker } from "./RequireCallExpressionWalker.js";

function validateNodeRequire(node, { tracer }) {
  const id = getCallExpressionIdentifier(node, {
    resolveCallExpression: false
  });
  if (id === null) {
    return [false];
  }

  const data = tracer.getDataFromIdentifier(id, {
    removeGlobalIdentifier: true
  });

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

function teardown({ sourceFile }) {
  sourceFile.dependencyAutoWarning = false;
}

function main(node, options) {
  const { sourceFile, data: calleeName } = options;
  const { tracer } = sourceFile;

  if (node.arguments.length === 0) {
    return;
  }
  const arg = node.arguments.at(0);

  if (calleeName === "eval") {
    sourceFile.dependencyAutoWarning = true;
  }

  switch (arg.type) {
    // const foo = "http"; require(foo);
    case "Identifier":
      if (sourceFile.tracer.literalIdentifiers.has(arg.name)) {
        sourceFile.addDependency(
          sourceFile.tracer.literalIdentifiers.get(arg.name),
          node.loc
        );
      }
      else {
        sourceFile.addWarning("unsafe-import", null, node.loc);
      }
      break;

    // require("http")
    case "Literal":
      sourceFile.addDependency(arg.value, node.loc);
      break;

    // require(["ht", "tp"])
    case "ArrayExpression": {
      const value = [...arrayExpressionToString(arg, { tracer })]
        .join("")
        .trim();

      if (value === "") {
        sourceFile.addWarning("unsafe-import", null, node.loc);
      }
      else {
        sourceFile.addDependency(value, node.loc);
      }
      break;
    }

    // require("ht" + "tp");
    case "BinaryExpression": {
      if (arg.operator !== "+") {
        sourceFile.addWarning("unsafe-import", null, node.loc);
        break;
      }

      try {
        const iter = concatBinaryExpression(arg, {
          tracer, stopOnUnsupportedNode: true
        });

        sourceFile.addDependency([...iter].join(""), node.loc);
      }
      catch {
        sourceFile.addWarning("unsafe-import", null, node.loc);
      }
      break;
    }

    // require(Buffer.from("...", "hex").toString());
    case "CallExpression": {
      const walker = new RequireCallExpressionWalker(tracer);
      const { dependencies, triggerWarning } = walker.walk(arg);
      dependencies.forEach((depName) => sourceFile.addDependency(depName, node.loc, true));

      if (triggerWarning) {
        sourceFile.addWarning("unsafe-import", null, node.loc);
      }

      // We skip walking the tree to avoid anymore warnings...
      return ProbeSignals.Skip;
    }

    default:
      sourceFile.addWarning("unsafe-import", null, node.loc);
  }
}

export default {
  name: "isRequire",
  validateNode: [
    validateNodeRequire,
    validateNodeEvalRequire
  ],
  main,
  teardown,
  breakOnMatch: true,
  breakGroup: "import"
};
