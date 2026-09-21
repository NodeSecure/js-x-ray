// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../../contants.ts";
import { isStringLiteral } from "../../estree/types.ts";
import { generateWarning } from "../../warnings.ts";
import { resolveNumericValue } from "./resolveNumericValue.ts";
import { resolveStringValue } from "./resolveStringValue.ts";

/**
 * OWASP recommended minimum PBKDF2 iteration counts.
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
 */
const kMinIterationsSha256 = 600_000;
const kMinIterationsSha512 = 210_000;

// Minimum salt length in bytes (same threshold as the other crypto probes)
const kMinSaltLength = 16;

const kTracedFunctions = ["crypto.pbkdf2", "crypto.pbkdf2Sync"];

/**
 * Return the OWASP minimum iteration count for the given digest.
 * When the digest cannot be resolved statically, fall back to the lowest
 * recommendation so only unambiguously weak counts are reported.
 */
function minIterationsFor(digest: string | null): number {
  return digest === "sha256" ? kMinIterationsSha256 : kMinIterationsSha512;
}

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const { tracer } = ctx.sourceFile;

  if (!tracer.importedModules.has("crypto")) {
    return [false];
  }

  return [
    kTracedFunctions.includes(ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr)
  ];
}

function initialize(ctx: ProbeContext) {
  const { tracer } = ctx.sourceFile;

  for (const identifierOrMemberExpr of kTracedFunctions) {
    tracer.trace(identifierOrMemberExpr, {
      followConsecutiveAssignment: true,
      moduleName: "crypto"
    });
  }
}

function main(node: ESTree.CallExpression, ctx: ProbeContext) {
  const { sourceFile } = ctx;
  const { tracer } = sourceFile;
  const reasons: string[] = [];

  // crypto.pbkdf2(password, salt, iterations, keylen, digest, callback)
  const salt = node.arguments.at(1);
  const iterations = resolveNumericValue(
    node.arguments.at(2),
    tracer.literalIdentifiers
  );
  const digest = resolveStringValue(node.arguments.at(4), tracer.literalIdentifiers);

  if (iterations !== null && iterations < minIterationsFor(digest)) {
    reasons.push("low-iterations");
  }

  if (isStringLiteral(salt) && typeof salt.value === "string") {
    reasons.push(Buffer.byteLength(salt.value) < kMinSaltLength ? "short-salt" : "hardcoded-salt");
  }

  if (reasons.length > 0) {
    sourceFile.warnings.push(
      generateWarning("crypto.weak-pbkdf2", {
        value: reasons.join(", "),
        location: node.loc
      })
    );
  }
}

export default {
  name: "isWeakPbkdf2",
  nodeTypes: ["CallExpression"],
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};
