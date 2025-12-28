// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import {
  commonHexadecimalPrefix,
  commonStringPrefix,
  commonStringSuffix
} from "../src/patterns.ts";

describe("commonStringPrefix()", () => {
  test("must return null for two strings that have no common prefix", () => {
    assert.strictEqual(
      commonStringPrefix("boo", "foo"),
      null,
      "there is no common prefix between 'boo' and 'foo' so the result must be null"
    );
  });

  test("should return the common prefix for strings with a shared prefix", () => {
    assert.strictEqual(
      commonStringPrefix("bromance", "brother"),
      "bro",
      "the common prefix between bromance and brother must be 'bro'."
    );
  });
});

describe("commonStringSuffix()", () => {
  test("must return the common suffix for the two strings with a shared suffix", () => {
    assert.strictEqual(
      commonStringSuffix("boo", "foo"),
      "oo",
      "the common suffix between boo and foo must be 'oo'"
    );
  });

  test("must return null for two strings with no common suffix", () => {
    assert.strictEqual(
      commonStringSuffix("bromance", "brother"),
      null,
      "there is no common suffix between 'bromance' and 'brother' so the result must be null"
    );
  });
});

describe("commonHexadecimalPrefix()", () => {
  test("should throw a TypeError if identifiersArray is not an Array", () => {
    // @ts-expect-error
    assert.throws(() => commonHexadecimalPrefix(10), {
      name: "TypeError",
      message: "identifiersArray must be an Array"
    });
  });

  test("should handle only hexadecimal identifiers", () => {
    const data = [
      "_0x3c0c55", "_0x1185d5", "_0x160fc8", "_0x18a66f", "_0x18a835", "_0x1a8356",
      "_0x1adf3b", "_0x1e4510", "_0x1e9a2a", "_0x215558", "_0x2b0194", "_0x2fffe5",
      "_0x32c822", "_0x33bb79"
    ];
    const result = commonHexadecimalPrefix(data);

    assert.strictEqual(result.oneTimeOccurence, 0);
    assert.strictEqual(result.prefix._0x, data.length);
  });

  test("should add one non-hexadecimal identifier", () => {
    const data = [
      "_0x3c0c55", "_0x1185d5", "_0x160fc8", "_0x18a66f", "_0x18a835", "_0x1a8356",
      "_0x1adf3b", "_0x1e4510", "_0x1e9a2a", "_0x215558", "_0x2b0194", "_0x2fffe5",
      "_0x32c822", "_0x33bb79", "foo"
    ];
    const result = commonHexadecimalPrefix(data);

    assert.strictEqual(result.oneTimeOccurence, 1);
    assert.strictEqual(result.prefix._0x, data.length - 1);
  });
});
