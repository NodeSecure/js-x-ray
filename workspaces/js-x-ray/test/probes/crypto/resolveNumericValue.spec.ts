// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { resolveNumericValue } from "../../../src/probes/crypto/resolveNumericValue.ts";
import type { LiteralIdentifier } from "../../../src/VariableTracer.ts";
import {
  parseScript,
  getExpressionFromStatementIf
} from "../../helpers.ts";

function getExpression(code: string) {
  const [astNode] = parseScript(code).body;

  return getExpressionFromStatementIf(astNode);
}

describe("crypto.resolveNumericValue", () => {
  test("returns the value of a numeric literal node", () => {
    const node = getExpression("42");

    assert.strictEqual(resolveNumericValue(node, new Map()), 42);
  });

  test("resolves an identifier tracked back to a stringified numeric literal", () => {
    const node = getExpression("rounds");
    const literalIdentifiers = new Map<string, LiteralIdentifier>([
      ["rounds", { value: "10", type: "Literal" }]
    ]);

    assert.strictEqual(resolveNumericValue(node, literalIdentifiers), 10);
  });

  test("returns null when the tracked identifier does not resolve to a number", () => {
    const node = getExpression("salt");
    const literalIdentifiers = new Map<string, LiteralIdentifier>([
      ["salt", { value: "not-a-number", type: "Literal" }]
    ]);

    assert.strictEqual(resolveNumericValue(node, literalIdentifiers), null);
  });

  test("returns null for an identifier that is not tracked", () => {
    const node = getExpression("rounds");

    assert.strictEqual(resolveNumericValue(node, new Map()), null);
  });

  test("returns null for a node that is neither a literal nor an identifier", () => {
    const node = getExpression("foo()");

    assert.strictEqual(resolveNumericValue(node, new Map()), null);
  });

  test("returns null for a string literal", () => {
    const node = getExpression("'10'");

    assert.strictEqual(resolveNumericValue(node, new Map()), null);
  });

  test("resolves an identifier tracked to a stringified 0 as 0, not null", () => {
    const node = getExpression("rounds");
    const literalIdentifiers = new Map<string, LiteralIdentifier>([
      ["rounds", { value: "0", type: "Literal" }]
    ]);

    assert.strictEqual(resolveNumericValue(node, literalIdentifiers), 0);
  });

  test("returns the value of a direct numeric literal 0", () => {
    const node = getExpression("0");

    assert.strictEqual(resolveNumericValue(node, new Map()), 0);
  });

  test("known limitation: a negative literal is a UnaryExpression, not a Literal, so it resolves to null", () => {
    const node = getExpression("-10");

    assert.strictEqual(node.type, "UnaryExpression");
    assert.strictEqual(resolveNumericValue(node, new Map()), null);
  });
});
