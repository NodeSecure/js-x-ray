// Import Node.js Dependencies
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { stringCharDiversity, isSvg, isSvgPath, stringSuspicionScore } from "../src/utils.js";

test("stringCharDiversity must return the number of unique chars in a given string", () => {
  assert.strictEqual(
    stringCharDiversity("helloo!"),
    5,
    "the following string 'helloo!' contains five unique chars: h, e, l, o and !"
  );
});

test("stringCharDiversity must return the number of unique chars in a given string (but with exclusions of given chars)", () => {
  assert.strictEqual(stringCharDiversity("- - -\n", ["\n"]), 2);
});

test("isSvg must return true for an HTML svg balise", () => {
  const SVGHTML = `<svg xmlns="http://www.w3.org/2000/svg"
        width="150" height="100" viewBox="0 0 3 2">

        <rect width="1" height="2" x="0" fill="#008d46" />
        <rect width="1" height="2" x="1" fill="#ffffff" />
        <rect width="1" height="2" x="2" fill="#d2232c" />
    </svg>`;
  assert.strictEqual(isSvg(SVGHTML), true);
});

test("isSvg of a SVG Path must return true", () => {
  assert.strictEqual(isSvg("M150 0 L75 200 L225 200 Z"), true);
});

test("isSvg must return false for invalid XML string", () => {
  assert.strictEqual(isSvg("</a>"), false);
});

test("isSvgPath must return true when we give a valid svg path and false when the string is not valid", () => {
  assert.strictEqual(isSvgPath("M150 0 L75 200 L225 200 Z"), true);
  assert.strictEqual(isSvgPath("M150"), false, "the length of an svg path must be always higher than four characters");
  assert.strictEqual(isSvgPath("hello world!"), false);
  assert.strictEqual(
    isSvgPath(10 as any),
    false,
    "isSvgPath argument must always return false for anything that is not a string primitive"
  );
});

test("stringSuspicionScore must always return 0 if the string length if below 45", () => {
  for (let strSize = 1; strSize < 45; strSize++) {
    // We generate a random String (with slice it in two because a size of 20 for hex is 40 bytes).
    const randomStr = randomBytes(strSize).toString("hex").slice(strSize);

    assert.strictEqual(stringSuspicionScore(randomStr), 0);
  }
});

test("stringSuspicionScore must return one if the str is between 45 and 200 chars and had no space in the first 45 chars", () => {
  const randomStrWithNoSpaces = randomBytes(25).toString("hex");

  assert.strictEqual(stringSuspicionScore(randomStrWithNoSpaces), 1);
});

test(`stringSuspicionScore must return zero if the str is between 45 and 200 char
  and has at least one space in the first 45 chars`, () => {
  const randomStrWithSpaces = randomBytes(10).toString("hex") + " -_- " + randomBytes(30).toString("hex");

  assert.strictEqual(stringSuspicionScore(randomStrWithSpaces), 0);
});

test("stringSuspicionScore must return a score of two for a string with more than 200 chars and no spaces", () => {
  const randomStr = randomBytes(200).toString("hex");

  assert.strictEqual(stringSuspicionScore(randomStr), 2);
});

test("stringSuspicionScore must add two to the final score when the string has more than 70 uniques chars", () => {
  const randomStr = "૱꠸┯┰┱┲❗►◄Ăă0123456789ᶀᶁᶂᶃᶄᶆᶇᶈᶉᶊᶋᶌᶍᶎᶏᶐᶑᶒᶓᶔᶕᶖᶗᶘᶙᶚᶸᵯᵰᵴᵶᵹᵼᵽᵾᵿ⤢⤣⤤⤥⥆⥇™°×π±√ ";

  assert.strictEqual(stringSuspicionScore(randomStr), 3);
});
