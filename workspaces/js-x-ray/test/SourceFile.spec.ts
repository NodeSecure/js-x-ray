// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { SourceFile, SourceFilePath } from "../src/SourceFile.js";

describe("SourceFile", () => {
  describe("constructor() with sourceLocation", () => {
    it("should set the path location", () => {
      const sourceFile = new SourceFile("/path/to/file.js");
      assert.ok(sourceFile.path instanceof SourceFilePath);
      assert.strictEqual(sourceFile.path.location, "/path/to/file.js");
    });
  });
});

describe("SourceFilePath", () => {
  describe("constructor", () => {
    it("should have location set to null by default", () => {
      const sfp = new SourceFilePath();
      assert.strictEqual(sfp.location, null);
    });
  });

  describe("use()", () => {
    it("should set location when provided", () => {
      const sfp = new SourceFilePath();
      sfp.use("/foo/bar");
      assert.strictEqual(sfp.location, "/foo/bar");
    });

    it("should set location to null when undefined", () => {
      const sfp = new SourceFilePath();
      sfp.use("/foo");
      sfp.use(undefined);
      assert.strictEqual(sfp.location, null);
    });
  });

  describe("resolve()", () => {
    it("should join parts without base location", () => {
      const sfp = new SourceFilePath();
      assert.strictEqual(sfp.resolve("foo", "bar.js"), "foo/bar.js");
    });

    it("should join parts with base location", () => {
      const sfp = new SourceFilePath();
      sfp.use("/base");
      assert.strictEqual(sfp.resolve("foo", "bar.js"), "/base/foo/bar.js");
    });
  });
});
