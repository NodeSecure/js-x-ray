// Import Node.js Dependencies
import assert from "node:assert";
import { promises as fs, readFileSync } from "node:fs";
import { test } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

// Constants
const kFixtureURL = new URL("fixtures/weakCrypto/", import.meta.url);

test("it should report a warning in case of `createHash(<weak-algo>)` usage", async() => {
  const fixturesDir = new URL("directCallExpression/", kFixtureURL);
  const fixtureFiles = await fs.readdir(fixturesDir);

  for (const fixtureFile of fixtureFiles) {
    const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
    const { warnings: outputWarnings } = new AstAnalyser().analyse(fixture);

    const [firstWarning] = outputWarnings;
    assert.strictEqual(outputWarnings.length, 1);
    assert.deepEqual(firstWarning.kind, "weak-crypto");
    assert.strictEqual(firstWarning.value, fixtureFile.split(".").at(0));
  }
});

test("it should report a warning in case of `[expression]createHash(<weak-algo>)` usage", async() => {
  const fixturesDir = new URL("memberExpression/", kFixtureURL);
  const fixtureFiles = await fs.readdir(fixturesDir);

  for (const fixtureFile of fixtureFiles) {
    const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
    const { warnings: outputWarnings } = new AstAnalyser().analyse(fixture);

    const [firstWarning] = outputWarnings;
    assert.strictEqual(outputWarnings.length, 1);
    assert.deepEqual(firstWarning.kind, "weak-crypto");
    assert.strictEqual(firstWarning.value, fixtureFile.split(".").at(0));
  }
});

test("it should NOT report a warning in case of `[expression]createHash('sha256')` usage", () => {
  const code = `
    import crypto from 'crypto';
    crypto.createHash('sha256');
  `;
  const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

  assert.strictEqual(outputWarnings.length, 0);
});

test("it should NOT report a warning if crypto.createHash is not imported", () => {
  const code = `
    const crypto = {
      createHash() {}
    }
    crypto.createHash('md5');
  `;
  const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

  assert.strictEqual(outputWarnings.length, 0);
});
