// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import { IteratorMatcher } from "iterator-matcher";

// Import Internal Dependencies
import { arrayExpressionToString } from "../src/index.js";
import { codeToAst, getExpressionFromStatement, createTracer } from "./utils.js";

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
  const { tracer } = createTracer();
  tracer.literalIdentifiers.set("foo", "1");
  tracer.literalIdentifiers.set("bar", "2");

  const [astNode] = codeToAst("[foo, bar]");
  const iter = arrayExpressionToString(getExpressionFromStatement(astNode), { tracer });

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
