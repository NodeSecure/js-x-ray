// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import { generateWarning } from "../warnings.ts";

// CONSTANTS
/**
 * OWASP recommends at least 600,000 iterations for PBKDF2 with SHA-256
 * as of 2023. We use 100,000 as a minimum threshold to flag clearly
 * dangerous configurations while avoiding excessive false positives.
 */
const kMinPbkdf2Iterations = 100_000;

const kTracedFunctions = new Set([
  "crypto.pbkdf2",
  "crypto.pbkdf2Sync"
]);

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const { tracer } = ctx.sourceFile;

  if (!tracer.importedModules.has("crypto")) {
    return [false];
  }

  return [
    kTracedFunctions.has(ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr)
  ];
}

function initialize(
  ctx: ProbeContext
) {
  const { tracer } = ctx.sourceFile;

  for (const identifierOrMemberExpr of kTracedFunctions) {
    tracer.trace(identifierOrMemberExpr, {
      followConsecutiveAssignment: true,
      moduleName: "crypto"
    });
  }
}

function isWeakSalt(
  node: ESTree.Node | undefined
): boolean {
  if (!node) {
    return true;
  }

  // Empty string salt: crypto.pbkdf2('password', '', ...)
  if (node.type === "Literal" && node.value === "") {
    return true;
  }

  // Short string salt (less than 8 characters)
  if (
    node.type === "Literal" &&
    typeof node.value === "string" &&
    node.value.length < 8
  ) {
    return true;
  }

  return false;
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeContext
) {
  const { sourceFile } = ctx;

  // crypto.pbkdf2(password, salt, iterations, keylen, digest, callback)
  // crypto.pbkdf2Sync(password, salt, iterations, keylen, digest)
  // arg index: 0=password, 1=salt, 2=iterations
  const saltArg = node.arguments.at(1);
  const iterationsArg = node.arguments.at(2);

  // Check for weak or missing salt
  if (isWeakSalt(saltArg)) {
    const identifierOrMemberExpr = ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr;
    sourceFile.warnings.push(
      generateWarning("crypto-api-misuse", {
        value: `${identifierOrMemberExpr} with weak or empty salt`,
        location: node.loc
      })
    );
  }

  // Check for low iteration count
  if (
    iterationsArg &&
    iterationsArg.type === "Literal" &&
    typeof iterationsArg.value === "number" &&
    iterationsArg.value < kMinPbkdf2Iterations
  ) {
    const identifierOrMemberExpr = ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr;
    sourceFile.warnings.push(
      generateWarning("crypto-api-misuse", {
        value: `${identifierOrMemberExpr} with ${iterationsArg.value} iterations (minimum ${kMinPbkdf2Iterations} recommended)`,
        location: node.loc
      })
    );
  }
}

export default {
  name: "isCryptoApiMisuse",
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};
