// Node.Js Dependencies
import { readFileSync } from "fs";
import { readdir } from "fs/promises";

// Third-party Dependencies
import test from "tape";

// Internal Dependencies
import { runASTAnalysis } from "../../index.js";

// Constants
const FIXTURE_URL = new URL("fixtures/weakCrypto/", import.meta.url);

test("it should report a warning in case of `createHash(<weak-algo>)` usage", async(tape) => {
  const fixturesDir = new URL("directCallExpression/", FIXTURE_URL);
  const fixtureFiles = await readdir(fixturesDir);

  for (const fixtureFile of fixtureFiles) {
    const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
    const { warnings: outputWarnings } = runASTAnalysis(fixture);

    const [firstWarning] = outputWarnings;
    tape.strictEqual(outputWarnings.length, 1);
    tape.deepEqual(firstWarning.kind, "weak-crypto");
    tape.strictEqual(firstWarning.value, fixtureFile.split(".").at(0));
    tape.strictEqual(firstWarning.experimental, true);
  }
  tape.end();
});

test("it should report a warning in case of `[expression]createHash(<weak-algo>)` usage", async(tape) => {
  const fixturesDir = new URL("memberExpression/", FIXTURE_URL);
  const fixtureFiles = await readdir(fixturesDir);

  for (const fixtureFile of fixtureFiles) {
    const fixture = readFileSync(new URL(fixtureFile, fixturesDir), "utf-8");
    const { warnings: outputWarnings } = runASTAnalysis(fixture);

    const [firstWarning] = outputWarnings;
    tape.strictEqual(outputWarnings.length, 1);
    tape.deepEqual(firstWarning.kind, "weak-crypto");
    tape.strictEqual(firstWarning.value, fixtureFile.split(".").at(0));
    tape.strictEqual(firstWarning.experimental, true);
  }
  tape.end();
});

test("it should NOT report a warning in case of `[expression]createHash('sha256')` usage", (tape) => {
  const code = `
    import crypto from 'crypto';
    crypto.createHash('sha256');
  `;
  const { warnings: outputWarnings } = runASTAnalysis(code);

  tape.strictEqual(outputWarnings.length, 0);
  tape.end();
});
