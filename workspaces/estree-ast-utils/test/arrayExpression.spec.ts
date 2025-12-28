// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Third-party Dependencies
import { IteratorMatcher } from "iterator-matcher";

// Import Internal Dependencies
import {
  arrayExpressionToString,
  joinArrayExpression
} from "../src/index.ts";
import {
  codeToAst,
  getExpressionFromStatement,
  getExpressionFromStatementIf
} from "./utils.ts";

describe("arrayExpressionToString", () => {
  test("given an ArrayExpression with two Literals then the iterable must return them one by one", () => {
    const [astNode] = codeToAst("['foo', 'bar']");
    const iter = arrayExpressionToString(getExpressionFromStatement(astNode));

    const iterResult = new IteratorMatcher()
      .expect("foo")
      .expect("bar")
      .execute(iter, { allowNoMatchingValues: false });

    assert.strictEqual(iterResult.isMatching, true);
    assert.strictEqual(iterResult.elapsedSteps, 2);
  });

  test("given an ArrayExpression with two Identifiers then the iterable must return value from the Tracer", () => {
    const literalIdentifiers = new Map<string, string>();
    literalIdentifiers.set("foo", "1");
    literalIdentifiers.set("bar", "2");

    const [astNode] = codeToAst("[foo, bar]");
    const iter = arrayExpressionToString(
      getExpressionFromStatement(astNode),
      {
        externalIdentifierLookup: (name: string) => literalIdentifiers.get(name) ?? null
      }
    );

    const iterResult = new IteratorMatcher()
      .expect("1")
      .expect("2")
      .execute(iter, { allowNoMatchingValues: false });

    assert.strictEqual(iterResult.isMatching, true);
    assert.strictEqual(iterResult.elapsedSteps, 2);
  });

  test(`given an ArrayExpression with two numbers
    then the function must convert them as char code
    and return them in the iterable`, () => {
    const [astNode] = codeToAst("[65, 66]");
    const iter = arrayExpressionToString(getExpressionFromStatement(astNode));

    const iterResult = new IteratorMatcher()
      .expect("A")
      .expect("B")
      .execute(iter, { allowNoMatchingValues: false });

    assert.strictEqual(iterResult.isMatching, true);
    assert.strictEqual(iterResult.elapsedSteps, 2);
  });

  test("given an ArrayExpression with empty Literals then the iterable must return no values", () => {
    const [astNode] = codeToAst("['', '']");
    const iter = arrayExpressionToString(getExpressionFromStatement(astNode));

    const iterResult = [...iter];

    assert.strictEqual(iterResult.length, 0);
  });

  test("given an AST that is not an ArrayExpression then it must return immediately", () => {
    const [astNode] = codeToAst("const foo = 5;");
    const iter = arrayExpressionToString(astNode);

    const iterResult = [...iter];

    assert.strictEqual(iterResult.length, 0);
  });
});

describe("joinArrayExpression", () => {
  test("should return null if the node is not a CallExpression", () => {
    const [ast] = codeToAst("const a = 1;");
    assert.strictEqual(
      joinArrayExpression(getExpressionFromStatementIf(ast)),
      null
    );
  });

  test("should combine and return the IP", () => {
    const [ast] = codeToAst(`["127","0","0","1"].join(".");`);
    assert.strictEqual(
      joinArrayExpression(getExpressionFromStatementIf(ast)),
      "127.0.0.1"
    );
  });

  test("should combine multiple depth of joined ArrayExpression", () => {
    const [ast] = codeToAst(`[
      ["hello", "world"].join(" "),
      "0",
      "0",
      "1"
    ].join(".");`);
    assert.strictEqual(
      joinArrayExpression(getExpressionFromStatementIf(ast)),
      "hello world.0.0.1"
    );
  });

  test("should look for external identifiers and join the two variables of the ArrayExpression", () => {
    const literalIdentifiers = new Map<string, string>();
    literalIdentifiers.set("a", "1");
    literalIdentifiers.set("b", "2");

    const [ast] = codeToAst("[a, b].join('.');");
    assert.strictEqual(
      joinArrayExpression(
        getExpressionFromStatementIf(ast),
        {
          externalIdentifierLookup: (name: string) => literalIdentifiers.get(name) ?? null
        }
      ),
      "1.2"
    );
  });
});
