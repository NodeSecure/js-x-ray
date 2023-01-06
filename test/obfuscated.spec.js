// Import Node.js Dependencies
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { runASTAnalysis, runASTAnalysisOnFile } from "../index.js";
import { getWarningKind } from "./utils/index.js";

// CONSTANTS
const FIXTURE_URL = new URL("fixtures/obfuscated/", import.meta.url);

test("should detect 'jsfuck' obfuscation", (tape) => {
  const trycatch = readFileSync(new URL("jsfuck.js", FIXTURE_URL), "utf-8");
  const { warnings } = runASTAnalysis(trycatch);

  tape.strictEqual(warnings.length, 1);
  tape.deepEqual(getWarningKind(warnings), ["obfuscated-code"].sort());
  tape.strictEqual(warnings[0].value, "jsfuck");
  tape.end();
});

// test("should detect 'morse' obfuscation", (tape) => {
//   const trycatch = readFileSync(new URL("morse.js", FIXTURE_URL), "utf-8");
//   const { warnings } = runASTAnalysis(trycatch);

//   tape.strictEqual(warnings.length, 1);
//   tape.deepEqual(getWarningKind(warnings), ["obfuscated-code"].sort());
//   tape.strictEqual(warnings[0].value, "morse");
//   tape.end();
// });

test("should detect 'jjencode' obfuscation", (tape) => {
  const trycatch = readFileSync(new URL("jjencode.js", FIXTURE_URL), "utf-8");
  const { warnings } = runASTAnalysis(trycatch);

  tape.strictEqual(warnings.length, 1);
  tape.deepEqual(getWarningKind(warnings), ["obfuscated-code"].sort());
  tape.strictEqual(warnings[0].value, "jjencode");
  tape.end();
});

test("should detect 'freejsobfuscator' obfuscation", (tape) => {
  const trycatch = readFileSync(new URL("freejsobfuscator.js", FIXTURE_URL), "utf-8");
  const { warnings } = runASTAnalysis(trycatch);

  tape.strictEqual(warnings.length, 3);
  tape.deepEqual(getWarningKind(warnings), [
    "encoded-literal", "encoded-literal", "obfuscated-code"
  ].sort());
  tape.strictEqual(warnings[2].value, "freejsobfuscator");
  tape.end();
});

test("should detect 'obfuscator.io' obfuscation (with hexadecimal generator)", (tape) => {
  const trycatch = readFileSync(new URL("obfuscatorio-hexa.js", FIXTURE_URL), "utf-8");
  const { warnings } = runASTAnalysis(trycatch);

  tape.strictEqual(warnings.length, 1);
  tape.deepEqual(getWarningKind(warnings), [
    "obfuscated-code"
  ].sort());
  tape.strictEqual(warnings[0].value, "obfuscator.io");
  tape.end();
});

test("should not detect 'trojan-source' when providing safe control character", (tape) => {
  const { warnings } = runASTAnalysis(`
    const simpleStringWithControlCharacters = "Its only a \u0008backspace";
  `);

  tape.deepEqual([...warnings], []);
  tape.end();
});

test("should detect 'trojan-source' when there is one unsafe unicode control char", (tape) => {
  const { warnings } = runASTAnalysis(`
    const role = "ROLE_ADMIN⁦" // Dangerous control char;
  `);

  tape.strictEqual(warnings.length, 1);
  tape.deepEqual(getWarningKind(warnings), ["obfuscated-code"]);
  tape.deepEqual(warnings[0].value, "trojan-source");
  tape.end();
});

test("should detect 'trojan-source' when there is atleast one unsafe unicode control char", async(tape) => {
  const { warnings } = await runASTAnalysisOnFile(fileURLToPath(new URL("unsafe-unicode-chars.js", FIXTURE_URL)));

  tape.strictEqual(warnings.length, 1);
  tape.deepEqual(getWarningKind(warnings), ["obfuscated-code"]);
  tape.deepEqual(warnings[0].value, "trojan-source");
  tape.end();
});
