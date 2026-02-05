// Import Node.js Dependencies
import { test, type TestContext } from "node:test";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/AstAnalyser.ts";

test("should detect prototype pollution via __proto__ property access", (t: TestContext) => {
  const str = `
    const obj = {};
    obj.__proto__.polluted = true;
  `;

  const analyser = new AstAnalyser();
  const { warnings } = analyser.analyse(str);

  t.assert.strictEqual(warnings.length, 1);
  t.assert.deepStrictEqual(
    { kind: warnings[0].kind, value: warnings[0].value },
    { kind: "prototype-pollution", value: "obj.__proto__" }
  );
});

test("should detect prototype pollution via computed property access", (t: TestContext) => {
  const str = `
    const obj = {};
    obj["__proto__"].polluted = true;
  `;

  const analyser = new AstAnalyser();
  const { warnings } = analyser.analyse(str);

  t.assert.strictEqual(warnings.length, 1);
  t.assert.deepStrictEqual(
    { kind: warnings[0].kind, value: warnings[0].value },
    { kind: "prototype-pollution", value: "obj.__proto__" }
  );
});

test("should detect prototype pollution via __proto__ literal", (t: TestContext) => {
  const str = `
    const key = "__proto__";
    const obj = {};
    obj[key] = true;
  `;

  const analyser = new AstAnalyser();
  const { warnings } = analyser.analyse(str);

  t.assert.strictEqual(warnings.length, 1);
  t.assert.deepStrictEqual(
    { kind: warnings[0].kind, value: warnings[0].value },
    { kind: "prototype-pollution", value: "__proto__" }
  );
});
