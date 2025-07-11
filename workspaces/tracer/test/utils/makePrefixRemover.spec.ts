// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Import Internal Dependencies
import { makePrefixRemover } from "../../src/utils/index.js";

describe("makePrefixRemover", () => {
  it("returns the original string when no dot is present", () => {
    const strip = makePrefixRemover(["window"]);
    assert.strictEqual(strip("foo"), "foo");
  });

  it("returns the original string when the identifier is not at the start of the string", () => {
    const strip = makePrefixRemover(["window"]);
    assert.strictEqual(strip("foo.window"), "foo.window");
  });

  it("removes a matching prefix at the start of the expression", () => {
    const strip = makePrefixRemover(["window", "globalThis"]);
    assert.strictEqual(strip("window.bar"), "bar");
    assert.strictEqual(strip("globalThis.console"), "console");
  });

  it("returns the original string when no prefix matches", () => {
    const strip = makePrefixRemover(["window"]);
    assert.strictEqual(strip("document.title"), "document.title");
  });

  it("handles nested member expressions", () => {
    const strip = makePrefixRemover(["window"]);
    assert.strictEqual(strip("window.document.title"), "document.title");
  });

  it("accepts any iterable of prefixes", () => {
    const strip = makePrefixRemover(new Set(["window"]));
    assert.strictEqual(strip("window.location"), "location");
  });

  it("uses the first matching prefix based on input order", () => {
    const strip1 = makePrefixRemover(["window.document", "window"]);
    assert.strictEqual(strip1("window.document.title"), "title");
    const strip2 = makePrefixRemover(["window", "window.document"]);
    assert.strictEqual(strip2("window.document.title"), "document.title");
  });
});
