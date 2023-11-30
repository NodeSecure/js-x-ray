// Import Node.js Dependencies
import { randomBytes } from "node:crypto";

// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { isLiteral, toValue, toRaw, defaultAnalysis } from "../src/literal.js";
import { createLiteral } from "./utils/index.js";

test("isLiteral must return true for a valid ESTree Literal Node", (tape) => {
  const literalSample = createLiteral("boo");

  tape.strictEqual(isLiteral(literalSample), true);
  tape.strictEqual(isLiteral("hey"), false);
  tape.strictEqual(isLiteral({ type: "fake", value: "boo" }), false);
  tape.end();
});

test("toValue must return a string when we give a valid EStree Literal", (tape) => {
  const literalSample = createLiteral("boo");

  tape.strictEqual(toValue(literalSample), "boo");
  tape.strictEqual(toValue("hey"), "hey");
  tape.end();
});

test("toRaw must return a string when we give a valid EStree Literal", (tape) => {
  const literalSample = createLiteral("boo", true);

  tape.strictEqual(toRaw(literalSample), "boo");
  tape.strictEqual(toRaw("hey"), "hey");
  tape.end();
});

test("defaultAnalysis() of something else than a Literal must always return null", (tape) => {
  tape.strictEqual(defaultAnalysis(10), null);
  tape.end();
});

test("defaultAnalysis() of an Hexadecimal value", (tape) => {
  const hexValue = randomBytes(10).toString("hex");

  const result = defaultAnalysis(createLiteral(hexValue, true));
  const expected = {
    isBase64: true, hasHexadecimalSequence: false, hasUnicodeSequence: false
  };

  tape.deepEqual(result, expected);
  tape.end();
});

test("defaultAnalysis() of an Base64 value", (tape) => {
  const hexValue = randomBytes(10).toString("base64");

  const result = defaultAnalysis(createLiteral(hexValue, true));
  const expected = {
    isBase64: true, hasHexadecimalSequence: false, hasUnicodeSequence: false
  };

  tape.deepEqual(result, expected);
  tape.end();
});

test("defaultAnalysis() of an Unicode Sequence", (tape) => {
  const unicodeSequence = createLiteral("'\\u0024\\u0024'", true);

  const result = defaultAnalysis(unicodeSequence);
  const expected = {
    isBase64: false, hasHexadecimalSequence: false, hasUnicodeSequence: true
  };

  tape.deepEqual(result, expected);
  tape.end();
});

test("defaultAnalysis() of an Unicode Sequence", (tape) => {
  const hexSequence = createLiteral("'\\x64\\x61\\x74\\x61'", true);

  const result = defaultAnalysis(hexSequence);
  const expected = {
    isBase64: false, hasHexadecimalSequence: true, hasUnicodeSequence: false
  };

  tape.deepEqual(result, expected);
  tape.end();
});

test("defaultAnalysis() with a Literal with no 'raw' property must return two null values", (tape) => {
  const hexValue = randomBytes(10).toString("base64");

  const result = defaultAnalysis(createLiteral(hexValue));
  const expected = {
    isBase64: true, hasHexadecimalSequence: null, hasUnicodeSequence: null
  };

  tape.deepEqual(result, expected);
  tape.end();
});
