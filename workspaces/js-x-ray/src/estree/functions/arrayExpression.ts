// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import {
  getMemberExpressionIdentifier
} from "./getMemberExpressionIdentifier.ts";
import {
  isCallExpression,
  isLiteral,
  isNode,
  noop,
  type DefaultOptions
} from "../types.ts";

export interface ArrayExpressionToStringOptions extends DefaultOptions {
  /**
   * When enabled, resolves the char code of the literal value.
   *
   * @default true
   * @example
   * [65, 66] // => ['A', 'B']
   */
  resolveCharCode?: boolean;
}

export function* arrayExpressionToString(
  node: ESTree.Node | null,
  options: ArrayExpressionToStringOptions = {}
): IterableIterator<string> {
  const {
    externalIdentifierLookup = noop,
    resolveCharCode = true
  } = options;

  if (!isNode(node) || node.type !== "ArrayExpression") {
    return;
  }

  for (const row of node.elements) {
    if (row === null) {
      continue;
    }

    switch (row.type) {
      case "Literal": {
        if (
          row.value === ""
        ) {
          continue;
        }

        if (resolveCharCode) {
          const value = Number(row.value);
          yield Number.isNaN(value) ?
            String(row.value) :
            String.fromCharCode(value);
        }
        else {
          yield String(row.value);
        }

        break;
      }
      case "Identifier": {
        const identifier = externalIdentifierLookup(row.name);
        if (identifier !== null) {
          yield identifier;
        }
        break;
      }
      case "CallExpression": {
        const value = joinArrayExpression(row, {
          externalIdentifierLookup
        });
        if (value !== null) {
          yield value;
        }
        break;
      }
    }
  }
}

export function joinArrayExpression(
  node: ESTree.Node | null,
  options: DefaultOptions = {}
): string | null {
  if (!isCallExpression(node)) {
    return null;
  }

  if (
    node.arguments.length !== 1 ||
    (
      node.callee.type !== "MemberExpression" ||
      node.callee.object.type !== "ArrayExpression"
    )
  ) {
    return null;
  }

  const id = Array.from(
    getMemberExpressionIdentifier(node.callee)
  ).join(".");
  if (
    id !== "join" ||
    !isLiteral(node.arguments[0])
  ) {
    return null;
  }

  const separator = node.arguments[0].value;

  const iter = arrayExpressionToString(
    node.callee.object,
    {
      ...options,
      resolveCharCode: false
    }
  );

  return [...iter].join(separator);
}
