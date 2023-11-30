// Import Third-party Dependencies
import test from "tape";
import { IteratorMatcher } from "iterator-matcher";

// Import Internal Dependencies
import { concatBinaryExpression } from "../src/index.js";
import { codeToAst, getExpressionFromStatement, createTracer } from "./utils.js";

test("given a BinaryExpression of two literals then the iterable must return Literal values", (tape) => {
  const [astNode] = codeToAst("'foo' + 'bar' + 'xd'");
  const iter = concatBinaryExpression(getExpressionFromStatement(astNode));

  const iterResult = new IteratorMatcher()
    .expect("foo")
    .expect("bar")
    .expect("xd")
    .execute(iter, { allowNoMatchingValues: false });

  tape.strictEqual(iterResult.isMatching, true);
  tape.strictEqual(iterResult.elapsedSteps, 3);
  tape.end();
});

test("given a BinaryExpression of two ArrayExpression then the iterable must return Array values as string", (tape) => {
  const [astNode] = codeToAst("['A'] + ['B']");
  const iter = concatBinaryExpression(getExpressionFromStatement(astNode));

  const iterResult = new IteratorMatcher()
    .expect("A")
    .expect("B")
    .execute(iter, { allowNoMatchingValues: false });

  tape.strictEqual(iterResult.isMatching, true);
  tape.strictEqual(iterResult.elapsedSteps, 2);
  tape.end();
});

test("given a BinaryExpression of two Identifiers then the iterable must the tracer values", (tape) => {
  const { tracer } = createTracer();
  tracer.literalIdentifiers.set("foo", "A");
  tracer.literalIdentifiers.set("bar", "B");

  const [astNode] = codeToAst("foo + bar");
  const iter = concatBinaryExpression(getExpressionFromStatement(astNode), { tracer });

  const iterResult = new IteratorMatcher()
    .expect("A")
    .expect("B")
    .execute(iter, { allowNoMatchingValues: false });

  tape.strictEqual(iterResult.isMatching, true);
  tape.strictEqual(iterResult.elapsedSteps, 2);
  tape.end();
});

test("given a one level BinaryExpression with an unsupported node it should throw an Error", (tape) => {
  tape.plan(1);
  const { tracer } = createTracer();

  const [astNode] = codeToAst("evil() + 's'");
  try {
    const iter = concatBinaryExpression(getExpressionFromStatement(astNode), {
      tracer,
      stopOnUnsupportedNode: true
    });
    iter.next();
  }
  catch (error) {
    tape.strictEqual(error.message, "concatBinaryExpression:: Unsupported node detected");
  }

  tape.end();
});

test("given a Deep BinaryExpression with an unsupported node it should throw an Error", (tape) => {
  tape.plan(1);
  const { tracer } = createTracer();

  const [astNode] = codeToAst("'a' + evil() + 's'");
  try {
    const iter = concatBinaryExpression(getExpressionFromStatement(astNode), {
      tracer,
      stopOnUnsupportedNode: true
    });
    iter.next();
  }
  catch (error) {
    tape.strictEqual(error.message, "concatBinaryExpression:: Unsupported node detected");
  }

  tape.end();
});
