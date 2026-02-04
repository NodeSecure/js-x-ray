// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Third-party Dependencies
import { IteratorMatcher } from "iterator-matcher";

// Import Internal Dependencies
import { concatBinaryExpression } from "../../src/estree/index.ts";
import { parseScript, getExpressionFromStatement } from "../helpers.ts";

test("given a BinaryExpression of two literals then the iterable must return Literal values", () => {
  const [astNode] = parseScript("'foo' + 'bar' + 'xd'").body;
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
  const [astNode] = parseScript("['A'] + ['B']").body;
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

  const [astNode] = parseScript("foo + bar").body;
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

  const [astNode] = parseScript("evil() + 's'").body;
  try {
    const iter = concatBinaryExpression(getExpressionFromStatement(astNode), {
      externalIdentifierLookup: (name: string) => literalIdentifiers.get(name) ?? null,
      stopOnUnsupportedNode: true
    });
    iter.next();
  }
  catch (error) {
    assert.strictEqual((error as Error).message, "concatBinaryExpression:: Unsupported node detected");
  }
});

test("given a Deep BinaryExpression with an unsupported node it should throw an Error", () => {
  const literalIdentifiers = new Map<string, string>();

  const [astNode] = parseScript("'a' + evil() + 's'").body;
  try {
    const iter = concatBinaryExpression(getExpressionFromStatement(astNode), {
      externalIdentifierLookup: (name: string) => literalIdentifiers.get(name) ?? null,
      stopOnUnsupportedNode: true
    });
    iter.next();
  }
  catch (error) {
    assert.strictEqual((error as Error).message, "concatBinaryExpression:: Unsupported node detected");
  }
});
