// Import Node.js Dependencies
import test from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/AstAnalyser.ts";
import { generateWarning } from "../../src/warnings.ts";



test("should detect prototype pollution via __proto__ property access", () => {
  const str = `
    const obj = {};
    obj.__proto__.polluted = true;
  `;

  const analyser = new AstAnalyser();
  const { warnings } = analyser.analyse(str);

  assert.strictEqual(warnings.length, 1);
  assert.partialDeepStrictEqual(warnings[0], {
    kind: "prototype-pollution",
    value: "obj.__proto__",
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
    location: { start: { line: 3, column: 4 }, end: { line: 3, column: 20 } }
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
    location: { start: { line: 2, column: 16 }, end: { line: 2, column: 27 } }
  }));
});
