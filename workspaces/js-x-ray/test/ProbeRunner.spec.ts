// Import Node.js Dependencies
import { describe, it, mock } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import {
  ProbeRunner,
  ProbeSignals
} from "../src/ProbeRunner.js";
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
          validateNode: (node: ESTree.Node) => [node.type === "CallExpression"],
          main: mock.fn(),
          teardown: mock.fn()
        }
      ];

      // @ts-expect-error
      const pr = new ProbeRunner(new SourceFile(""), fakeProbe);
      assert.strictEqual(pr.probes, fakeProbe);
    });

    it("should use provided probe with validate node as Array", () => {
      const fakeProbe = [
        {
          validateNode: [],
          main: mock.fn(),
          teardown: mock.fn()
        }
      ];

      // @ts-expect-error
      const pr = new ProbeRunner(new SourceFile(""), fakeProbe);
      assert.strictEqual(pr.probes, fakeProbe);
    });

    it("should fail if main not present", () => {
      const fakeProbe = {
        validateNode: (node: ESTree.Node) => [node.type === "CallExpression"],
        teardown: mock.fn()
      };

      function instantiateProbeRunner() {
        // @ts-expect-error
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
        // @ts-expect-error
        return new ProbeRunner(new SourceFile(""), [fakeProbe]);
      }

      assert.throws(instantiateProbeRunner, Error, "Invalid probe");
    });

    it("should fail if initialize is present and not a function", () => {
      const fakeProbe = {
        validateNode: mock.fn(),
        main: mock.fn(),
        initialize: null
      };

      function instantiateProbeRunner() {
        // @ts-expect-error
        return new ProbeRunner(new SourceFile(""), [fakeProbe]);
      }

      assert.throws(instantiateProbeRunner, Error, "Invalid probe");
    });
  });

  describe("walk", () => {
    it("should pass validateNode, enter main and then teardown", () => {
      const sourceFile = new SourceFile("");
      const fakeProbe = {
        validateNode: (node: ESTree.Node) => [node.type === "Literal"],
        main: mock.fn(),
        teardown: mock.fn()
      };

      // @ts-expect-error
      const pr = new ProbeRunner(sourceFile, [fakeProbe]);

      const astNode: ESTree.Literal = {
        type: "Literal",
        value: "test"
      };
      const result = pr.walk(astNode);
      assert.strictEqual(result, null);

      assert.strictEqual(fakeProbe.main.mock.calls.length, 1);
      assert.deepEqual(fakeProbe.main.mock.calls.at(0)?.arguments, [
        astNode, { sourceFile, data: null }
      ]);

      assert.strictEqual(fakeProbe.teardown.mock.calls.length, 1);
      assert.deepEqual(fakeProbe.teardown.mock.calls.at(0)?.arguments, [
        { sourceFile }
      ]);
    });

    it("should trigger and return a skip signal", () => {
      const fakeProbe = {
        validateNode: (node: ESTree.Node) => [node.type === "Literal"],
        main: () => ProbeSignals.Skip,
        teardown: mock.fn()
      };

      const pr = new ProbeRunner(
        new SourceFile(""),
        // @ts-expect-error
        [fakeProbe]
      );

      const astNode: ESTree.Node = {
        type: "Literal",
        value: "test"
      };
      const result = pr.walk(astNode);

      assert.strictEqual(result, "skip");
      assert.strictEqual(fakeProbe.teardown.mock.calls.length, 1);
    });
  });

  describe("finalize", () => {
    it("should call the finalize methods", () => {
      const fakeProbe = {
        validateNode: (_: ESTree.Node) => [true],
        main: () => ProbeSignals.Skip,
        finalize: mock.fn()
      };

      const fakeProbeSkip = {
        validateNode: (_: ESTree.Node) => [true],
        main: () => ProbeSignals.Skip,
        teardown: mock.fn(),
        finalize: mock.fn()
      };

      const fakeProbeBreak = {
        validateNode: (_: ESTree.Node) => [true],
        main: () => ProbeSignals.Break,
        teardown: mock.fn(),
        finalize: mock.fn()
      };

      const probes = [fakeProbe, fakeProbeBreak, fakeProbeSkip];

      const sourceFile = new SourceFile("");

      const pr = new ProbeRunner(
        sourceFile,
        // @ts-expect-error
        probes
      );

      pr.finalize();

      probes.forEach((probe) => {
        assert.strictEqual(probe.finalize.mock.calls.length, 1);
        assert.deepEqual(probe.finalize.mock.calls.at(0)?.arguments, [
          sourceFile
        ]);
      });
    });
  });
});
