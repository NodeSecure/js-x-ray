// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { isMinifiedCode } from "../../src/utils/index.ts";

describe("isMinifiedCode", () => {
  it("should return false for formatted multi-line code", () => {
    const formattedCode = `
            function add(a, b) {
                return a + b;
            }
        `;
    assert.strictEqual(isMinifiedCode(formattedCode), false);
  });

  it("should return true for a single line code", () => {
    const minifiedCode = "function add(a,b){return a+b;}";
    assert.strictEqual(isMinifiedCode(minifiedCode), true);
  });

  it("should return true when median line length exceeds 200", () => {
    const longString = "a".repeat(250);
    const code = `
${longString}
${longString}
`;
    assert.strictEqual(isMinifiedCode(code), true);
  });

  it("should ignore comments when evaluating minification", () => {
    const code = `
    // this is a comment
    function test() {
    return 1;
    }
    `;
    assert.strictEqual(isMinifiedCode(code), false);
  });

  it("should handle empty code as minified", () => {
    assert.strictEqual(isMinifiedCode(""), true);
  });

  it("should treat comment-only code as minified", () => {
    const code = `
// comment
/* block comment */
`;
    assert.strictEqual(isMinifiedCode(code), true);
  });

  it("should not be affected by a single long line", () => {
    const longLine = "a".repeat(250);
    const code = `
short line
${longLine}
short line
`;
    assert.strictEqual(isMinifiedCode(code), false);
  });
});
