// Import Node.js Dependencies
import test from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/AstAnalyser.ts";
import { generateWarning } from "../../src/warnings.ts";

function createSourceLocation(startLine: number, startColumn: number, endLine: number, endColumn: number): ESTree.SourceLocation {
  return {
    start: { line: startLine, column: startColumn },
    end: { line: endLine, column: endColumn }
  };
}

test("should detect prototype pollution via __proto__ property access", () => {
  const str = `
    const obj = {};
    obj.__proto__.polluted = true;
  `;

  const analyser = new AstAnalyser();
  const { warnings } = analyser.analyse(str);

  assert.strictEqual(warnings.length, 1);
  assert.deepStrictEqual(warnings[0], generateWarning("prototype-pollution", {
    value: "obj.__proto__",
    location: createSourceLocation(3, 4, 3, 17)
  }));
});

test("should detect prototype pollution via computed property access", () => {
  const str = `
    const obj = {};
    obj["__proto__"].polluted = true;
  `;

  const analyser = new AstAnalyser();
  const { warnings } = analyser.analyse(str);

  assert.strictEqual(warnings.length, 1);
  assert.deepStrictEqual(warnings[0], generateWarning("prototype-pollution", {
    value: "obj.__proto__",
    location: createSourceLocation(3, 4, 3, 20)
  }));
});

test("should detect prototype pollution via __proto__ literal", () => {
  const str = `
    const key = "__proto__";
    const obj = {};
    obj[key] = true;
  `;

  const analyser = new AstAnalyser();
  const { warnings } = analyser.analyse(str);

  assert.strictEqual(warnings.length, 1);
  assert.deepStrictEqual(warnings[0], generateWarning("prototype-pollution", {
    value: "__proto__",
    location: createSourceLocation(2, 16, 2, 27)
  }));
});
