// Import Node.js Dependencies
import assert from "node:assert";
import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

// CONSTANTS
const kFixtureURL = new URL("fixtures/logUsage/", import.meta.url);

test("it should detect log methods", async () => {
  const fixtureFiles = await fs.readdir(kFixtureURL);
  for (const fixtureFile of fixtureFiles) {
    const fixture = readFileSync(new URL(fixtureFile, kFixtureURL), "utf-8");
    const { warnings } = new AstAnalyser(
      {
        optionalWarnings: true
      }
    ).analyse(fixture);
    const [firstWarning] = warnings;
    assert.strictEqual(firstWarning.kind, "log-usage");
    assert.strictEqual(firstWarning.severity, "Information");
    assert.strictEqual(firstWarning.value, `${fixtureFile.split(".").slice(0, 2).join(".")}`);
  }
});

test("it should not generate any warning", () => {
  const code = "console.log(token);";
  const { warnings } = new AstAnalyser().analyse(code);
  assert.strictEqual(warnings.length, 0);
});

test("it should detect re-assigned console.log", () => {
  const code = `const log = console.log;
              log(token);`;

  const { warnings } = new AstAnalyser({
    optionalWarnings: true
  }).analyse(code);
  const [firstWarning] = warnings;
  assert.strictEqual(firstWarning.kind, "log-usage");
  assert.strictEqual(firstWarning.severity, "Information");
  assert.strictEqual(firstWarning.value, "console.log");
});

test("should be able to detect multiple console.log in one warning", () => {
  const code = `console.log(token);
                console.log(secret)
                console.log(password);
                console.debug(password);
`;
  const { warnings } = new AstAnalyser({
    optionalWarnings: true
  }).analyse(code);
  const [firstWarning] = warnings;
  assert.strictEqual(warnings.length, 1);
  assert.deepEqual(firstWarning.kind, "log-usage");
  assert.strictEqual(firstWarning.value, "console.log, console.debug");
  assert.strictEqual(firstWarning.location?.length, 4);
  assert.ok(Array.isArray(firstWarning.location![0]));
});
