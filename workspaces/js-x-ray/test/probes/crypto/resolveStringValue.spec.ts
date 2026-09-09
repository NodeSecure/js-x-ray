// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { resolveStringValue } from "../../../src/probes/crypto/resolveStringValue.ts";
import type { LiteralIdentifier } from "../../../src/VariableTracer.ts";
import {
  parseScript,
  getExpressionFromStatementIf
} from "../../helpers.ts";

function getExpression(code: string) {
  const [astNode] = parseScript(code).body;

  return getExpressionFromStatementIf(astNode);
}

describe("crypto.resolveStringValue", () => {
  test("returns the value of a string literal node", () => {
    const node = getExpression("'hello'");

    assert.strictEqual(resolveStringValue(node, new Map()), "hello");
  });

  test("resolves an identifier tracked back to a literal assignment", () => {
    const node = getExpression("foo");
    const literalIdentifiers = new Map<string, LiteralIdentifier>([
      ["foo", { value: "bar", type: "Literal" }]
    ]);

    assert.strictEqual(resolveStringValue(node, literalIdentifiers), "bar");
  });

  test("returns null for an identifier that is not tracked", () => {
    const node = getExpression("foo");

    assert.strictEqual(resolveStringValue(node, new Map()), null);
  });

  test("returns null for a node that is neither a literal nor an identifier", () => {
    const node = getExpression("foo()");

    assert.strictEqual(resolveStringValue(node, new Map()), null);
  });

  test("returns null for a numeric literal", () => {
    const node = getExpression("42");

    assert.strictEqual(resolveStringValue(node, new Map()), null);
  });

  test("returns the value of a direct empty string literal", () => {
    const node = getExpression("''");

    assert.strictEqual(resolveStringValue(node, new Map()), "");
  });

  test("resolves an identifier tracked to an empty string, not null", () => {
    const node = getExpression("foo");
    const literalIdentifiers = new Map<string, LiteralIdentifier>([
      ["foo", { value: "", type: "Literal" }]
    ]);

    assert.strictEqual(resolveStringValue(node, literalIdentifiers), "");
  });

  test("returns null for an identifier tracked back to a template literal", () => {
    const node = getExpression("foo");
    const literalIdentifiers = new Map<string, LiteralIdentifier>([
    /* eslint-disable-next-line no-template-curly-in-string */
      ["foo", { value: "${0}", type: "TemplateLiteral" }]
    ]);

    assert.strictEqual(resolveStringValue(node, literalIdentifiers), null);
  });
});
