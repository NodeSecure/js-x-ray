// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../../ProbeRunner.ts";
import { isStringLiteral, isNumericLiteral } from "../../estree/types.ts";
import { findPropertyMatch } from "../../estree/index.ts";
import { generateWarning } from "../../warnings.ts";
import { classifyHardcodedSecret } from "./classifyHardcodedSecret.ts";
import {
  hasImportedModules,
  matchTracedCall,
  traceAllFromModule,
  type ModuleScopedIdentifier
} from "../tracing.ts";

/**
 * OWASP recommended minimum scrypt parameter combinations.
 * Each entry is [minCost, minParallelization] — sorted by cost descending.
 * All recommendations assume blockSize >= 8.
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt
 */
const kOWASPMinParams: [minCost: number, minParallelization: number][] = [
  [131072, 1],
  [65536, 2],
  [32768, 3],
  [16384, 5],
  [8192, 10]
];

const kMinBlockSize = 8;
const kMinSaltLength = 16;

// Node.js crypto.scrypt defaults
const kDefaultCost = 16384;
const kDefaultBlockSize = 8;
const kDefaultParallelization = 1;

const kTracedFunctions = new Set<ModuleScopedIdentifier>(["crypto.scrypt"]);

function isWeakScryptParams(cost: number, blockSize: number, parallelization: number): boolean {
  if (blockSize < kMinBlockSize) {
    return true;
  }

  for (const [minCost, minParallelization] of kOWASPMinParams) {
    if (cost >= minCost) {
      return parallelization < minParallelization;
    }
  }

  // cost is below the lowest OWASP recommendation (2^13 = 8192)
  return true;
}

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  if (!hasImportedModules(ctx, "crypto")) {
    return [false];
  }

  return matchTracedCall(ctx, kTracedFunctions);
}

function initialize(ctx: ProbeContext) {
  traceAllFromModule(ctx.sourceFile.tracer, kTracedFunctions);
}

function main(node: ESTree.CallExpression, ctx: ProbeContext) {
  const { sourceFile } = ctx;
  const salt = node.arguments.at(1);
  const options = node.arguments.at(3);
  const reasons: string[] = [];

  if (options && options.type === "ObjectExpression") {
    const { properties } = options;

    const costValue = findPropertyMatch(properties, ["cost", "N"], isNumericLiteral)?.value ?? null;
    const blockSizeValue = findPropertyMatch(properties, ["blockSize", "r"], isNumericLiteral)?.value ?? null;
    const parallelizationValue = findPropertyMatch(properties, [
      "parallelization",
      "p"
    ], isNumericLiteral)?.value ?? null;

    if (
      costValue !== null ||
      blockSizeValue !== null ||
      parallelizationValue !== null
    ) {
      if (
        isWeakScryptParams(
          costValue ?? kDefaultCost,
          blockSizeValue ?? kDefaultBlockSize,
          parallelizationValue ?? kDefaultParallelization
        )
      ) {
        reasons.push("low-cost");
      }
    }
  }

  if (isStringLiteral(salt)) {
    reasons.push(
      classifyHardcodedSecret(salt.value, "salt", kMinSaltLength)
    );
  }

  if (reasons.length > 0) {
    sourceFile.warnings.push(
      generateWarning("crypto.weak-scrypt", {
        value: reasons.join(", "),
        location: node.loc
      })
    );
  }
}

export default {
  name: "isWeakScrypt",
  nodeTypes: ["CallExpression"],
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};
