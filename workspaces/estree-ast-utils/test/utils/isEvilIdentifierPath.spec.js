// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { isEvilIdentifierPath } from "../../src/utils/index.js";

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
