// Require Third-party Dependencies
import is from "@slimio/is";
import test from "tape";

// Require Internal Dependencies
import ASTDeps from "../src/ASTDeps.js";

test("assert ASTDeps class default properties and values", (tape) => {
  const deps = new ASTDeps();

  tape.strictEqual(deps.isInTryStmt, false);
  tape.strictEqual(is.plainObject(deps.dependencies), true);
  tape.strictEqual(deps.size, 0);
  tape.deepEqual([...deps], []);

  tape.end();
});

test("add values to ASTDeps instance", (tape) => {
  const deps = new ASTDeps();
  deps.add("foo");
  deps.isInTryStmt = true;
  deps.add("boo");

  tape.strictEqual(deps.size, 2);
  tape.deepEqual([...deps], ["foo", "boo"]);
  tape.deepEqual([...deps.getDependenciesInTryStatement()], ["boo"]);

  tape.end();
});

test("delete values from ASTDeps instance", (tape) => {
  const deps = new ASTDeps();
  deps.add("foo");
  deps.removeByName("foo");
  deps.removeByName("boo");

  tape.strictEqual(deps.size, 0);
  tape.end();
});

test("isIntryStmt must be a boolean!", (tape) => {
  const deps = new ASTDeps();

  tape.throws(() => {
    deps.isInTryStmt = 1;
  }, "value must be a boolean!");

  tape.end();
});

test("check presence of a dependency", (tape) => {
  const deps = new ASTDeps();

  deps.add("foo");

  tape.strictEqual(deps.has("foo"), true);
  tape.strictEqual(deps.has("bar"), false);
  tape.end();
});

test("it should not add dependency if not a string primitive", (tape) => {
  const deps = new ASTDeps();

  deps.add(5);
  tape.strictEqual(deps.size, 0);

  tape.end();
});

test("it should not add dependency if provided with empty string", (tape) => {
  const deps = new ASTDeps();

  deps.add("");
  tape.strictEqual(deps.size, 0);

  tape.end();
});
