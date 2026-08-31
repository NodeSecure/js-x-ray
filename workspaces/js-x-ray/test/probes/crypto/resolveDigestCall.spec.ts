// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { resolveDigestCall } from "../../../src/probes/crypto/resolveDigestCall.ts";
import {
  parseScript,
  getExpressionFromStatementIf
} from "../../helpers.ts";

function getExpression(code: string) {
  const [astNode] = parseScript(code).body;

  return getExpressionFromStatementIf(astNode);
}

describe("crypto.resolveDigestCall", () => {
  test("returns null when node is not a digest call", () => {
    const node = getExpression("hash.update('data')");

    assert.strictEqual(resolveDigestCall(node), null);
  });

  test("resolves a direct .digest(encoding) call", () => {
    const node = getExpression("hash.digest('hex')");

    const result = resolveDigestCall(node);

    assert.ok(result !== null);
    assert.strictEqual(result.encodingArguments.length, 1);
    assert.strictEqual((result.encodingArguments[0] as any).value, "hex");
  });

  test("resolves .digest().toString(encoding), using toString's arguments when digest has none", () => {
    const node = getExpression("hash.digest().toString('base64')");

    const result = resolveDigestCall(node);

    assert.ok(result !== null);
    assert.strictEqual(result.encodingArguments.length, 1);
    assert.strictEqual((result.encodingArguments[0] as any).value, "base64");
  });

  test("resolves .digest(encoding).toString(), preferring digest's own arguments", () => {
    const node = getExpression("hash.digest('hex').toString()");

    const result = resolveDigestCall(node);

    assert.ok(result !== null);
    assert.strictEqual(result.encodingArguments.length, 1);
    assert.strictEqual((result.encodingArguments[0] as any).value, "hex");
  });

  test("returns null for a .toString() call not wrapping a .digest() call", () => {
    const node = getExpression("hash.foo().toString('hex')");

    assert.strictEqual(resolveDigestCall(node), null);
  });

  test("returns null for null or undefined", () => {
    assert.strictEqual(resolveDigestCall(null), null);
    assert.strictEqual(resolveDigestCall(undefined), null);
  });
});
