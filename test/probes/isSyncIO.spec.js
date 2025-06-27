// Import Node.js Dependencies
import { readFileSync, promises as fs } from "node:fs";
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { AstAnalyser } from "../../index.js";

const FIXTURE_URL = new URL("fixtures/syncIO/", import.meta.url);

describe("isSyncIO", () => {
  test("it should report a warning in case of *Sync(...params)` usage", async() => {
    const fixturesDir = new URL("directCallExpression/", FIXTURE_URL);
    const fixtureFiles = await fs.readdir(fixturesDir);

    for (const fixtureFile of fixtureFiles) {
      const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: true
      }).analyse(fixture);

      const [firstWarning] = outputWarnings;
      assert.strictEqual(outputWarnings.length, 1);
      assert.deepEqual(firstWarning.kind, "synchronous-io");
      assert.strictEqual(firstWarning.value, fixtureFile.split(".").at(0));
    }
  });

  test("it should report a warning in case of `[expression]*Sync(...params)` usage", async() => {
    const fixturesDir = new URL("memberExpression/", FIXTURE_URL);
    const fixtureFiles = await fs.readdir(fixturesDir);

    for (const fixtureFile of fixtureFiles) {
      const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
      const { warnings: outputWarnings } = new AstAnalyser(
        {
          optionalWarnings: true
        }
      ).analyse(fixture);

      const [firstWarning] = outputWarnings;
      assert.strictEqual(outputWarnings.length, 1);
      assert.deepEqual(firstWarning.kind, "synchronous-io");
      assert.strictEqual(firstWarning.value, fixtureFile.split(".").at(0));
    }
  });

  test("it should NOT report a warning when relevant module is not imported", () => {
    const codes = [`
    const fs = {
      readFileSync() {}
    }
    fs.readFileSync('foo.txt');
  `,
    `
    const crypto = {
      generateKeyPairSync() {}
    }
    crypto.generateKeyPairSync('foo.txt');
  `,
    `
    const child_process = {
      execSync() {}
    }
    child_process.execSync('ls -la');
  `,
    `
    const zlib = {
      gzipSync() {}
    }
    zlib.gzipSync(Buffer.from("text","utf-8"));
  `
    ];
    for (const code of codes) {
      const { warnings: outputWarnings } = new AstAnalyser({
        optionalWarnings: true
      }).analyse(code);
      assert.strictEqual(outputWarnings.length, 0);
    }
  });

  test("should not have any warning when no optional warning is specified", async() => {
    const fixturesDir = new URL("directCallExpression/", FIXTURE_URL);
    const fixture = readFileSync(new URL("readFileSync.js", fixturesDir), "utf-8");
    const { warnings: outputWarnings } = new AstAnalyser({
    }).analyse(fixture);
    assert.strictEqual(outputWarnings.length, 0);
  });

  test("should not have any warning when no optional warnings is specified", async() => {
    const fixturesDir = new URL("directCallExpression/", FIXTURE_URL);
    const fixture = readFileSync(new URL("readFileSync.js", fixturesDir), "utf-8");
    const { warnings: outputWarnings } = new AstAnalyser().analyse(fixture);
    assert.strictEqual(outputWarnings.length, 0);
  });

  test("should not have any warning when synchronous-io is not in the optional warnings", async() => {
    const fixturesDir = new URL("directCallExpression/", FIXTURE_URL);
    const fixture = readFileSync(new URL("readFileSync.js", fixturesDir), "utf-8");
    const { warnings: outputWarnings } = new AstAnalyser({
      optionalWarnings: []
    }).analyse(fixture);
    assert.strictEqual(outputWarnings.length, 0);
  });

  test("should have a warning when synchronous-io is in the optional warnings", async() => {
    const fixturesDir = new URL("directCallExpression/", FIXTURE_URL);
    const fixture = readFileSync(new URL("readFileSync.js", fixturesDir), "utf-8");
    const { warnings: outputWarnings } = new AstAnalyser({
      optionalWarnings: ["synchronous-io"]
    }).analyse(fixture);
    assert.strictEqual(outputWarnings.length, 1);
    const [firstWarning] = outputWarnings;
    assert.strictEqual(outputWarnings.length, 1);
    assert.deepEqual(firstWarning.kind, "synchronous-io");
    assert.strictEqual(firstWarning.value, "readFileSync");
  });
});
