// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../../ProbeRunner.ts";
import { isStringLiteral } from "../../estree/types.ts";
import { generateWarning } from "../../warnings.ts";
import {
  hasImportedModules,
  matchTracedCall,
  traceAllFromModule,
  type ModuleScopedIdentifier
} from "../tracing.ts";
import { resolveNumericValue } from "./resolveNumericValue.ts";
import { resolveStringValue } from "./resolveStringValue.ts";

/**
 * OWASP recommended minimum PBKDF2 iteration counts.
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
 */
const kMinIterationsSha1 = 1_300_000;
const kMinIterationsSha256 = 600_000;
const kMinIterationsSha512 = 210_000;

// Minimum salt length in bytes (same threshold as the other crypto probes)
const kMinSaltLength = 16;

const kTracedFunctions = new Set<ModuleScopedIdentifier>(["crypto.pbkdf2", "crypto.pbkdf2Sync"]);

/**
 * Return the OWASP minimum iteration count for the given digest.
 * Digest names are matched case-insensitively (Node/OpenSSL accept
 * "SHA256", "Sha256", ... at runtime).
 * When the digest cannot be resolved statically, fall back to the lowest
 * recommendation so only unambiguously weak counts are reported.
 */
function minIterationsFor(digest: string | null): number {
  switch (digest?.toLowerCase()) {
    case "sha1":
      return kMinIterationsSha1;
    case "sha256":
      return kMinIterationsSha256;
    default:
      return kMinIterationsSha512;
  }
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
