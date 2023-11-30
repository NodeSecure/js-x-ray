// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { getCallExpressionIdentifier } from "../src/index.js";
import { codeToAst, getExpressionFromStatement } from "./utils.js";

test("given a JavaScript eval CallExpression then it must return eval", (tape) => {
  const [astNode] = codeToAst("eval(\"this\");");
  const nodeIdentifier = getCallExpressionIdentifier(getExpressionFromStatement(astNode));

  tape.strictEqual(nodeIdentifier, "eval");
  tape.end();
});

test("given a JavaScript Function() CallExpression then it must return Function", (tape) => {
  const [astNode] = codeToAst("Function(\"return this\")();");
  const nodeIdentifier = getCallExpressionIdentifier(getExpressionFromStatement(astNode));

  tape.strictEqual(nodeIdentifier, "Function");
  tape.end();
});

test("given a JavaScript AssignmentExpression then it must return null", (tape) => {
  const [astNode] = codeToAst("foo = 10;");
  const nodeIdentifier = getCallExpressionIdentifier(getExpressionFromStatement(astNode));

  tape.strictEqual(nodeIdentifier, null);
  tape.end();
});
