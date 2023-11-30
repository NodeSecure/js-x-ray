export function isLiteralRegex(node) {
  return node.type === "Literal" && "regex" in node;
}
