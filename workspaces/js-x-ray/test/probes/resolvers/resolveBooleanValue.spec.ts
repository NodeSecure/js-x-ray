// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { resolveBooleanValue } from "../../../src/probes/resolvers/resolveBooleanValue.ts";
import type { LiteralIdentifier } from "../../../src/VariableTracer.ts";
import {
  parseScript,
  getExpressionFromStatementIf
} from "../../helpers.ts";

function getExpression(code: string) {
  const [astNode] = parseScript(code).body;

  return getExpressionFromStatementIf(astNode);
}

describe("resolveBooleanValue", () => {
  test("returns the value of a boolean literal node", () => {
    assert.strictEqual(resolveBooleanValue(getExpression("true"), new Map()), true);
    assert.strictEqual(resolveBooleanValue(getExpression("false"), new Map()), false);
  });

  test("resolves an identifier tracked back to a boolean literal assignment", () => {
    const node = getExpression("foo");
    const literalIdentifiers = new Map<string, LiteralIdentifier>([
      ["foo", { value: "true", type: "Literal" }]
    ]);

    assert.strictEqual(resolveBooleanValue(node, literalIdentifiers), true);
  });

  test("returns null for an identifier that is not tracked", () => {
    const node = getExpression("foo");

    assert.strictEqual(resolveBooleanValue(node, new Map()), null);
  });

  test("returns null for a string literal spelling a boolean", () => {
    const node = getExpression("'true'");

    assert.strictEqual(resolveBooleanValue(node, new Map()), null);
  });

  test("returns null for an identifier tracked back to a template literal", () => {
    const node = getExpression("foo");
    const literalIdentifiers = new Map<string, LiteralIdentifier>([
      ["foo", { value: "true", type: "TemplateLiteral" }]
    ]);

    assert.strictEqual(resolveBooleanValue(node, literalIdentifiers), null);
  });

  test("returns null for a node that is neither a literal nor an identifier", () => {
    const node = getExpression("foo()");

    assert.strictEqual(resolveBooleanValue(node, new Map()), null);
  });
});
