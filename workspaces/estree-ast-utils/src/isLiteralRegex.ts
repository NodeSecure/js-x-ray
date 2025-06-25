// Import Internal Dependencies
import type { NodeAst } from "./types.js";

export function isLiteralRegex(
  node: NodeAst
): boolean {
  return node.type === "Literal" && "regex" in node;
}
