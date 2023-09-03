// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { runASTAnalysisOnFile } from "../index.js";

// CONSTANTS
const FIXTURE_URL = new URL("fixtures/searchRuntimeDependencies/", import.meta.url);

test("it remove the packageName from the dependencies list", async() => {
  const result = await runASTAnalysisOnFile(
    new URL("depName.js", FIXTURE_URL),
    { module: false, packageName: "foobar" }
  );

  assert.ok(result.ok);
  assert.strictEqual(result.warnings.length, 0);
  assert.deepEqual([...result.dependencies],
    ["open"]
  );
});

test("it should fail with a parsing error", async() => {
  const result = await runASTAnalysisOnFile(
    new URL("parsingError.js", FIXTURE_URL),
    { module: false, packageName: "foobar" }
  );

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.warnings.length, 1);

  const parsingError = result.warnings[0];
  assert.strictEqual(parsingError.kind, "parsing-error");
});
