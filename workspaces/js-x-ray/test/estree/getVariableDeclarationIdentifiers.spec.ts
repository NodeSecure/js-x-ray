// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { getVariableDeclarationIdentifiers } from "../../src/estree/index.ts";
import {
  parseScript,
  getExpressionFromStatementIf
} from "../helpers.ts";

describe("getVariableDeclarationIdentifiers", () => {
  test("return empty array when the node is not a VariableDeclaration", () => {
    const [astNode] = parseScript("foobar();").body;
    const iter = getVariableDeclarationIdentifiers(
      getExpressionFromStatementIf(astNode)
    );

    assert.deepEqual(Array.from(iter), []);
  });

  test("return the Identifier from VariableDeclaration", () => {
    const [astNode] = parseScript("const a = 1;").body;
    const iter = getVariableDeclarationIdentifiers(
      getExpressionFromStatementIf(astNode)
    );
    const idNames = Array
      .from(iter)
      .map((value) => value.name);

    assert.deepEqual(idNames, ["a"]);
  });

  test("return all Identifiers from VariableDeclaration", () => {
    const [astNode] = parseScript("const a = 1, b = 2;").body;
    const iter = getVariableDeclarationIdentifiers(
      getExpressionFromStatementIf(astNode)
    );
    const idNames = Array.from(iter)
      .map((value) => value.name);

    assert.deepEqual(idNames, ["a", "b"]);
  });

  test("return the Identifier 'foo' from: RestElement, ArrayPattern, ObjectPattern, AssignmentPattern", () => {
    const cases = [
      "const [...foo] = []",
      "const { ...foo } = {}",
      "const [foo] = []",
      "const { foo } = {}",
      "const [{ foo }] = []",
      "const [foo = 10] = []"
    ];

    for (const code of cases) {
      const [astNode] = parseScript(code).body;
      const iter = getVariableDeclarationIdentifiers(
        getExpressionFromStatementIf(astNode)
      );
      const idNames = Array.from(iter)
        .map((value) => value.name);

      assert.deepEqual(idNames, ["foo"]);
    }
  });

  test("return multiple Identifiers of ArrayPattern or ObjectPattern", () => {
    const cases = [
      "const [ foo, bar ] = []",
      "const { foo, bar } = {}"
    ];

    for (const code of cases) {
      const [astNode] = parseScript(code).body;
      const iter = getVariableDeclarationIdentifiers(
        getExpressionFromStatementIf(astNode)
      );
      const idNames = Array.from(iter)
        .map((value) => value.name);

      assert.deepEqual(idNames, ["foo", "bar"]);
    }
  });

  test("return deeply destructured Identifier", () => {
    const [astNode] = parseScript("const { hello: { world } } = {}").body;
    const iter = getVariableDeclarationIdentifiers(
      getExpressionFromStatementIf(astNode)
    );
    const idNames = Array.from(iter)
      .map((value) => value.name);

    assert.deepEqual(idNames, ["hello.world"]);
  });

  test("return the Identifier in an AssignmentExpression", () => {
    const [astNode] = parseScript("(foo = 5)").body;
    const iter = getVariableDeclarationIdentifiers(
      getExpressionFromStatementIf(astNode)
    );
    const idNames = Array.from(iter)
      .map((value) => value.name);

    assert.deepEqual(idNames, ["foo"]);
  });

  test("return all Identifiers of a SequenceExpression", () => {
    const [astNode] = parseScript("(foo = 5, bar = null)").body;
    const iter = getVariableDeclarationIdentifiers(
      getExpressionFromStatementIf(astNode)
    );
    const idNames = Array.from(iter)
      .map((value) => value.name);

    assert.deepEqual(idNames, ["foo", "bar"]);
  });

  test("return the Property identifiers of a given ObjectExpression", () => {
    const [astNode] = parseScript("({ foo: 1, bar: 2 });").body;
    const iter = getVariableDeclarationIdentifiers(
      getExpressionFromStatementIf(astNode)
    );
    const idNames = Array.from(iter)
      .map((value) => value.name);

    assert.deepEqual(idNames, ["foo", "bar"]);
  });

  test("return the Identifiers of VariableDeclarator id and init", () => {
    const [astNode] = parseScript("const hello = { foo: 1, bar: 2 };").body;
    const iter = getVariableDeclarationIdentifiers(
      getExpressionFromStatementIf(astNode)
    );
    const idNames = Array.from(iter)
      .map((value) => value.name);

    assert.deepEqual(idNames, ["hello", "foo", "bar"]);
  });
});
