// Import Node.js Dependencies
import { randomBytes } from "node:crypto";

// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { isHex, isSafe, CONSTANTS } from "../src/hex.js";
import { createLiteral } from "./utils/index.js";

test("isHex() of a random Hexadecimal value must return true", (tape) => {
  const hexValue = randomBytes(4).toString("hex");

  tape.strictEqual(isHex(hexValue), true, `Hexadecimal value '${hexValue}' must return true`);
  tape.end();
});

test("isHex() of an ESTree Literal containing a random Hexadecimal value must return true", (tape) => {
  const hexValue = createLiteral(randomBytes(4).toString("hex"));

  tape.strictEqual(isHex(hexValue), true, `Hexadecimal value '${hexValue.value}' must return true`);
  tape.end();
});

test("An hexadecimal value must be at least 4 chars long", (tape) => {
  const hexValue = randomBytes(1).toString("hex");

  tape.strictEqual(isHex(hexValue), false, `Hexadecimal value '${hexValue}' must return false`);
  tape.end();
});

test("isHex() of a value that is not a string or an ESTree Literal must return false", (tape) => {
  const hexValue = 100;

  tape.strictEqual(isHex(hexValue), false, "100 is typeof number so it must always return false");
  tape.end();
});

test("isSafe must return true for a value with a length lower or equal five characters", (tape) => {
  tape.ok(isSafe("h2l5x"));
  tape.end();
});

test("isSafe must return true if the string diversity is only two characters or lower", (tape) => {
  tape.ok(isSafe("aaaaaaaaaaaaaabbbbbbbbbbbbb"));
  tape.end();
});

test("isSafe must always return true if argument is only number, lower or upper letters", (tape) => {
  const values = ["00000000", "aaaaaaaa", "AAAAAAAAA"];

  for (const hexValue of values) {
    tape.ok(isSafe(hexValue));
  }
  tape.end();
});

test("isSafe() must always return true if the value start with one of the 'safe' values", (tape) => {
  for (const safeValue of CONSTANTS.SAFE_HEXA_VALUES) {
    const hexValue = safeValue + randomBytes(4).toString("hex");

    tape.ok(isSafe(hexValue));
  }
  tape.end();
});

test("isSafe must return true because it start with a safe pattern (and it must lowerCase the string)", (tape) => {
  tape.ok(isSafe("ABCDEF1234567890"));
  tape.end();
});

test("isSafe() must always return false if the value start with one of the 'unsafe' values", (tape) => {
  for (const unsafeValue of CONSTANTS.UNSAFE_HEXA_VALUES) {
    tape.strictEqual(isSafe(unsafeValue), false);
  }
  tape.end();
});
