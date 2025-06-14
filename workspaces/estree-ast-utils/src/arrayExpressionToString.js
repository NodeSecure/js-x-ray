/**
 * @typedef {import('@nodesecure/tracer').VariableTracer} VariableTracer
 */

/**
 * @param {*} node
 * @param {object} options
 * @param {VariableTracer} [options.tracer=null]
 * @returns {IterableIterator<string>}
 */

export function* arrayExpressionToString(node, options = {}) {
  const { tracer = null } = options;

  if (!node || node.type !== "ArrayExpression") {
    return;
  }

  for (const row of node.elements) {
    switch (row.type) {
      case "Literal": {
        if (row.value === "") {
          continue;
        }

        const value = Number(row.value);
        yield Number.isNaN(value) ? row.value : String.fromCharCode(value);
        break;
      }
      case "Identifier": {
        if (tracer !== null && tracer.literalIdentifiers.has(row.name)) {
          yield tracer.literalIdentifiers.get(row.name);
        }
        break;
      }
    }
  }
}
