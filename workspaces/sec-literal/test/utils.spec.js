/* eslint-disable max-len */

// Import Node.js Dependencies
import { randomBytes } from "node:crypto";

// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { stringCharDiversity, isSvg, isSvgPath, stringSuspicionScore } from "../src/utils.js";

test("stringCharDiversity must return the number of unique chars in a given string", (tape) => {
  tape.strictEqual(stringCharDiversity("helloo!"), 5,
    "the following string 'helloo!' contains five unique chars: h, e, l, o and !");
  tape.end();
});

test("stringCharDiversity must return the number of unique chars in a given string (but with exclusions of given chars)", (tape) => {
  tape.strictEqual(stringCharDiversity("- - -\n", ["\n"]), 2);
  tape.end();
});

test("isSvg must return true for an HTML svg balise", (tape) => {
  const SVGHTML = `<svg xmlns="http://www.w3.org/2000/svg"
        width="150" height="100" viewBox="0 0 3 2">

        <rect width="1" height="2" x="0" fill="#008d46" />
        <rect width="1" height="2" x="1" fill="#ffffff" />
        <rect width="1" height="2" x="2" fill="#d2232c" />
    </svg>`;
  tape.strictEqual(isSvg(SVGHTML), true);
  tape.end();
});

test("isSvg of a SVG Path must return true", (tape) => {
  tape.strictEqual(isSvg("M150 0 L75 200 L225 200 Z"), true);
  tape.end();
});

test("isSvg must return false for invalid XML string", (tape) => {
  tape.strictEqual(isSvg("</a>"), false);
  tape.end();
});

test("isSvgPath must return true when we give a valid svg path and false when the string is not valid", (tape) => {
  tape.strictEqual(isSvgPath("M150 0 L75 200 L225 200 Z"), true);
  tape.strictEqual(isSvgPath("M150"), false, "the length of an svg path must be always higher than four characters");
  tape.strictEqual(isSvgPath("hello world!"), false);
  tape.strictEqual(isSvgPath(10), false, "isSvgPath argument must always return false for anything that is not a string primitive");
  tape.end();
});

test("stringSuspicionScore must always return 0 if the string length if below 45", (tape) => {
  for (let strSize = 1; strSize < 45; strSize++) {
    // We generate a random String (with slice it in two because a size of 20 for hex is 40 bytes).
    const randomStr = randomBytes(strSize).toString("hex").slice(strSize);

    tape.strictEqual(stringSuspicionScore(randomStr), 0);
  }
  tape.end();
});

test("stringSuspicionScore must return one if the str is between 45 and 200 chars and had no space in the first 45 chars", (tape) => {
  const randomStrWithNoSpaces = randomBytes(25).toString("hex");

  tape.strictEqual(stringSuspicionScore(randomStrWithNoSpaces), 1);
  tape.end();
});

test("stringSuspicionScore must return zero if the str is between 45 and 200 chars and has at least one space in the first 45 chars", (tape) => {
  const randomStrWithSpaces = randomBytes(10).toString("hex") + " -_- " + randomBytes(30).toString("hex");

  tape.strictEqual(stringSuspicionScore(randomStrWithSpaces), 0);
  tape.end();
});

test("stringSuspicionScore must return a score of two for a string with more than 200 chars and no spaces", (tape) => {
  const randomStr = randomBytes(200).toString("hex");

  tape.strictEqual(stringSuspicionScore(randomStr), 2);
  tape.end();
});

test("stringSuspicionScore must add two to the final score when the string has more than 70 uniques chars", (tape) => {
  const randomStr = "૱꠸┯┰┱┲❗►◄Ăă0123456789ᶀᶁᶂᶃᶄᶆᶇᶈᶉᶊᶋᶌᶍᶎᶏᶐᶑᶒᶓᶔᶕᶖᶗᶘᶙᶚᶸᵯᵰᵴᵶᵹᵼᵽᵾᵿ⤢⤣⤤⤥⥆⥇™°×π±√ ";

  tape.strictEqual(stringSuspicionScore(randomStr), 3);
  tape.end();
});
