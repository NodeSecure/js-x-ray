// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.js";

test("it should detect native fetch", () => {
  const code = "await fetch(url);";
  const { flags } = new AstAnalyser().analyse(code);

  assert.ok(flags.has("fetch"));
  assert.strictEqual(flags.size, 1);
});

test("it should detect a re-assigned native fetch", () => {
  const code = `const fetchBis = fetch
              await fetchBis(url);
         `;
  const { flags } = new AstAnalyser().analyse(code);

  assert.ok(flags.has("fetch"));
  assert.strictEqual(flags.size, 1);
});
