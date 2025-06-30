// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import { IteratorMatcher } from "iterator-matcher";

// Import Internal Dependencies
import { concatBinaryExpression } from "../src/index.js";
import { codeToAst, getExpressionFromStatement } from "./utils.js";

test("given a BinaryExpression of two literals then the iterable must return Literal values", () => {
  const [astNode] = codeToAst("'foo' + 'bar' + 'xd'");
  const iter = concatBinaryExpression(getExpressionFromStatement(astNode));

  const iterResult = new IteratorMatcher()
    .expect("foo")
    .expect("bar")
    .expect("xd")
    .execute(iter, { allowNoMatchingValues: false });

  assert.strictEqual(iterResult.isMatching, true);
  assert.strictEqual(iterResult.elapsedSteps, 3);
});

test("given a BinaryExpression of two ArrayExpression then the iterable must return Array values as string", () => {
  const [astNode] = codeToAst("['A'] + ['B']");
  const iter = concatBinaryExpression(getExpressionFromStatement(astNode));

  const iterResult = new IteratorMatcher()
    .expect("A")
    .expect("B")
    .execute(iter, { allowNoMatchingValues: false });

  assert.strictEqual(iterResult.isMatching, true);
  assert.strictEqual(iterResult.elapsedSteps, 2);
});

test("given a BinaryExpression of two Identifiers then the iterable must the tracer values", () => {
  const literalIdentifiers = new Map<string, string>();
  literalIdentifiers.set("foo", "A");
  literalIdentifiers.set("bar", "B");

  const [astNode] = codeToAst("foo + bar");
  const iter = concatBinaryExpression(
    getExpressionFromStatement(astNode),
    {
      externalIdentifierLookup: (name: string) => literalIdentifiers.get(name) ?? null
    }
  );

  const iterResult = new IteratorMatcher()
    .expect("A")
    .expect("B")
    .execute(iter, { allowNoMatchingValues: false });

  assert.strictEqual(iterResult.isMatching, true);
  assert.strictEqual(iterResult.elapsedSteps, 2);
});

test("given a one level BinaryExpression with an unsupported node it should throw an Error", () => {
  const literalIdentifiers = new Map<string, string>();

  const [astNode] = codeToAst("evil() + 's'");
  try {
    const iter = concatBinaryExpression(getExpressionFromStatement(astNode), {
      externalIdentifierLookup: (name: string) => literalIdentifiers.get(name) ?? null,
      stopOnUnsupportedNode: true
    });
    iter.next();
  }
  catch (error) {
    assert.strictEqual(error.message, "concatBinaryExpression:: Unsupported node detected");
  }
});

test("given a Deep BinaryExpression with an unsupported node it should throw an Error", () => {
  const literalIdentifiers = new Map<string, string>();

  const [astNode] = codeToAst("'a' + evil() + 's'");
  try {
    const iter = concatBinaryExpression(getExpressionFromStatement(astNode), {
      externalIdentifierLookup: (name: string) => literalIdentifiers.get(name) ?? null,
      stopOnUnsupportedNode: true
    });
    iter.next();
  }
  catch (error) {
    assert.strictEqual(error.message, "concatBinaryExpression:: Unsupported node detected");
  }
});
