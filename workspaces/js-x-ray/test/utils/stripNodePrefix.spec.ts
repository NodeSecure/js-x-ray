// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { stripNodePrefix } from "../../src/utils/index.ts";
describe("stripNodePrefix", () => {
  it("should remove 'node:' prefix from module name", () => {
    assert.strictEqual(stripNodePrefix("node:fs"), "fs");
    assert.strictEqual(stripNodePrefix("node:path"), "path");
  });

  it("should return the value unchanged if no prefix is present", () => {
    assert.strictEqual(stripNodePrefix("fs"), "fs");
    assert.strictEqual(stripNodePrefix("http"), "http");
  });

  it("should not modify similar but invalid prefixes", () => {
    assert.strictEqual(stripNodePrefix("nod:fs"), "nod:fs");
  });

  it("should only remove prefix at the beginning", () => {
    assert.strictEqual(stripNodePrefix("my-node:fs"), "my-node:fs");
  });

  it("should handle empty string", () => {
    assert.strictEqual(stripNodePrefix(""), "");
  });

  it("should return non-string values unchanged", () => {
    assert.strictEqual(stripNodePrefix(123), 123);
    assert.strictEqual(stripNodePrefix(null), null);
    assert.strictEqual(stripNodePrefix(undefined), undefined);

    const obj = { key: "value" };
    assert.strictEqual(stripNodePrefix(obj), obj);
  });
});
