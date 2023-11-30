// Import Internal Dependencies
import {
  commonStringPrefix,
  commonStringSuffix,
  commonHexadecimalPrefix
} from "../src/patterns.js";

// Import Third-party Dependencies
import test from "tape";

test("commonStringPrefix of two strings that does not start with the same set of characters must return null", (tape) => {
  tape.strictEqual(commonStringPrefix("boo", "foo"), null,
    "there is no common prefix between 'boo' and 'foo' so the result must be null");
  tape.end();
});

test("commonStringPrefix of two strings that start with the same set of characters must return it as result", (tape) => {
  tape.strictEqual(commonStringPrefix("bromance", "brother"), "bro",
    "the common prefix between bromance and brother must be 'bro'.");
  tape.end();
});

test("commonStringSuffix of two strings that end with the same set of characters must return it as result", (tape) => {
  tape.strictEqual(commonStringSuffix("boo", "foo"), "oo",
    "the common suffix between boo and foo must be 'oo'");
  tape.end();
});

test("commonStringSuffix of two strings that does not end with the same set of characters must return null", (tape) => {
  tape.strictEqual(commonStringSuffix("bromance", "brother"), null,
    "there is no common suffix between 'bromance' and 'brother' so the result must be null");
  tape.end();
});

test("commonHexadecimalPrefix - throw a TypeError if identifiersArray is not an Array", (tape) => {
  tape.throws(() => commonHexadecimalPrefix(10), "identifiersArray must be an Array");
  tape.end();
});

test("commonHexadecimalPrefix - only hexadecimal identifiers", (tape) => {
  const data = [
    "_0x3c0c55", "_0x1185d5", "_0x160fc8", "_0x18a66f", "_0x18a835", "_0x1a8356",
    "_0x1adf3b", "_0x1e4510", "_0x1e9a2a", "_0x215558", "_0x2b0194", "_0x2fffe5",
    "_0x32c822", "_0x33bb79"
  ];
  const result = commonHexadecimalPrefix(data);

  tape.strictEqual(result.oneTimeOccurence, 0);
  tape.strictEqual(result.prefix._0x, data.length);
  tape.end();
});

test("commonHexadecimalPrefix - add one non-hexadecimal identifier", (tape) => {
  const data = [
    "_0x3c0c55", "_0x1185d5", "_0x160fc8", "_0x18a66f", "_0x18a835", "_0x1a8356",
    "_0x1adf3b", "_0x1e4510", "_0x1e9a2a", "_0x215558", "_0x2b0194", "_0x2fffe5",
    "_0x32c822", "_0x33bb79", "foo"
  ];
  const result = commonHexadecimalPrefix(data);

  tape.strictEqual(result.oneTimeOccurence, 1);
  tape.strictEqual(result.prefix._0x, data.length - 1);
  tape.end();
});
