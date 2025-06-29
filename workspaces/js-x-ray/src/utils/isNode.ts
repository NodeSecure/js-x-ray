// Import Third-party Dependencies
import type { ESTree } from "meriyah";

export function isNode(
  value: any
): value is ESTree.Node {
  return (
    value !== null &&
    typeof value === "object" &&
    "type" in value &&
    typeof value.type === "string"
  );
}
