// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import {
  isCallExpression,
  isIdentifier,
  isMemberExpression
} from "../../estree/types.ts";
import { resolveDigestCall } from "./resolveDigestCall.ts";
import { createBcryptPrehashProbe } from "./bcryptPrehashProbe.ts";

/**
 * createHmac is intentionally excluded, HMAC with a pepper is the OWASP-safe pattern.
 */
const kHashDigestChains = [
  "crypto.createHash.update.digest",
  "crypto.createHash.update.digest.toString",
  "crypto.createHash.digest",
  "crypto.createHash.digest.toString"
];

function isCreateHashChain(
  node: ESTree.Node | null | undefined
): boolean {
  let current = node;
  while (isCallExpression(current)) {
    const { callee } = current;
    if (!isMemberExpression(callee)) {
      break;
    }
    if (isIdentifier(callee.property) && callee.property.name === "createHash") {
      return true;
    }
    current = callee.object;
  }

  return false;
}

function isShuckingPrehash(
  hashNode: ESTree.Node | null | undefined
): boolean {
  return resolveDigestCall(hashNode) !== null && isCreateHashChain(hashNode);
}

export default createBcryptPrehashProbe({
  name: "isPasswordShucking",
  warningKind: "crypto.password-shucking",
  digestChains: kHashDigestChains,
  // Any createHash digest handed over to bcrypt is a shucking candidate.
  shouldFlagReturnValue: () => true,
  isUnsafeArgument(argument, { isFlaggedIdentifier }) {
    if (isIdentifier(argument) && isFlaggedIdentifier(argument.name)) {
      return true;
    }

    return isShuckingPrehash(argument);
  }
});
