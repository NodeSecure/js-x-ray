// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { getCallExpressionArguments } from "../../src/estree/index.ts";
import {
  parseScript,
  getExpressionFromStatement
} from "../helpers.ts";

describe("getCallExpressionArguments", () => {
  test("return null when the node is not a CallExpression", () => {
    const [astNode] = parseScript("const a = 1;").body;
    const args = getCallExpressionArguments(
      astNode
    );
    assert.strictEqual(args, null);
  });

  test("return the first Literal Node of eval CallExpression", () => {
    const [astNode] = parseScript("eval(\"this\");").body;
    const args = getCallExpressionArguments(
      getExpressionFromStatement(astNode)
    );

    assert.deepEqual(args, ["this"]);
  });

  test("return all Literal Nodes from the CallExpression", () => {
    const [astNode] = parseScript("eval('1', foo(), '2', 10);").body;
    const args = getCallExpressionArguments(
      getExpressionFromStatement(astNode)
    );

    assert.deepEqual(args, ["1", "2"]);
  });

  test("resolve the BinaryExpression and return is Literal value", () => {
    const [astNode] = parseScript("foo('1' + '2');").body;
    const args = getCallExpressionArguments(
      getExpressionFromStatement(astNode)
    );

    assert.deepEqual(args, ["12"]);
  });

  test("resolve Identifier using externalIdentifierLookup", () => {
    const literals = new Map([
      ["myVar", "hello world"]
    ]);

    const [astNode] = parseScript("foo(myVar);").body;
    const args = getCallExpressionArguments(
      getExpressionFromStatement(astNode),
      {
        externalIdentifierLookup: (name: string) => literals.get(name) ?? null
      }
    );

    assert.deepEqual(args, ["hello world"]);
  });

  test("resolve the TemplateLiteral and return is Literal value", () => {
    /* eslint-disable-next-line no-template-curly-in-string */
    const [astNode] = parseScript("foo(`hello ${name}`);").body;
    const args = getCallExpressionArguments(
      getExpressionFromStatement(astNode)
    );

    /* eslint-disable-next-line no-template-curly-in-string */
    assert.deepEqual(args, ["hello ${0}"]);
  });
});
