// Import Third-party Dependencies
import test from "tape";
import { IteratorMatcher } from "iterator-matcher";

// Import Internal Dependencies
import { getMemberExpressionIdentifier } from "../src/index.js";
import { codeToAst, createTracer, getExpressionFromStatement } from "./utils.js";

test("it must return all literals part of the given MemberExpression", (tape) => {
  const [astNode] = codeToAst("foo.bar.xd");
  const iter = getMemberExpressionIdentifier(
    getExpressionFromStatement(astNode)
  );

  const iterResult = new IteratorMatcher()
    .expect("foo")
    .expect("bar")
    .expect("xd")
    .execute(iter, { allowNoMatchingValues: false });

  tape.strictEqual(iterResult.isMatching, true);
  tape.strictEqual(iterResult.elapsedSteps, 3);
  tape.end();
});

test("it must return all computed properties of the given MemberExpression", (tape) => {
  const [astNode] = codeToAst("foo['bar']['xd']");
  const iter = getMemberExpressionIdentifier(
    getExpressionFromStatement(astNode)
  );

  const iterResult = new IteratorMatcher()
    .expect("foo")
    .expect("bar")
    .expect("xd")
    .execute(iter, { allowNoMatchingValues: false });

  tape.strictEqual(iterResult.isMatching, true);
  tape.strictEqual(iterResult.elapsedSteps, 3);

  tape.end();
});

test(`given a MemberExpression with a computed property containing a deep tree of BinaryExpression
  then it must return all literals parts even the last one which is the concatenation of the BinaryExpr`, (tape) => {
  const [astNode] = codeToAst("foo.bar[\"k\" + \"e\" + \"y\"]");
  const iter = getMemberExpressionIdentifier(
    getExpressionFromStatement(astNode)
  );

  const iterResult = new IteratorMatcher()
    .expect("foo")
    .expect("bar")
    .expect("key")
    .execute(iter, { allowNoMatchingValues: false });

  tape.strictEqual(iterResult.isMatching, true);
  tape.strictEqual(iterResult.elapsedSteps, 3);

  tape.end();
});

test(`given a MemberExpression with computed properties containing identifiers
  then it must return all literals values from the tracer`, (tape) => {
  const { tracer } = createTracer();
  tracer.literalIdentifiers.set("foo", "hello");
  tracer.literalIdentifiers.set("yo", "bar");

  const [astNode] = codeToAst("hey[foo][yo]");
  const iter = getMemberExpressionIdentifier(
    getExpressionFromStatement(astNode), { tracer }
  );

  const iterResult = new IteratorMatcher()
    .expect("hey")
    .expect("hello")
    .expect("bar")
    .execute(iter, { allowNoMatchingValues: false });

  tape.strictEqual(iterResult.isMatching, true);
  tape.strictEqual(iterResult.elapsedSteps, 3);

  tape.end();
});
