// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import { isLiteral } from "../estree/types.ts";
import { generateWarning } from "../warnings.ts";

const kOWASPMinParams: [minMemory: number, minIteration: number, minParallelism: number][] = [
  [47104, 1, 1],
  [19456, 2, 1],
  [12288, 3, 1],
  [9216, 4, 1],
  [7168, 5, 1]
];

const tracedFunctions = new Set(["crypto.argon2", "crypto.argon2Sync"]);

function extractNumericParam(
  properties: ESTree.Property[],
  names: string[]
): number | null {
  for (const prop of properties) {
    if (
      prop.key.type === "Identifier" &&
      names.includes(prop.key.name) &&
      prop.value.type === "Literal" &&
      typeof prop.value.value === "number"
    ) {
      return prop.value.value;
    }
  }

  return null;
}

function isWeakArgon2Params(memory: number, iteration: number, parallelism: number): boolean {
  for (const [minMemory, minIteration, minParallelism] of kOWASPMinParams) {
    if (memory >= minMemory) {
      return parallelism < minParallelism || iteration < minIteration;
    }
  }

  return true;
}

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext): [boolean, any?] {
  const { tracer } = ctx.sourceFile;

  if (!tracer.importedModules.has("crypto")) {
    return [false];
  }

  return [
    tracedFunctions.has(ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr)
  ];
}

function initialize(ctx: ProbeContext) {
  const { tracer } = ctx.sourceFile;

  for (const identifierOrMemberExpr of tracedFunctions) {
    tracer.trace(identifierOrMemberExpr, {
      followConsecutiveAssignment: true,
      moduleName: "crypto"
    });
  }
}

function main(node: ESTree.CallExpression, ctx: ProbeContext) {
  const { sourceFile } = ctx;
  const algorithm = node.arguments.at(0);

  if (algorithm && algorithm.type === "Identifier") {
    const algorithmName = sourceFile.tracer.literalIdentifiers.get(algorithm.name)?.value;
    if (algorithmName && algorithmName !== "argon2id") {
      sourceFile.warnings.push(
        generateWarning("weak-argon2", {
          value: `wrong-algorithm : ${algorithmName}`,
          location: node.loc
        })
      );
    }
  }

  if (isLiteral(algorithm)) {
    if (algorithm.value !== "argon2id") {
      sourceFile.warnings.push(
        generateWarning("weak-argon2", {
          value: `wrong-algorithm : ${algorithm.value}`,
          location: node.loc
        })
      );
    }
  }

  const parameters = node.arguments.at(1);
  if (parameters && parameters.type === "ObjectExpression") {
    const properties = parameters.properties.filter(
      (prop): prop is ESTree.Property => prop.type === "Property"
    );
    const memory = extractNumericParam(properties, ["memory"]);
    const iteration = extractNumericParam(properties, ["passes"]);
    const parallelism = extractNumericParam(properties, ["parallelism"]);

    if (memory && iteration && parallelism) {
      if (isWeakArgon2Params(memory, iteration, parallelism)) {
        sourceFile.warnings.push(
          generateWarning("weak-argon2", {
            value: "weak-parameters",
            location: node.loc
          })
        );
      }
    }

    const nonce = properties.find(
      (prop) => prop.key.type === "Identifier" && prop.key.name === "nonce"
    );

    if (nonce && isLiteral(nonce.value)) {
      sourceFile.warnings.push(
        generateWarning("weak-argon2", {
          value: "hardcoded-nonce",
          location: node.loc
        })
      );
    }
  }
}

export default {
  name: "isWeakArgon2",
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};
