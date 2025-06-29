// Import Node.js Dependencies
import { describe, it, mock } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { ProbeRunner, ProbeSignals } from "../src/ProbeRunner.js";
import { SourceFile } from "../src/SourceFile.js";

describe("ProbeRunner", () => {
  describe("constructor", () => {
    it("should instanciate class with Defaults probes when none are provide", () => {
      const pr = new ProbeRunner(new SourceFile(""));

      assert.strictEqual(pr.probes, ProbeRunner.Defaults);
    });

    it("should use provided probes with validate node as func", () => {
      const fakeProbe = [
        {
          validateNode: (node) => [node.type === "CallExpression"],
          main: mock.fn(),
          teardown: mock.fn()
        }
      ];

      const pr = new ProbeRunner(new SourceFile(""), fakeProbe);
      assert.strictEqual(pr.probes, fakeProbe);
    });

    it("should use provided probe with validate node as Array", () => {
      const fakeProbe = [
        {
          validateNode: [],
          main: mock.fn(),
          teardown: mock.fn()
        }];

      const pr = new ProbeRunner(new SourceFile(""), fakeProbe);
      assert.strictEqual(pr.probes, fakeProbe);
    });

    it("should fail if main not present", () => {
      const fakeProbe = {
        validateNode: (node) => [node.type === "CallExpression"],
        teardown: mock.fn()
      };

      function instantiateProbeRunner() {
        return new ProbeRunner(new SourceFile(""), [fakeProbe]);
      }

      assert.throws(instantiateProbeRunner, Error, "Invalid probe");
    });

    it("should fail if validate not present", () => {
      const fakeProbe = {
        main: mock.fn(),
        teardown: mock.fn()
      };

      function instantiateProbeRunner() {
        return new ProbeRunner(new SourceFile(""), [fakeProbe]);
      }

      assert.throws(instantiateProbeRunner, Error, "Invalid probe");
    });

    it("should fail if initialize initialize is present and not a function", () => {
      const fakeProbe = {
        validateNode: mock.fn(),
        main: mock.fn(),
        initialize: null
      };

      function instantiateProbeRunner() {
        return new ProbeRunner(new SourceFile(""), [fakeProbe]);
      }

      assert.throws(instantiateProbeRunner, Error, "Invalid probe");
    });
  });

  describe("walk", () => {
    it("should pass validateNode, enter main and then teardown", () => {
      const sourceFile = {};
      const fakeProbe = {
        validateNode: (node) => [node.type === "CallExpression"],
        main: mock.fn(),
        teardown: mock.fn()
      };

      const pr = new ProbeRunner(sourceFile, [
        fakeProbe
      ]);

      const astNode = {
        type: "CallExpression"
      };
      const result = pr.walk(astNode);
      assert.strictEqual(result, null);

      assert.strictEqual(fakeProbe.main.mock.calls.length, 1);
      assert.deepEqual(fakeProbe.main.mock.calls.at(0).arguments, [
        astNode, { sourceFile, data: null }
      ]);

      assert.strictEqual(fakeProbe.teardown.mock.calls.length, 1);
      assert.deepEqual(fakeProbe.teardown.mock.calls.at(0).arguments, [
        { sourceFile }
      ]);
    });

    it("should trigger and return a skip signal", () => {
      const sourceFile = {};
      const fakeProbe = {
        validateNode: (node) => [node.type === "CallExpression"],
        main: () => ProbeSignals.Skip,
        teardown: mock.fn()
      };

      const pr = new ProbeRunner(sourceFile, [
        fakeProbe
      ]);

      const astNode = {
        type: "CallExpression"
      };
      const result = pr.walk(astNode);

      assert.strictEqual(result, "skip");
      assert.strictEqual(fakeProbe.teardown.mock.calls.length, 1);
    });
  });
});
