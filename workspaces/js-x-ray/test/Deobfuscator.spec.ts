// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { Deobfuscator } from "../src/Deobfuscator.js";
import { JsSourceParser } from "../src/index.js";
import { walkEnter } from "../src/walker/index.js";

describe("Deobfuscator", () => {
  describe("identifiers and counters", () => {
    it("should detect two identifiers (class name and superClass name A.K.A extends)", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "class File extends Blob {}"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.strictEqual(counters.Identifiers, 2);
      assert.deepEqual(deobfuscator.identifiers, [
        { name: "File", type: "ClassDeclaration" },
        { name: "Blob", type: "ClassDeclaration" }
      ]);
    });

    it("should detect one identifier because there is no superClass (extension)", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "class File {}"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      assert.deepEqual(deobfuscator.identifiers, [
        { name: "File", type: "ClassDeclaration" }
      ]);
    });

    it("should detect one identifier because superClass is not an Identifier but a CallExpression", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "class File extends (foo()) {}"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      assert.deepEqual(deobfuscator.identifiers, [
        { name: "File", type: "ClassDeclaration" }
      ]);
    });

    it("should detect one FunctionDeclaration node", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "function foo() {}"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.strictEqual(counters.FunctionDeclaration, 1);
      assert.deepEqual(deobfuscator.identifiers, [
        { name: "foo", type: "FunctionDeclaration" }
      ]);
    });

    it("should detect zero FunctionDeclaration (because foo is a CallExpression Node)", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "foo();"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.strictEqual(counters.FunctionDeclaration, 0);
      assert.strictEqual(deobfuscator.identifiers.length, 0);
    });

    it("should detect zero FunctionDeclaration for an IIFE (because there is no Identifier)", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "(function() {})()"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.strictEqual(counters.FunctionDeclaration, 0);
      assert.strictEqual(deobfuscator.identifiers.length, 0);
    });

    it("should detect three identifiers (one function declaration and two FunctionParams identifier)", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "function foo(err, result) {}"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.strictEqual(counters.FunctionDeclaration, 1);
      assert.deepEqual(deobfuscator.identifiers, [
        { name: "err", type: "FunctionParams" },
        { name: "result", type: "FunctionParams" },
        { name: "foo", type: "FunctionDeclaration" }
      ]);
    });

    it("should detect a MemberExpression with two no-computed property", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "process.mainModule.foo"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.deepEqual(counters.MemberExpression, {
        false: 2
      });
    });

    it("should detect a MemberExpression with two computed properties and one non-computed", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "process.mainModule['foo']['bar']"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.deepEqual(counters.MemberExpression, {
        true: 2,
        false: 1
      });
    });

    it("should detect no MemberExpression at all", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "process"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.deepEqual(counters.MemberExpression, {});
    });

    it("should detect three identifiers (one ClassDeclaration and two MethodDefinition)", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        `class File {
          constructor() {}
          foo() {}
        }`
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      assert.deepEqual(deobfuscator.identifiers, [
        { name: "File", type: "ClassDeclaration" },
        { name: "constructor", type: "MethodDefinition" },
        { name: "foo", type: "MethodDefinition" }
      ]);
    });

    it("should detect four identifiers (one ClassDeclaration and two MethodDefinition and one FunctionParams)", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        `class File {
          get foo() {}
          set bar(value) {}
        }`
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      assert.deepEqual(deobfuscator.identifiers, [
        { name: "File", type: "ClassDeclaration" },
        { name: "foo", type: "MethodDefinition" },
        { name: "bar", type: "MethodDefinition" },
        { name: "value", type: "FunctionParams" }
      ]);
    });

    it("should detect one AssignmentExpression (with two Identifiers)", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "obj = { foo: 1 }"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.strictEqual(counters.AssignmentExpression, 1);
      assert.deepEqual(deobfuscator.identifiers, [
        { name: "obj", type: "AssignmentExpression" },
        { name: "foo", type: "Property" }
      ]);
    });

    it("should detect zero AssignmentExpression but one Identifier", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "Object.assign(obj, { foo: 1 })"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.strictEqual(counters.AssignmentExpression, 0);
      assert.deepEqual(deobfuscator.identifiers, [
        { name: "foo", type: "Property" }
      ]);
    });

    it("should detect an ObjectExpression with two Property node", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        `const obj = {
          log: ['a', 'b', 'c'],
          get latest() {
            return this.log[this.log.length - 1];
          }
        };`
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.strictEqual(counters.VariableDeclarator, 1);
      assert.strictEqual(counters.Property, 2);
      assert.deepEqual(counters.MemberExpression, {
        true: 1,
        false: 3
      });

      assert.deepEqual(deobfuscator.identifiers, [
        { name: "obj", type: "VariableDeclarator" },
        { name: "log", type: "Property" },
        { name: "latest", type: "Property" }
      ]);
    });

    it("should detect one UnaryArray", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "!![]"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.strictEqual(counters.DoubleUnaryExpression, 1);
    });

    it("should detect zero UnaryArray", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "![]"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.strictEqual(counters.DoubleUnaryExpression, 0);
    });

    it("should detect all VariableDeclaration kinds", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "var foo; const a = 5; let b = 'foo';"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.strictEqual(counters.VariableDeclarator, 3);
      assert.deepEqual(counters.VariableDeclaration, {
        var: 1,
        const: 1,
        let: 1
      });
      assert.deepEqual(deobfuscator.identifiers, [
        { name: "foo", type: "VariableDeclarator" },
        { name: "a", type: "VariableDeclarator" },
        { name: "b", type: "VariableDeclarator" }
      ]);
    });

    it("should count the number of VariableDeclarator", () => {
      const deobfuscator = new Deobfuscator();

      const body = new JsSourceParser().parse(
        "let a,b,c;"
      );
      walkAst(body, (node) => deobfuscator.walk(node));

      const counters = deobfuscator.aggregateCounters();
      assert.strictEqual(counters.VariableDeclarator, 3);
      assert.deepEqual(counters.VariableDeclaration, {
        let: 1
      });
      assert.deepEqual(deobfuscator.identifiers, [
        { name: "a", type: "VariableDeclarator" },
        { name: "b", type: "VariableDeclarator" },
        { name: "c", type: "VariableDeclarator" }
      ]);
    });
  });

  describe("analyzeString", () => {
    it("should detect static dictionary string", () => {
      const deobfuscator = new Deobfuscator();
      assert.equal(deobfuscator.hasDictionaryString, false);

      deobfuscator.analyzeString("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");

      assert.ok(deobfuscator.hasDictionaryString);
    });

    it("should detect morse", () => {
      const deobfuscator = new Deobfuscator();
      assert.equal(deobfuscator.morseLiterals.size, 0);

      const morseStr = "--.- --.--";
      deobfuscator.analyzeString(morseStr);

      assert.equal(deobfuscator.morseLiterals.size, 1);
      assert.ok(deobfuscator.morseLiterals.has(morseStr));
    });
  });
});

function walkAst(
  body: ESTree.Program["body"],
  callback: (node: ESTree.Node) => void = (_node) => undefined
) {
  walkEnter(body, function enter(node) {
    if (!Array.isArray(node)) {
      callback(node);
    }
  });
}
