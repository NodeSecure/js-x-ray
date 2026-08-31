// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { getMemberCallExpression, type MemberCallExpression } from "../../estree/index.ts";

export interface DigestCallMatch {
  digestCall: MemberCallExpression;
  encodingArguments: ESTree.Node[];
}

export function resolveDigestCall(
  hashNode: ESTree.Node | null | undefined
): DigestCallMatch | null {
  const digestCall = getMemberCallExpression(hashNode, "digest");
  if (digestCall) {
    return { digestCall, encodingArguments: digestCall.arguments };
  }

  const toStringCall = getMemberCallExpression(hashNode, "toString");
  if (toStringCall) {
    const innerDigestCall = getMemberCallExpression(toStringCall.callee.object, "digest");
    if (innerDigestCall) {
      return {
        digestCall: innerDigestCall,
        encodingArguments: innerDigestCall.arguments.length === 0
          ? toStringCall.arguments
          : innerDigestCall.arguments
      };
    }
  }

  return null;
}
