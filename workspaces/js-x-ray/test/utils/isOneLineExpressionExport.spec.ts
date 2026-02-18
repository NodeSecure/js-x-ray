// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Third-party Dependencies
import { parseScript } from "meriyah";

// Import Internal Dependencies
import { isOneLineExpressionExport } from "../../src/utils/index.ts";
describe("isOneLineExpressionExport()", () => {
  it("should return false for empty body", () => {
    assert.strictEqual(isOneLineExpressionExport([]), false);
  });

  it("should return false for multiple statements", () => {
    const body = parseScript(`
        require('a');
        require('b');
    `).body;
    assert.strictEqual(isOneLineExpressionExport(body), false);
  });

  it("should return true for single require call", () => {
    const body = parseScript("require('a');").body;
    assert.strictEqual(isOneLineExpressionExport(body), true);
  });

  it("should return true for module.exports assignment to require", () => {
    const body = parseScript("module.exports = require('a');").body;
    assert.strictEqual(isOneLineExpressionExport(body), true);
  });

  it("should return true for conditional require export", () => {
    const body = parseScript(`
        module.exports = condition ? require('a') : require('b');
        `).body;
    assert.strictEqual(isOneLineExpressionExport(body), true);
  });

  it("should return true for logical require export", () => {
    const body = parseScript(`
        module.exports = condition && require('b');
        `).body;
    assert.strictEqual(isOneLineExpressionExport(body), true);
  });

  it("should return false for non-require expression", () => {
    const body = parseScript("module.exports = foo();").body;
    assert.strictEqual(isOneLineExpressionExport(body), false);
  });

  it("should return true for require member access", () => {
    const body = parseScript(`
    module.exports = require("foo").bar.baz;
  `).body;
    assert.strictEqual(isOneLineExpressionExport(body), true);
  });

  it("should return false for non-require member access", () => {
    const body = parseScript(`module.exports = something.require("foo");`).body;
    assert.strictEqual(isOneLineExpressionExport(body), false);
  });
});
