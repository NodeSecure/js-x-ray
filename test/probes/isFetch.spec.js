// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { AstAnalyser } from "../../index.js";

test("it should detect native fetch", () => {
  const code = `await fetch(url);`;
  const { flags } = new AstAnalyser().analyse(code);

  assert.ok(flags.has("fetch"));
  assert.strictEqual(flags.size, 1);
});
