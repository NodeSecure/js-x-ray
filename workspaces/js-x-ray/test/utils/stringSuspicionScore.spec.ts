// Import Node.js Dependencies
import assert from "node:assert";
import { randomBytes } from "node:crypto";
import { describe, it } from "node:test";

// Import Internal Dependencies
import {
  stringCharDiversity,
  stringSuspicionScore
} from "../../src/utils/index.ts";

describe("stringCharDiversity()", () => {
  it("should return the number of unique characters in a string", () => {
    assert.strictEqual(stringCharDiversity("helloo!"), 5);
  });

  it("should exclude specified characters when counting unique characters", () => {
    assert.strictEqual(stringCharDiversity("- - -\n", ["\n"]), 2);
  });
});

describe("stringSuspicionScore()", () => {
  it("should return 0 for strings shorter than 45 characters", () => {
    for (let strSize = 1; strSize < 45; strSize++) {
      // We generate a random String (with slice it in two because a size of 20 for hex is 40 bytes).
      const randomStr = randomBytes(strSize).toString("hex").slice(strSize);

      assert.strictEqual(stringSuspicionScore(randomStr), 0);
    }
  });

  it("should return 1 for strings between 45 and 200 characters with no spaces in the first 45 characters", () => {
    const randomStrWithNoSpaces = randomBytes(25).toString("hex");

    assert.strictEqual(stringSuspicionScore(randomStrWithNoSpaces), 1);
  });

  it("should return 0 for strings between 45 and 200 characters with at least one space in the first 45 characters", () => {
    const randomStrWithSpaces = randomBytes(10).toString("hex") + " -_- " + randomBytes(30).toString("hex");

    assert.strictEqual(stringSuspicionScore(randomStrWithSpaces), 0);
  });

  it("should return 2 for strings longer than 200 characters with no spaces", () => {
    const randomStr = randomBytes(200).toString("hex");

    assert.strictEqual(stringSuspicionScore(randomStr), 2);
  });

  it("should add 2 to the score when the string has more than 70 unique characters", () => {
    const randomStr = "૱꠸┯┰┱┲❗►◄Ăă0123456789ᶀᶁᶂᶃᶄᶆᶇᶈᶉᶊᶋᶌᶍᶎᶏᶐᶑᶒᶓᶔᶕᶖᶗᶘᶙᶚᶸᵯᵰᵴᵶᵹᵼᵽᵾᵿ⤢⤣⤤⤥⥆⥇™°×π±√ ";

    assert.strictEqual(stringSuspicionScore(randomStr), 3);
  });
});
