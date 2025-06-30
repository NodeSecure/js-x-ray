// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import { IteratorMatcher } from "iterator-matcher";

// Import Internal Dependencies
import { getMemberExpressionIdentifier } from "../src/index.js";
import { codeToAst, getExpressionFromStatement } from "./utils.js";

test("it must return all literals part of the given MemberExpression", () => {
  const [astNode] = codeToAst("foo.bar.xd");
  const iter = getMemberExpressionIdentifier(
    getExpressionFromStatement(astNode)
  );

  const iterResult = new IteratorMatcher()
    .expect("foo")
    .expect("bar")
    .expect("xd")
    .execute(iter, { allowNoMatchingValues: false });

  assert.strictEqual(iterResult.isMatching, true);
  assert.strictEqual(iterResult.elapsedSteps, 3);
});

test("it must return all computed properties of the given MemberExpression", () => {
  const [astNode] = codeToAst("foo['bar']['xd']");
  const iter = getMemberExpressionIdentifier(
    getExpressionFromStatement(astNode)
  );

  const iterResult = new IteratorMatcher()
    .expect("foo")
    .expect("bar")
    .expect("xd")
    .execute(iter, { allowNoMatchingValues: false });

  assert.strictEqual(iterResult.isMatching, true);
  assert.strictEqual(iterResult.elapsedSteps, 3);
});

test(`given a MemberExpression with a computed property containing a deep tree of BinaryExpression
  then it must return all literals parts even the last one which is the concatenation of the BinaryExpr`, () => {
  const [astNode] = codeToAst("foo.bar[\"k\" + \"e\" + \"y\"]");
  const iter = getMemberExpressionIdentifier(
    getExpressionFromStatement(astNode)
  );

  const iterResult = new IteratorMatcher()
    .expect("foo")
    .expect("bar")
    .expect("key")
    .execute(iter, { allowNoMatchingValues: false });

  assert.strictEqual(iterResult.isMatching, true);
  assert.strictEqual(iterResult.elapsedSteps, 3);
});

test(`given a MemberExpression with computed properties containing identifiers
  then it must return all literals values from the tracer`, () => {
  const literalIdentifiers = new Map<string, string>();
  literalIdentifiers.set("foo", "hello");
  literalIdentifiers.set("yo", "bar");

  const [astNode] = codeToAst("hey[foo][yo]");
  const iter = getMemberExpressionIdentifier(
    getExpressionFromStatement(astNode),
    {
      externalIdentifierLookup: (name: string) => literalIdentifiers.get(name) ?? null
    }
  );

  const iterResult = new IteratorMatcher()
    .expect("hey")
    .expect("hello")
    .expect("bar")
    .execute(iter, { allowNoMatchingValues: false });

  assert.strictEqual(iterResult.isMatching, true);
  assert.strictEqual(iterResult.elapsedSteps, 3);
});
