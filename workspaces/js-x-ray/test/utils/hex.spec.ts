// Import Node.js Dependencies
import assert from "node:assert";
import { randomBytes } from "node:crypto";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { CONSTANTS, isHex, isSafe } from "../../src/utils/hex.ts";
import { createLiteral } from "../helpers.ts";

describe("isHex()", () => {
  test("must return true for random 4 character hexadecimal values", () => {
    const hexValue = randomBytes(4).toString("hex");

    assert.strictEqual(isHex(hexValue), true, `Hexadecimal value '${hexValue}' must return true`);
  });

  test("must return true for ESTree Literals containing random 4 character hexadecimal values", () => {
    const hexValue = createLiteral(randomBytes(4).toString("hex"));

    assert.strictEqual(isHex(hexValue), true, `Hexadecimal value '${hexValue.value}' must return true`);
  });

  test("An hexadecimal value must be at least 4 chars long", () => {
    const hexValue = randomBytes(1).toString("hex");

    assert.strictEqual(isHex(hexValue), false, `Hexadecimal value '${hexValue}' must return false`);
  });

  test("should return false for non-string/ESTree Literal values", () => {
    const hexValue = 100;

    assert.strictEqual(
      // @ts-expect-error
      isHex(hexValue),
      false,
      "100 is typeof number so it must always return false"
    );
  });
});

describe("isSafe()", () => {
  test("must return true for a value with a length lower or equal five characters", () => {
    assert.ok(isSafe("h2l5x"));
  });

  test("must return true if the string diversity is only two characters or lower", () => {
    assert.ok(isSafe("aaaaaaaaaaaaaabbbbbbbbbbbbb"));
  });

  test("must always return true if argument is only number, lower or upper letters", () => {
    const values = ["00000000", "aaaaaaaa", "AAAAAAAAA"];

    for (const hexValue of values) {
      assert.ok(isSafe(hexValue));
    }
  });

  test("must always return true if the value start with one of the 'safe' values", () => {
    for (const safeValue of CONSTANTS.SAFE_HEXA_VALUES) {
      const hexValue = safeValue + randomBytes(4).toString("hex");

      assert.ok(isSafe(hexValue));
    }
  });

  test("must return true because it start with a safe pattern (and it must lowerCase the string)", () => {
    assert.ok(isSafe("ABCDEF1234567890"));
  });

  test("must always return false if the value start with one of the 'unsafe' values", () => {
    for (const unsafeValue of CONSTANTS.UNSAFE_HEXA_VALUES) {
      assert.strictEqual(isSafe(unsafeValue), false);
    }
  });
});
