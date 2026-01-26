
// Import Node.js Dependencies
import { describe, test } from "node:test";

// Import Internal Dependencies
import isMonkeyPatch, { JS_TYPES } from "../../src/probes/isMonkeyPatch.ts";
import { getSastAnalysis, parseScript } from "../utils/index.ts";

describe("isMonkeyPatch", () => {
  test("should detect monkey patching via direct prototype assignment", (t) => {
    t.plan(JS_TYPES.size * 2);

    for (const jsType of JS_TYPES) {
      const computed = Math.random() > 0.5 ? `["prototype"]` : ".prototype";
      const str = `${jsType}${computed}.any = function() {};`;

      const ast = parseScript(str);
      const sastAnalysis = getSastAnalysis(isMonkeyPatch);
      sastAnalysis.execute(ast);

      const outputWarnings = sastAnalysis.warnings();

      t.assert.equal(outputWarnings.length, 1);
      t.assert.partialDeepStrictEqual(outputWarnings[0], {
        kind: "monkey-patch",
        value: `${jsType}.prototype`
      });
    }
  });

  test("should detect monkey patching via Object.defineProperty", (t) => {
    const str = `Object.defineProperty(Array.prototype, "map", {
      configurable: true,
      enumerable: false,
      writable: true,
      value: function mapper(fn, thisArg) {}
    });`;

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(isMonkeyPatch);
    sastAnalysis.execute(ast);

    const outputWarnings = sastAnalysis.warnings();

    t.assert.equal(outputWarnings.length, 1);
    t.assert.partialDeepStrictEqual(outputWarnings[0], {
      kind: "monkey-patch",
      value: "Array.prototype"
    });
  });

  test("should detect monkey patching via Reflect.defineProperty", (t) => {
    const str = `Reflect.defineProperty(Array.prototype, "map", {
      configurable: true,
      enumerable: false,
      writable: true,
      value: function mapper(fn, thisArg) {}
    });`;

    const ast = parseScript(str);
    const sastAnalysis = getSastAnalysis(isMonkeyPatch);
    sastAnalysis.execute(ast);

    const outputWarnings = sastAnalysis.warnings();

    t.assert.equal(outputWarnings.length, 1);
    t.assert.partialDeepStrictEqual(outputWarnings[0], {
      kind: "monkey-patch",
      value: "Array.prototype"
    });
  });
});
