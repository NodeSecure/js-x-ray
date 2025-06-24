// Import Node.js Dependencies
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { isLiteral, toValue, toRaw, defaultAnalysis } from "../src/literal.js";
import { createLiteral } from "./utils/index.js";

test("isLiteral must return true for a valid ESTree Literal Node", () => {
  const literalSample = createLiteral("boo");

  assert.strictEqual(isLiteral(literalSample), true);
  assert.strictEqual(isLiteral("hey"), false);
  assert.strictEqual(isLiteral({ type: "fake", value: "boo" }), false);
});

test("toValue must return a string when we give a valid EStree Literal", () => {
  const literalSample = createLiteral("boo");

  assert.strictEqual(toValue(literalSample), "boo");
  assert.strictEqual(toValue("hey"), "hey");
});

test("toRaw must return a string when we give a valid EStree Literal", () => {
  const literalSample = createLiteral("boo", true);

  assert.strictEqual(toRaw(literalSample), "boo");
  assert.strictEqual(toRaw("hey"), "hey");
});

test("defaultAnalysis() of something else than a Literal must always return null", () => {
  assert.strictEqual(defaultAnalysis(10 as any), null);
});

test("defaultAnalysis() of an Hexadecimal value", () => {
  const hexValue = randomBytes(10).toString("hex");

  const result = defaultAnalysis(createLiteral(hexValue, true));
  const expected = {
    isBase64: true, hasHexadecimalSequence: false, hasUnicodeSequence: false
  };

  assert.deepEqual(result, expected);
});

test("defaultAnalysis() of an Base64 value", () => {
  const hexValue = randomBytes(10).toString("base64");

  const result = defaultAnalysis(createLiteral(hexValue, true));
  const expected = {
    isBase64: true, hasHexadecimalSequence: false, hasUnicodeSequence: false
  };

  assert.deepEqual(result, expected);
});

test("defaultAnalysis() of an Unicode Sequence", () => {
  const unicodeSequence = createLiteral("'\\u0024\\u0024'", true);

  const result = defaultAnalysis(unicodeSequence);
  const expected = {
    isBase64: false, hasHexadecimalSequence: false, hasUnicodeSequence: true
  };

  assert.deepEqual(result, expected);
});

test("defaultAnalysis() of an Unicode Sequence", () => {
  const hexSequence = createLiteral("'\\x64\\x61\\x74\\x61'", true);

  const result = defaultAnalysis(hexSequence);
  const expected = {
    isBase64: false, hasHexadecimalSequence: true, hasUnicodeSequence: false
  };

  assert.deepEqual(result, expected);
});

test("defaultAnalysis() with a Literal with no 'raw' property must return two null values", () => {
  const hexValue = randomBytes(10).toString("base64");

  const result = defaultAnalysis(createLiteral(hexValue));
  const expected = {
    isBase64: true, hasHexadecimalSequence: null, hasUnicodeSequence: null
  };

  assert.deepEqual(result, expected);
});
