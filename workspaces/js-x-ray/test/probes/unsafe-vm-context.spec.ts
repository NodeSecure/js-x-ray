// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { AstAnalyser } from "../../src/index.ts";

describe("unsafe vm context probe", () => {
  describe("vm.runInNewContext", () => {
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
    proto("return process")()\`;

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

  describe("new vm.Script(code, options)).runInContext", () => {
    test("should detect runInContext usage [member expresion]", () => {
      const code = `
import vm from "node:vm";

const code = \`
    const proto = this.constructor.constructor;
    proto("return process")()\`;

const script1 = new vm.Script(code);

const script2 = new vm.Script(code);

const result1 = script1.runInContext();

const result2 = script2.runInContext();
`;

      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 2);
      assert.deepEqual(outputWarnings[0].kind, "unsafe-vm-context");
      assert.strictEqual(outputWarnings[0].value, "(new vm.Script(code, options)).runInContext");
      assert.deepEqual(outputWarnings[1].kind, "unsafe-vm-context");
      assert.strictEqual(outputWarnings[1].value, "(new vm.Script(code, options)).runInContext");
    });

    test("should detect runInContext usage [direct expresion]", () => {
      const code = `
const { Script } = require("node:vm");

const code = \`
    const proto = this.constructor.constructor;
    proto("return process")()\`;

const script1 = new Script(code);

const script2 = new Script(code);

const result1 = script1.runInContext();

const result2 = script2.runInContext();
`;

      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 2);
      assert.deepEqual(outputWarnings[0].kind, "unsafe-vm-context");
      assert.strictEqual(outputWarnings[0].value, "(new vm.Script(code, options)).runInContext");
      assert.deepEqual(outputWarnings[1].kind, "unsafe-vm-context");
      assert.strictEqual(outputWarnings[1].value, "(new vm.Script(code, options)).runInContext");
    });

    test("should not detect runInContext when the vm module is not imported", () => {
      const code = `
const vm = {};

class Script {
  runInContext() {
    return null;
  }
};

vm.Script = Script;

const code = \`
    const proto = this.constructor.constructor;
    proto("return process")()\`;

const script1 = new vm.Script(code);

const script2 = new vm.Script(code);

const result1 = script1.runInContext();

const result2 = script2.runInContext();
`;
      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    test("should not detect runInContext if the call does not come from vm.Script.runInContext", () => {
      const code = `
const vm = {};

class Script {
  runInContext() {
    return null;
  }
};

vm.Script = Script;

const code = \`
    const proto = this.constructor.constructor;
    proto("return process")()\`;

const script = new vm.Script(code);

function runInContext(code){
return code;
}

runInContext(code);

`;

      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    test("should follow consecutive assignment of vm.Script", () => {
      const code = `
import vm from "node:vm";

const code = \`
    const proto = this.constructor.constructor;
    proto("return process")()\`;

const script = new vm.Script(code);

const scriptBis = script;

const x = scriptBis;

x.runInContext();

`;

      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.deepEqual(outputWarnings[0].kind, "unsafe-vm-context");
      assert.strictEqual(outputWarnings[0].value, "(new vm.Script(code, options)).runInContext");
    });

    test("should not detect runInContext when vm.Script.runInContext is not called but Script instantiated", () => {
      const code = `
import vm from "node:vm";

const code = \`
    const proto = this.constructor.constructor;
    proto("return process")()\`;

const script = new vm.Script(code);

function runInContext(code){
return code;
}

runInContext(code);
`;

      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 0);
    });

    test("should follow consecutive re-assignment of runInContext", () => {
      const code = `
import vm from "node:vm";

const code = \`
    const proto = this.constructor.constructor;
    proto("return process")()\`;

const script = new vm.Script(code);

const scriptBis = script;

const x = scriptBis;

const y = x.runInContext;

y();

`;

      const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

      assert.strictEqual(outputWarnings.length, 1);
      assert.deepEqual(outputWarnings[0].kind, "unsafe-vm-context");
      assert.strictEqual(outputWarnings[0].value, "(new vm.Script(code, options)).runInContext");
    });
  });

  test("should detect both vm.runInNewContext and vm.Script.runInContext", () => {
    const code = `
import vm from "node:vm";

const code = \`
    const proto = this.constructor.constructor;
    proto("return process")()\`;

const result = vm.runInNewContext(code);


const script = new vm.Script(code);

script.runInContext();
`;

    const { warnings: outputWarnings } = new AstAnalyser().analyse(code);

    assert.strictEqual(outputWarnings.length, 2);
    assert.deepEqual(outputWarnings[0].kind, "unsafe-vm-context");
    assert.strictEqual(outputWarnings[0].value, "vm.runInNewContext");
    assert.deepEqual(outputWarnings[1].kind, "unsafe-vm-context");
    assert.strictEqual(outputWarnings[1].value, "(new vm.Script(code, options)).runInContext");
  });
});
