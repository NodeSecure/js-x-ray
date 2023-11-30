// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { isLiteralRegex } from "../src/index.js";
import { codeToAst, getExpressionFromStatement } from "./utils.js";

test("given a Literal Regex Node it should return true", (tape) => {
  const [astNode] = codeToAst("/^a/g");
  const isLRegex = isLiteralRegex(getExpressionFromStatement(astNode));

  tape.strictEqual(isLRegex, true);
  tape.end();
});

test("given a RegexObject Node it should return false", (tape) => {
  const [astNode] = codeToAst("new RegExp('^hello')");
  const isLRegex = isLiteralRegex(getExpressionFromStatement(astNode));

  tape.strictEqual(isLRegex, false);
  tape.end();
});
