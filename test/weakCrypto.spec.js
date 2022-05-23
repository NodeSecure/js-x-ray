// Node.Js Dependencies
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

// Third-party Dependencies
import test from "tape";

// Internal Dependencies
import { runASTAnalysis, warnings } from "../index.js";
import { getWarningKind } from "./utils/index.js";

// Constants
const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(__dirname, "fixtures");

test("it should report a warning in case of `createHash('md5')` usage", (tape) => {
  const md5Usage = readFileSync(join(FIXTURE_PATH, "weakCrypto.js"), "utf-8");
  const { warnings: outputWarnings } = runASTAnalysis(md5Usage);

  tape.strictEqual(outputWarnings.length, 1);
  tape.deepEqual(getWarningKind(outputWarnings), [warnings.weakCrypto].sort());
  tape.strictEqual(outputWarnings[0].value, "md5");
  tape.end();
});
