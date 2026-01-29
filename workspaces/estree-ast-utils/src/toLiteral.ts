// Import Third-party Dependencies
import type { ESTree } from "meriyah";

export function toLiteral(templateLiteral: ESTree.TemplateLiteral) {
  return templateLiteral.quasis.map(({ tail, value: { raw } }, i) => (tail ? raw : `${raw}\${${i}}`)).join("");
}

