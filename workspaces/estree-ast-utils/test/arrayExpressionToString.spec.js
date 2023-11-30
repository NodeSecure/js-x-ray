// Import Third-party Dependencies
import test from "tape";
import { IteratorMatcher } from "iterator-matcher";

// Import Internal Dependencies
import { arrayExpressionToString } from "../src/index.js";
import { codeToAst, getExpressionFromStatement, createTracer } from "./utils.js";

test("given an ArrayExpression with two Literals then the iterable must return them one by one", (tape) => {
  const [astNode] = codeToAst("['foo', 'bar']");
  const iter = arrayExpressionToString(getExpressionFromStatement(astNode));

  const iterResult = new IteratorMatcher()
    .expect("foo")
    .expect("bar")
    .execute(iter, { allowNoMatchingValues: false });

  tape.strictEqual(iterResult.isMatching, true);
  tape.strictEqual(iterResult.elapsedSteps, 2);
  tape.end();
});

test("given an ArrayExpression with two Identifiers then the iterable must return value from the Tracer", (tape) => {
  const { tracer } = createTracer();
  tracer.literalIdentifiers.set("foo", "1");
  tracer.literalIdentifiers.set("bar", "2");

  const [astNode] = codeToAst("[foo, bar]");
  const iter = arrayExpressionToString(getExpressionFromStatement(astNode), { tracer });

  const iterResult = new IteratorMatcher()
    .expect("1")
    .expect("2")
    .execute(iter, { allowNoMatchingValues: false });

  tape.strictEqual(iterResult.isMatching, true);
  tape.strictEqual(iterResult.elapsedSteps, 2);
  tape.end();
});

test(`given an ArrayExpression with two numbers
  then the function must convert them as char code
  and return them in the iterable`, (tape) => {
  const [astNode] = codeToAst("[65, 66]");
  const iter = arrayExpressionToString(getExpressionFromStatement(astNode));

  const iterResult = new IteratorMatcher()
    .expect("A")
    .expect("B")
    .execute(iter, { allowNoMatchingValues: false });

  tape.strictEqual(iterResult.isMatching, true);
  tape.strictEqual(iterResult.elapsedSteps, 2);
  tape.end();
});

test("given an ArrayExpression with empty Literals then the iterable must return no values", (tape) => {
  const [astNode] = codeToAst("['', '']");
  const iter = arrayExpressionToString(getExpressionFromStatement(astNode));

  const iterResult = [...iter];

  tape.strictEqual(iterResult.length, 0);
  tape.end();
});

test("given an AST that is not an ArrayExpression then it must return immediately", (tape) => {
  const [astNode] = codeToAst("const foo = 5;");
  const iter = arrayExpressionToString(astNode);

  const iterResult = [...iter];

  tape.strictEqual(iterResult.length, 0);
  tape.end();
});
