/* eslint-disable consistent-return */

// Import Third-party Dependencies
import {
  concatBinaryExpression,
  arrayExpressionToString,
  getCallExpressionIdentifier,
  getCallExpressionArguments
} from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { ProbeSignals } from "../../ProbeRunner.js";
import { SourceFile } from "../../SourceFile.js";
import { isLiteral } from "../../types/estree.js";
import { RequireCallExpressionWalker } from "./RequireCallExpressionWalker.js";
import { generateWarning } from "../../warnings.js";

function validateNodeRequire(
  node: ESTree.Node,
  { tracer }: SourceFile
): [boolean, any?] {
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

function validateNodeEvalRequire(
  node: ESTree.Node
): [boolean, any?] {
  const id = getCallExpressionIdentifier(node);

  if (id !== "eval") {
    return [false];
  }

  const castedNode = node as ESTree.CallExpression;
  if (castedNode.callee.type !== "CallExpression") {
    return [false];
  }

  const args = getCallExpressionArguments(castedNode.callee);
  if (args === null) {
    return [false];
  }

  return [
    args.length > 0 && args.at(0) === "require",
    id
  ];
}

function teardown(
  { sourceFile }: { sourceFile: SourceFile; }
) {
  sourceFile.dependencyAutoWarning = false;
}

function main(
  node: ESTree.CallExpression,
  options: { sourceFile: SourceFile; data?: string; }
) {
  const { sourceFile, data: calleeName } = options;
  const { tracer } = sourceFile;

  if (node.arguments.length === 0) {
    return;
  }
  const arg = node.arguments.at(0);
  if (arg === undefined) {
    return;
  }

  if (calleeName === "eval") {
    sourceFile.dependencyAutoWarning = true;
  }
  const location = node.loc;

  switch (arg.type) {
    // const foo = "http"; require(foo);
    case "Identifier":
      if (sourceFile.tracer.literalIdentifiers.has(arg.name)) {
        sourceFile.addDependency(
          sourceFile.tracer.literalIdentifiers.get(arg.name)!,
          node.loc
        );
      }
      else {
        sourceFile.warnings.push(
          generateWarning("unsafe-import", { value: null, location })
        );
      }
      break;

    // require("http")
    case "Literal":
      if (isLiteral(arg)) {
        sourceFile.addDependency(arg.value, node.loc);
      }
      break;

    // require(["ht", "tp"])
    case "ArrayExpression": {
      const value = [...arrayExpressionToString(arg, { tracer })]
        .join("")
        .trim();

      if (value === "") {
        sourceFile.warnings.push(
          generateWarning("unsafe-import", { value: null, location })
        );
      }
      else {
        sourceFile.addDependency(value, node.loc);
      }
      break;
    }

    // require("ht" + "tp");
    case "BinaryExpression": {
      if (arg.operator !== "+") {
        sourceFile.warnings.push(
          generateWarning("unsafe-import", { value: null, location })
        );
        break;
      }

      try {
        const iter = concatBinaryExpression(arg, {
          tracer, stopOnUnsupportedNode: true
        });

        sourceFile.addDependency([...iter].join(""), node.loc);
      }
      catch {
        sourceFile.warnings.push(
          generateWarning("unsafe-import", { value: null, location })
        );
      }
      break;
    }

    // require(Buffer.from("...", "hex").toString());
    case "CallExpression": {
      const walker = new RequireCallExpressionWalker(tracer);
      const { dependencies, triggerWarning } = walker.walk(arg);
      dependencies.forEach((depName) => sourceFile.addDependency(depName, node.loc, true));

      if (triggerWarning) {
        sourceFile.warnings.push(
          generateWarning("unsafe-import", { value: null, location })
        );
      }

      // We skip walking the tree to avoid anymore warnings...
      return ProbeSignals.Skip;
    }

    default:
      sourceFile.warnings.push(
        generateWarning("unsafe-import", { value: null, location })
      );
  }

  return;
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
