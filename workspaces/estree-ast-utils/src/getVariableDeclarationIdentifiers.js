// Import Internal Dependencies
import { notNullOrUndefined } from "./utils/index.js";

export function* getVariableDeclarationIdentifiers(node, options = {}) {
  const { prefix = null } = options;

  switch (node.type) {
    case "VariableDeclaration": {
      for (const variableDeclarator of node.declarations) {
        yield* getVariableDeclarationIdentifiers(variableDeclarator.id);
      }

      break;
    }

    case "VariableDeclarator":
      yield* getVariableDeclarationIdentifiers(node.id);

      break;

    case "Identifier":
      yield { name: autoPrefix(node.name, prefix), assignmentId: node };

      break;

    case "Property": {
      if (node.kind !== "init") {
        break;
      }

      if (node.value.type === "ObjectPattern" || node.value.type === "ArrayPattern") {
        yield* getVariableDeclarationIdentifiers(node.value, {
          prefix: autoPrefix(node.key.name, prefix)
        });
        break;
      }

      let assignmentId = node.key;
      if (node.value.type === "Identifier") {
        assignmentId = node.value;
      }
      else if (node.value.type === "AssignmentPattern") {
        assignmentId = node.value.left;
      }

      yield { name: autoPrefix(node.key.name, prefix), assignmentId };

      break;
    }

    /**
     * Rest syntax (in ArrayPattern or ObjectPattern for example)
     * const [...foo] = []
     * const {...foo} = {}
     */
    case "RestElement":
      yield { name: autoPrefix(node.argument.name, prefix), assignmentId: node.argument };

      break;

    /**
     * (foo = 5)
     */
    case "AssignmentExpression":
      yield* getVariableDeclarationIdentifiers(node.left);

      break;

    /**
     * const [{ foo }] = []
     * const [foo = 10] = []
     *       ↪ Destructuration + Assignement of a default value
     */
    case "AssignmentPattern":
      if (node.left.type === "Identifier") {
        yield node.left.name;
      }
      else {
        yield* getVariableDeclarationIdentifiers(node.left);
      }

      break;

    /**
     * const [foo] = [];
     *       ↪ Destructuration of foo is an ArrayPattern
     */
    case "ArrayPattern":
      yield* node.elements
        .filter(notNullOrUndefined)
        .map((id) => [...getVariableDeclarationIdentifiers(id)]).flat();

      break;

    /**
     * const {foo} = {};
     *       ↪ Destructuration of foo is an ObjectPattern
     */
    case "ObjectPattern":
      yield* node.properties
        .filter(notNullOrUndefined)
        .map((property) => [...getVariableDeclarationIdentifiers(property)]).flat();

      break;
  }
}

function autoPrefix(name, prefix = null) {
  return typeof prefix === "string" ? `${prefix}.${name}` : name;
}
