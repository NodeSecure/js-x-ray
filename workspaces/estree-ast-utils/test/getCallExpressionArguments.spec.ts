// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getCallExpressionArguments } from "../src/index.js";
import {
  codeToAst,
  getExpressionFromStatement
} from "./utils.js";

describe("getCallExpressionArguments", () => {
  test("return null when the node is not a CallExpression", () => {
    const [astNode] = codeToAst("const a = 1;");
    const args = getCallExpressionArguments(
      astNode
    );
    assert.strictEqual(args, null);
  });

  test("return the first Literal Node of eval CallExpression", () => {
    const [astNode] = codeToAst("eval(\"this\");");
    const args = getCallExpressionArguments(
      getExpressionFromStatement(astNode)
    );

    assert.deepEqual(args, ["this"]);
  });

  test("return all Literal Nodes from the CallExpression", () => {
    const [astNode] = codeToAst("eval('1', foo(), '2', 10);");
    const args = getCallExpressionArguments(
      getExpressionFromStatement(astNode)
    );

    assert.deepEqual(args, ["1", "2"]);
  });

  test("resolve the BinaryExpression and return is Literal value", () => {
    const [astNode] = codeToAst("foo('1' + '2');");
    const args = getCallExpressionArguments(
      getExpressionFromStatement(astNode)
    );

    assert.deepEqual(args, ["12"]);
  });

  test("resolve Identifier using externalIdentifierLookup", () => {
    const literals = new Map([
      ["myVar", "hello world"]
    ]);

    const [astNode] = codeToAst("foo(myVar);");
    const args = getCallExpressionArguments(
      getExpressionFromStatement(astNode),
      {
        externalIdentifierLookup: (name) => literals.get(name) ?? null
      }
    );

    assert.deepEqual(args, ["hello world"]);
  });
});
