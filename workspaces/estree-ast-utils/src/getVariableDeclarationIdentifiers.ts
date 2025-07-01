// Import Third-party Dependencies
import type { ESTree } from "meriyah";

export interface GetVariableDeclarationIdentifiersOptions {
  /**
   * Prefix to add to the variable name.
   * @default void
   */
  prefix?: string;
}

export function* getVariableDeclarationIdentifiers(
  node: ESTree.Node,
  options: GetVariableDeclarationIdentifiersOptions = {}
): IterableIterator<{
    name: string;
    assignmentId: ESTree.Identifier;
  }> {
  const { prefix = null } = options;

  switch (node.type) {
    case "VariableDeclaration": {
      for (const variableDeclarator of node.declarations) {
        yield* getVariableDeclarationIdentifiers(
          variableDeclarator,
          options
        );
      }

      break;
    }

    case "VariableDeclarator":
      yield* getVariableDeclarationIdentifiers(
        node.id,
        options
      );
      if (node.init !== null) {
        yield* getVariableDeclarationIdentifiers(
          node.init,
          options
        );
      }

      break;

    case "Identifier":
      yield {
        name: autoPrefix(node.name, prefix),
        assignmentId: node
      };

      break;

    case "Property": {
      if (node.kind !== "init" || node.key.type !== "Identifier") {
        break;
      }

      if (
        node.value.type === "ObjectPattern" ||
        node.value.type === "ArrayPattern"
      ) {
        yield* getVariableDeclarationIdentifiers(node.value, {
          prefix: autoPrefix(node.key.name, prefix)
        });
        break;
      }

      let assignmentId = node.key;
      if (node.value.type === "Identifier") {
        assignmentId = node.value;
      }
      else if (
        node.value.type === "AssignmentPattern" &&
        node.value.left.type === "Identifier"
      ) {
        assignmentId = node.value.left;
      }

      yield {
        name: autoPrefix(node.key.name, prefix),
        assignmentId
      };

      break;
    }

    /**
     * Rest syntax (in ArrayPattern or ObjectPattern for example)
     * const [...foo] = []
     * const {...foo} = {}
     */
    case "RestElement":
      if (node.argument.type === "Identifier") {
        yield {
          name: autoPrefix(node.argument.name, prefix),
          assignmentId: node.argument
        };
      }

      break;

    /**
     * ({ foo: 5, bar: null })
     */
    case "ObjectExpression": {
      for (const property of node.properties) {
        yield* getVariableDeclarationIdentifiers(property, options);
      }
      break;
    }

    /**
     * (foo = 5, bar = null)
     */
    case "SequenceExpression": {
      for (const expr of node.expressions) {
        yield* getVariableDeclarationIdentifiers(expr, options);
      }
      break;
    }

    /**
     * (foo = 5)
     */
    case "AssignmentExpression":
      yield* getVariableDeclarationIdentifiers(node.left, options);

      break;

    /**
     * const [{ foo }] = []
     * const [foo = 10] = []
     *       ↪ Destructuration + Assignement of a default value
     */
    case "AssignmentPattern":
      if (node.left.type === "Identifier") {
        yield { name: node.left.name, assignmentId: node.left };
      }
      else {
        yield* getVariableDeclarationIdentifiers(node.left, options);
      }

      break;

    /**
     * const [foo] = [];
     *       ↪ Destructuration of foo is an ArrayPattern
     */
    case "ArrayPattern":
      yield* node.elements
        .filter(notNullOrUndefined)
        .map((id) => [...getVariableDeclarationIdentifiers(id, options)]).flat();

      break;

    /**
     * const {foo} = {};
     *       ↪ Destructuration of foo is an ObjectPattern
     */
    case "ObjectPattern":
      yield* node.properties
        .filter(notNullOrUndefined)
        .map((property) => [...getVariableDeclarationIdentifiers(property, options)]).flat();

      break;
  }
}

function autoPrefix(
  name: string,
  prefix: string | null = null
) {
  return typeof prefix === "string" ? `${prefix}.${name}` : name;
}

function notNullOrUndefined(
  value: any
): value is NonNullable<any> {
  return value !== null && value !== void 0;
}
