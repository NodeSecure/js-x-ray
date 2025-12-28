// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { isEvilIdentifierPath } from "../../src/utils/index.ts";

describe("isEvilIdentifierPath", () => {
  test("given a random prototype method name then it should return false", () => {
    const result = isEvilIdentifierPath(
      "Function.prototype.foo"
    );

    assert.strictEqual(result, false);
  });

  test("given a list of evil identifiers it should always return true", () => {
    const evilIdentifiers = [
      "Function.prototype.bind",
      "Function.prototype.call",
      "Function.prototype.apply"
    ];
    for (const identifier of evilIdentifiers) {
      assert.strictEqual(isEvilIdentifierPath(identifier), true);
    }
  });
});
