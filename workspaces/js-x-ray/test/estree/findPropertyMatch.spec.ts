// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { findPropertyMatch, isNumericLiteral, isStringLiteral } from "../../src/estree/index.ts";
import {
  parseScript,
  getExpressionFromStatementIf
} from "../helpers.ts";

function getProperties(code: string) {
  const [astNode] = parseScript(`(${code})`).body;
  const objectExpr = getExpressionFromStatementIf(astNode);

  return objectExpr.properties;
}

describe("estree.findPropertyMatch", () => {
  test("returns the value of the first property whose key matches and predicate holds", () => {
    const properties = getProperties("{ cost: 100, N: 200 }");

    const result = findPropertyMatch(properties, ["cost", "N"], isNumericLiteral);

    assert.ok(result !== null);
    assert.strictEqual(result.value, 100);
  });

  test("checks names in property order, not in the order given to names", () => {
    const properties = getProperties("{ N: 200, cost: 100 }");

    const result = findPropertyMatch(properties, ["cost", "N"], isNumericLiteral);

    assert.ok(result !== null);
    assert.strictEqual(result.value, 200);
  });

  test("returns null when no property key matches", () => {
    const properties = getProperties("{ foo: 1 }");

    assert.strictEqual(findPropertyMatch(properties, ["cost", "N"], isNumericLiteral), null);
  });

  test("returns null when the key matches but the predicate rejects the value", () => {
    const properties = getProperties("{ cost: 'not-a-number' }");

    assert.strictEqual(findPropertyMatch(properties, ["cost"], isNumericLiteral), null);
  });

  test("skips non-Property elements such as spread ones", () => {
    const properties = getProperties("{ ...other, cost: 100 }");

    const result = findPropertyMatch(properties, ["cost"], isNumericLiteral);

    assert.ok(result !== null);
    assert.strictEqual(result.value, 100);
  });

  test("works with a different predicate (isStringLiteral)", () => {
    const properties = getProperties("{ algorithm: 'argon2d' }");

    const result = findPropertyMatch(properties, ["algorithm"], isStringLiteral);

    assert.ok(result !== null);
    assert.strictEqual(result.value, "argon2d");
  });

  test("ignores a computed property even when its key identifier name matches", () => {
    // { [cost]: 100 } - the real key is the *value* of `cost` at runtime, not the name "cost"
    const properties = getProperties("{ [cost]: 100 }");

    assert.strictEqual(findPropertyMatch(properties, ["cost"], isNumericLiteral), null);
  });

  test("keeps scanning past a matching key whose value fails the predicate", () => {
    const properties = getProperties("{ cost: 'not-a-number', N: 200 }");

    const result = findPropertyMatch(properties, ["cost", "N"], isNumericLiteral);

    assert.ok(result !== null);
    assert.strictEqual(result.value, 200);
  });

  test("returns null for an empty properties array", () => {
    assert.strictEqual(findPropertyMatch([], ["cost"], isNumericLiteral), null);
  });

  test("returns null for an empty names array", () => {
    const properties = getProperties("{ cost: 100 }");

    assert.strictEqual(findPropertyMatch(properties, [], isNumericLiteral), null);
  });

  test("returns a falsy-but-valid value such as 0 rather than treating it as no match", () => {
    const properties = getProperties("{ cost: 0 }");

    const result = findPropertyMatch(properties, ["cost"], isNumericLiteral);

    assert.ok(result !== null);
    assert.strictEqual(result.value, 0);
  });
});
