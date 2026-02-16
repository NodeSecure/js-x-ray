// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { DefaultCollectableSet } from "../src/CollectableSet.ts";
import type { Dependency } from "../src/AstAnalyser.ts";
import { SourceFile, SourceFilePath } from "../src/SourceFile.ts";

describe("SourceFile", () => {
  describe("constructor() with sourceLocation", () => {
    it("should set the path location", () => {
      const sourceFile = new SourceFile("/path/to/file.js");
      assert.ok(sourceFile.path instanceof SourceFilePath);
      assert.strictEqual(sourceFile.path.location, "/path/to/file.js");
    });
  });

  describe("addDependency", () => {
    it("should add a dependency without an unsafe import warning", () => {
      const dependenciesSet = new DefaultCollectableSet<Record<"string", Dependency & {
        spec: string;
      }>>("dependency");
      const sourceFile = new SourceFile("file.js", { collectables: [dependenciesSet], metadata: { spec: "react@19.0.1" } });
      sourceFile.dependencyAutoWarning = false;
      sourceFile.inTryStatement = true;
      sourceFile.addDependency("package/", { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } });
      assert.deepEqual(sourceFile.warnings, []);
      assert.deepEqual(Array.from(dependenciesSet), [
        {
          value: "package",
          locations: [
            {
              file: "file.js", location: [[[0, 0], [0, 0]]], metadata: {
                spec:
                  "react@19.0.1",
                inTry: true,
                unsafe: false
              }
            }
          ]
        }
      ]);
    });

    it("should add a dependency with an unsafe import warning", () => {
      const dependenciesSet = new DefaultCollectableSet<Record<"string", Dependency & {
        spec: string;
      }>>("dependency");
      const sourceFile = new SourceFile("file.js", { collectables: [dependenciesSet], metadata: { spec: "react@19.0.1" } });
      sourceFile.dependencyAutoWarning = true;
      sourceFile.addDependency("package", { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } });
      assert.deepEqual(sourceFile.warnings, [{
        kind: "unsafe-import",
        i18n: "sast_warnings.unsafe_import",
        value: "package",
        location: [[0, 0], [0, 0]],
        source: "JS-X-Ray",
        severity: "Warning",
        experimental: false
      }]);
      assert.deepEqual(Array.from(dependenciesSet), [
        {
          value: "package",
          locations: [
            {
              file: "file.js", location: [[[0, 0], [0, 0]]], metadata: {
                spec:
                  "react@19.0.1",
                inTry: false,
                unsafe: true
              }
            }
          ]
        }
      ]);
    });

    it("should not add any dependency for an empty string", () => {
      const dependenciesSet = new DefaultCollectableSet<Record<"string", Dependency & {
        spec: string;
      }>>("dependency");
      const sourceFile = new SourceFile("file.js", { collectables: [dependenciesSet], metadata: { spec: "react@19.0.1" } });
      sourceFile.dependencyAutoWarning = false;
      sourceFile.addDependency("  ", { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } });
      assert.deepEqual(sourceFile.warnings, []);
      assert.deepEqual(Array.from(dependenciesSet), []);
    });

    it("should not add the dependency when the package name is the same", () => {
      const dependenciesSet = new DefaultCollectableSet<Record<"string", Dependency & {
        spec: string;
      }>>("dependency");
      const sourceFile = new SourceFile("file.js", {
        collectables: [dependenciesSet],
        metadata: { spec: "react@19.0.1" },
        packageName: "package"
      });
      sourceFile.dependencyAutoWarning = false;
      sourceFile.addDependency("package", { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } });
      assert.deepEqual(sourceFile.warnings, []);
      assert.deepEqual(Array.from(dependenciesSet), []);
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
