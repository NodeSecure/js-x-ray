// Require Internal Dependencies
import { parseScript, getSastAnalysis } from "../utils/index.js";
import { warnings } from "../../index.js";

// Require Third-party dependencies
import test from "tape";

// Require Node.js Dependencies
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(__dirname, "fixtures/unsafeCallee");

test("should detect eval", (tape) => {
  const str = readFileSync(join(FIXTURE_PATH, "1-unsafeCallee.js"), "utf-8");

  const ast = parseScript(str);
  const analysis = getSastAnalysis(str, ast.body);

  tape.equal(analysis.warnings[0].kind, warnings.unsafeStmt.code);
  tape.equal(analysis.warnings[0].value, "eval");
  tape.end();
});