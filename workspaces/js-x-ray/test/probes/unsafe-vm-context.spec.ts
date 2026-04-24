// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

describe("unsafe vm context probe", () => {
  test("should detect vm.runInNewContext usage [member expresion]", () => {
    const code = `
import vm from "node:vm";

const result = vm.runInNewContext(\`
    const proto = this.constructor.constructor;
    proto("return process")()\`);
`;

    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

    assert.strictEqual(outputWarnings.length, 1);
    assert.deepEqual(outputWarnings[0].kind, "unsafe-vm-context");
    assert.strictEqual(outputWarnings[0].value, "vm.runInNewContext");
  });

  test("should detect vm.runInNewContext usage [direct call expresion]", () => {
    const code = `
const { runInNewContext } = require("vm");

const result = runInNewContext(\`
    const proto = this.constructor.constructor;
    proto("return process")()\`);
`;

    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

    assert.strictEqual(outputWarnings.length, 1);
    assert.deepEqual(outputWarnings[0].kind, "unsafe-vm-context");
    assert.strictEqual(outputWarnings[0].value, "vm.runInNewContext");
  });

  test("should be able to follow re-assignment", () => {
    const code = `
import { runInNewContext } from "vm";

const fn = runInNewContext;

const result = fn(\`
    const proto = this.constructor.constructor;
    proto("return process")()\`);
`;

    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

    assert.strictEqual(outputWarnings.length, 1);
    assert.deepEqual(outputWarnings[0].kind, "unsafe-vm-context");
    assert.strictEqual(outputWarnings[0].value, "vm.runInNewContext");
  });

  test("should not detect vm.runInNewContext when vm.runInNewContext is not called", () => {
    const code = `
import { runInNewContext } from "node:vm";
`;

    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

    assert.strictEqual(outputWarnings.length, 0);
  });

  test("should not detect vm.runInNewContext when vm is not imported", () => {
    const code = `
function runInNewContext(code){
  return null;
}

const code = \`
    const proto = this.constructor.constructor;
    proto("return process")()\`

const result = runInNewContext(code);

const vm = {
  runInNewContext(code) {
    return null;
  }
}

vm.runInNewContext(code);
`;
    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

    assert.strictEqual(outputWarnings.length, 0);
  });
});
