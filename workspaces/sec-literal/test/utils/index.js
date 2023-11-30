// @see https://github.com/estree/estree/blob/master/es5.md#literal
export function createLiteral(value, includeRaw = false) {
  const node = { type: "Literal", value };
  if (includeRaw) {
    node.raw = value;
  }

  return node;
}

