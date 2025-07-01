// Import Third-party Dependencies
import * as meriyah from "meriyah";

export function codeToAst(
  code: string
) {
  const estreeRootNode = meriyah.parseScript(code, {
    next: true,
    loc: true,
    raw: true,
    module: true,
    globalReturn: false
  });

  return estreeRootNode.body;
}

export function getExpressionFromStatement(node: any) {
  return node.type === "ExpressionStatement" ? node.expression : null;
}

export function getExpressionFromStatementIf(node: any) {
  return node.type === "ExpressionStatement" ? node.expression : node;
}
