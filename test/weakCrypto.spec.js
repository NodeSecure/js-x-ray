// Node.Js Dependencies
import { readFileSync } from "fs";
import { readdir } from 'fs/promises';
import { fileURLToPath } from "url";
import { join, dirname } from "path";

// Third-party Dependencies
import test from "tape";

// Internal Dependencies
import { runASTAnalysis, warnings } from "../index.js";

// Constants
const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(__dirname, "fixtures", "weakCrypto");

test("it should report a warning in case of `createHash(<weak-algo>)` usage", async (tape) => {
  const fixturesDir = join(FIXTURE_PATH, "directCallExpression");
  const fixtureFiles = await readdir(fixturesDir);

  for (const fixtureFile of fixtureFiles) {
    const fixture = readFileSync(join(fixturesDir, fixtureFile), "utf-8");
    const { warnings: outputWarnings } = runASTAnalysis(fixture);

    const [firstWarning] = outputWarnings;
    tape.strictEqual(outputWarnings.length, 1);
    tape.deepEqual(firstWarning.kind, warnings.weakCrypto.code);
    tape.strictEqual(firstWarning.value, fixtureFile.split(".").at(0));
    tape.strictEqual(firstWarning.experimental, true);
  }
  tape.end();
});

test("it should report a warning in case of `[expression]createHash(<weak-algo>)` usage", async (tape) => {
  const fixturesDir = join(FIXTURE_PATH, "memberExpression");
  const fixtureFiles = await readdir(fixturesDir);

  for (const fixtureFile of fixtureFiles) {
    const fixture = readFileSync(join(fixturesDir, fixtureFile), "utf-8");
    const { warnings: outputWarnings } = runASTAnalysis(fixture);

    const [firstWarning] = outputWarnings;
    tape.strictEqual(outputWarnings.length, 1);
    tape.deepEqual(firstWarning.kind, warnings.weakCrypto.code);
    tape.strictEqual(firstWarning.value, fixtureFile.split(".").at(0));
    tape.strictEqual(firstWarning.experimental, true);
  }
  tape.end();
});

test("it should NOT report a warning in case of `[expression]createHash('sha256')` usage", (tape) => {
  const md5Usage = readFileSync(join(FIXTURE_PATH, "strongAlgorithms", "sha256.js"), "utf-8");
  const { warnings: outputWarnings } = runASTAnalysis(md5Usage);

  tape.strictEqual(outputWarnings.length, 0);
  tape.end();
});
