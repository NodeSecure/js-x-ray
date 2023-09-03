// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import ASTDeps from "../src/ASTDeps.js";

describe("ASTDeps", () => {
  it("assert ASTDeps class default properties and values", () => {
    const deps = new ASTDeps();

    assert.strictEqual(deps.isInTryStmt, false);
    assert.ok(typeof deps.dependencies === "object");
    assert.strictEqual(
      Object.getPrototypeOf(deps.dependencies),
      null
    );
    assert.strictEqual(deps.size, 0);
    assert.deepEqual([...deps], []);
  });

  it("add values to ASTDeps instance", () => {
    const deps = new ASTDeps();
    deps.add("foo");
    deps.isInTryStmt = true;
    deps.add("boo");

    assert.strictEqual(deps.size, 2);
    assert.deepEqual([...deps], ["foo", "boo"]);
    assert.deepEqual([...deps.getDependenciesInTryStatement()], ["boo"]);
  });

  it("add method should cleanup ending slash", () => {
    const deps = new ASTDeps();
    deps.add("foo/");

    assert.strictEqual(deps.size, 1);
    assert.ok(deps.has("foo"));
  });

  it("delete values from ASTDeps instance", () => {
    const deps = new ASTDeps();
    deps.add("foo");
    deps.removeByName("foo");
    deps.removeByName("boo");

    assert.strictEqual(deps.size, 0);
  });

  it("isIntryStmt must be a boolean!", () => {
    const deps = new ASTDeps();

    assert.throws(() => {
      deps.isInTryStmt = 1;
    }, new TypeError("value must be a boolean!"));
  });

  it("should assert presence of a dependency", () => {
    const deps = new ASTDeps();

    deps.add("foo");

    assert.strictEqual(deps.has("foo"), true);
    assert.strictEqual(deps.has("bar"), false);
    assert.strictEqual(deps.has(""), false);
  });

  it("should not add dependency if not a string primitive", () => {
    const deps = new ASTDeps();

    deps.add(5);
    assert.strictEqual(deps.size, 0);
  });

  it("should not add dependency if provided with empty string", () => {
    const deps = new ASTDeps();

    deps.add("");
    assert.strictEqual(deps.size, 0);
  });
});

