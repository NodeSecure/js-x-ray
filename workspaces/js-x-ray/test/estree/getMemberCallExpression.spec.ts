// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { getMemberCallExpression } from "../../src/estree/index.ts";
import {
  parseScript,
  getExpressionFromStatementIf
} from "../helpers.ts";

describe("estree.getMemberCallExpression", () => {
  test("return null for null or undefined", () => {
    assert.strictEqual(getMemberCallExpression(null, "digest"), null);
    assert.strictEqual(getMemberCallExpression(undefined, "digest"), null);
  });

  test("return null when node is not a CallExpression", () => {
    const [astNode] = parseScript("foo.bar").body;

    assert.strictEqual(
      getMemberCallExpression(getExpressionFromStatementIf(astNode), "bar"),
      null
    );
  });

  test("return null when callee is a plain Identifier, not a MemberExpression", () => {
    const [astNode] = parseScript("digest()").body;

    assert.strictEqual(
      getMemberCallExpression(getExpressionFromStatementIf(astNode), "digest"),
      null
    );
  });

  test("return null when method name does not match", () => {
    const [astNode] = parseScript("hash.update('data')").body;

    assert.strictEqual(
      getMemberCallExpression(getExpressionFromStatementIf(astNode), "digest"),
      null
    );
  });

  test("return null when property is computed", () => {
    const [astNode] = parseScript("hash['digest']()").body;

    assert.strictEqual(
      getMemberCallExpression(getExpressionFromStatementIf(astNode), "digest"),
      null
    );
  });

  test("return the node when method name matches", () => {
    const [astNode] = parseScript("hash.digest('hex')").body;
    const node = getExpressionFromStatementIf(astNode);

    const result = getMemberCallExpression(node, "digest");

    assert.ok(result !== null);
    assert.strictEqual(result.type, "CallExpression");
    assert.strictEqual(result.callee.type, "MemberExpression");
    assert.strictEqual((result.callee.property as any).name, "digest");
  });

  test("returned node carries the original arguments", () => {
    const [astNode] = parseScript("hash.digest('hex')").body;
    const node = getExpressionFromStatementIf(astNode);

    const result = getMemberCallExpression(node, "digest")!;

    assert.strictEqual(result.arguments.length, 1);
    assert.strictEqual((result.arguments[0] as any).value, "hex");
  });

  test("return the node for chained member call", () => {
    const [astNode] = parseScript("crypto.createHash('sha256').digest('hex')").body;
    const node = getExpressionFromStatementIf(astNode);

    const result = getMemberCallExpression(node, "digest");

    assert.ok(result !== null);
    assert.strictEqual((result.callee.property as any).name, "digest");
  });
});
