// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

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
