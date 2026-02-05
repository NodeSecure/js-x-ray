// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import {
  isSvg,
  isSvgPath
} from "../../src/utils/index.ts";

describe("isSvg()", () => {
  it("should return true for an HTML SVG element", () => {
    const SVGHTML = `<svg xmlns="http://www.w3.org/2000/svg"
          width="150" height="100" viewBox="0 0 3 2">

          <rect width="1" height="2" x="0" fill="#008d46" />
          <rect width="1" height="2" x="1" fill="#ffffff" />
          <rect width="1" height="2" x="2" fill="#d2232c" />
      </svg>`;
    assert.strictEqual(isSvg(SVGHTML), true);
  });

  it("should return true for an SVG path string", () => {
    assert.strictEqual(isSvg("M150 0 L75 200 L225 200 Z"), true);
  });

  it("should return false for invalid XML string", () => {
    assert.strictEqual(isSvg("</a>"), false);
  });
});

describe("isSvgPath()", () => {
  it("should return true for a valid SVG path", () => {
    assert.strictEqual(isSvgPath("M150 0 L75 200 L225 200 Z"), true);
  });

  it("should return false for an SVG path shorter than 4 characters", () => {
    assert.strictEqual(isSvgPath("M150"), false);
  });

  it("should return false for a non-SVG path string", () => {
    assert.strictEqual(isSvgPath("hello world!"), false);
  });

  it("should return false for non-string arguments", () => {
    assert.strictEqual(
      // @ts-expect-error
      isSvgPath(10),
      false
    );
  });
});
