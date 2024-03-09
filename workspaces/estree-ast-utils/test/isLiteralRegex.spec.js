// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { isLiteralRegex } from "../src/index.js";
import { codeToAst, getExpressionFromStatement } from "./utils.js";

test("given a Literal Regex Node it should return true", () => {
  const [astNode] = codeToAst("/^a/g");
  const isLRegex = isLiteralRegex(getExpressionFromStatement(astNode));

  assert.strictEqual(isLRegex, true);
});

test("given a RegexObject Node it should return false", () => {
  const [astNode] = codeToAst("new RegExp('^hello')");
  const isLRegex = isLiteralRegex(getExpressionFromStatement(astNode));

  assert.strictEqual(isLRegex, false);
});
