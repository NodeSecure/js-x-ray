// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { notNullOrUndefined } from "../../src/utils/index.ts";

describe("notNullOrUndefined", () => {
  test("given a null or undefined primitive value then it must always return false", () => {
    assert.strictEqual(notNullOrUndefined(null), false, "null primitive value should return false");
    assert.strictEqual(notNullOrUndefined(void 0), false, "undefined primitive value should return false");
  });

  test("given values (primitive or objects) that are not null or undefined then it must always return true", () => {
    const valuesToAssert = ["", 1, true, Symbol("foo"), {}, [], /^xd/g];
    for (const value of valuesToAssert) {
      assert.strictEqual(notNullOrUndefined(value), true);
    }
  });
});
