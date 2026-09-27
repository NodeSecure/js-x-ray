// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { isIdentifier, isCallExpression } from "../../estree/types.ts";
import type { LiteralIdentifier } from "../../VariableTracer.ts";
import { resolveStringValue } from "./resolveStringValue.ts";
import { resolveDigestCall } from "./resolveDigestCall.ts";
import { createBcryptPrehashProbe } from "./bcryptPrehashProbe.ts";

/**
 * Digest encodings that produce ASCII-only output, avoiding the null-byte truncation issue
 */
const kSafeDigestEncodings = new Set(["base64", "base64url", "hex"]);

const kDigestChains = [
  "crypto.createHash.update.digest",
  "crypto.createHash.update.digest.toString",
  "crypto.createHash.digest",
  "crypto.createHash.digest.toString",
  "crypto.createHmac.update.digest",
  "crypto.createHmac.update.digest.toString",
  "crypto.createHmac.digest",
  "crypto.createHmac.digest.toString"
];

function isSafeEncodingArg(
  node: ESTree.Node | undefined,
  literalIdentifiers: Map<string, LiteralIdentifier>
): boolean {
  const value = resolveStringValue(node, literalIdentifiers);

  return value !== null && kSafeDigestEncodings.has(value);
}

function hasUnsafeDigestEncoding(
  hashNode: ESTree.Node | null | undefined,
  literalIdentifiers: Map<string, LiteralIdentifier>
): boolean {
  const encodingArgs = resolveDigestCall(hashNode);
  if (encodingArgs === null) {
    return false;
  }

  return !isSafeEncodingArg(encodingArgs.at(0), literalIdentifiers);
}

export default createBcryptPrehashProbe({
  name: "isUnsafePrehash",
  warningKind: "crypto.unsafe-prehash",
  digestChains: kDigestChains,
  // Only digests encoded as raw bytes are at risk of null-byte truncation.
  shouldFlagReturnValue: (payload, tracer) => !isSafeEncodingArg(
    resolveDigestCall(payload.node)?.at(0),
    tracer.literalIdentifiers
  ),
  isUnsafeArgument(argument, { tracer, isFlaggedIdentifier }) {
    if (isIdentifier(argument)) {
      return isFlaggedIdentifier(argument.name);
    }

    // The digest variable is itself callable, e.g. `hash => hash("hex")`
    if (
      isCallExpression(argument) &&
      isIdentifier(argument.callee) &&
      isFlaggedIdentifier(argument.callee.name)
    ) {
      return !isSafeEncodingArg(argument.arguments.at(0), tracer.literalIdentifiers);
    }

    return hasUnsafeDigestEncoding(argument, tracer.literalIdentifiers);
  }
});
