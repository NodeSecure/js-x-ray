// Import Node.js Dependencies
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import {
  AstAnalyser
} from "../index.js";
import { getWarningKind } from "./utils/index.js";

// CONSTANTS
const FIXTURE_URL = new URL("fixtures/obfuscated/", import.meta.url);

test("should detect 'jsfuck' obfuscation", () => {
  const trycatch = readFileSync(new URL("jsfuck.js", FIXTURE_URL), "utf-8");
  const { warnings } = new AstAnalyser().analyse(trycatch);

  assert.strictEqual(warnings.length, 1);
  assert.deepEqual(getWarningKind(warnings), ["obfuscated-code"].sort());
  assert.strictEqual(warnings[0].value, "jsfuck");
});

test("should detect 'morse' obfuscation", () => {
  const trycatch = readFileSync(new URL("morse.js", FIXTURE_URL), "utf-8");
  const { warnings } = new AstAnalyser().analyse(trycatch);

  assert.strictEqual(warnings.length, 1);
  assert.deepEqual(getWarningKind(warnings), ["obfuscated-code"].sort());
  assert.strictEqual(warnings[0].value, "morse");
});

test("should not detect 'morse' obfuscation", () => {
  const trycatch = readFileSync(new URL("notMorse.js", FIXTURE_URL), "utf-8");
  const { warnings } = new AstAnalyser().analyse(trycatch);

  assert.strictEqual(warnings.length, 0);
});

test("should not detect 'morse' obfuscation for high number of doubles morse symbols", () => {
  const morseSymbolDoublesString = `const a = ${"'.' + '..' +".repeat(37)} '.'`;
  const { warnings } = new AstAnalyser().analyse(morseSymbolDoublesString);

  assert.strictEqual(warnings.length, 0);
});

test("should detect 'jjencode' obfuscation", () => {
  const trycatch = readFileSync(
    new URL("jjencode.js", FIXTURE_URL),
    "utf-8"
  );
  const { warnings } = new AstAnalyser().analyse(trycatch);

  assert.strictEqual(warnings.length, 1);
  assert.deepEqual(getWarningKind(warnings), ["obfuscated-code"].sort());
  assert.strictEqual(warnings[0].value, "jjencode");
});

test("should detect 'freejsobfuscator' obfuscation", () => {
  const trycatch = readFileSync(
    new URL("freejsobfuscator.js", FIXTURE_URL),
    "utf-8"
  );
  const { warnings } = new AstAnalyser().analyse(trycatch);

  assert.deepEqual(getWarningKind(warnings), [
    "encoded-literal", "encoded-literal", "obfuscated-code"
  ].sort());
  assert.strictEqual(warnings[2].value, "freejsobfuscator");
});

test("should detect 'obfuscator.io' obfuscation (with hexadecimal generator)", () => {
  const trycatch = readFileSync(
    new URL("obfuscatorio-hexa.js", FIXTURE_URL),
    "utf-8"
  );
  const { warnings } = new AstAnalyser().analyse(trycatch);

  assert.strictEqual(warnings.length, 1);
  assert.deepEqual(getWarningKind(warnings), [
    "obfuscated-code"
  ].sort());
  assert.strictEqual(warnings[0].value, "obfuscator.io");
});

test("should not detect 'trojan-source' when providing safe control character", () => {
  const { warnings } = new AstAnalyser().analyse(`
    const simpleStringWithControlCharacters = "Its only a \u0008backspace";
  `);

  assert.deepEqual([...warnings], []);
});

test("should detect 'trojan-source' when there is one unsafe unicode control char", () => {
  const { warnings } = new AstAnalyser().analyse(`
    const role = "ROLE_ADMIN⁦" // Dangerous control char;
  `);

  assert.strictEqual(warnings.length, 1);
  assert.deepEqual(getWarningKind(warnings), ["obfuscated-code"]);
  assert.deepEqual(warnings[0].value, "trojan-source");
});

test("should detect 'trojan-source' when there is atleast one unsafe unicode control char", () => {
  const { warnings } = new AstAnalyser().analyseFileSync(
    fileURLToPath(new URL("unsafe-unicode-chars.js", FIXTURE_URL))
  );

  assert.strictEqual(warnings.length, 1);
  assert.deepEqual(getWarningKind(warnings), ["obfuscated-code"]);
  assert.deepEqual(warnings[0].value, "trojan-source");
});
