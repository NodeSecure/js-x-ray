// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { getMemberCallExpression } from "../../estree/index.ts";

/**
 * digest's own argument takes precedence over toString's whenever digest received one.
 */
export function resolveDigestCall(
  hashNode: ESTree.Node | null | undefined
): ESTree.Node[] | null {
  const digestCall = getMemberCallExpression(hashNode, "digest");
  if (digestCall) {
    return digestCall.arguments;
  }

  const toStringCall = getMemberCallExpression(hashNode, "toString");
  if (toStringCall) {
    const innerDigestCall = getMemberCallExpression(toStringCall.callee.object, "digest");
    if (innerDigestCall) {
      return innerDigestCall.arguments.length === 0
        ? toStringCall.arguments
        : innerDigestCall.arguments;
    }
  }

  return null;
}
