// Import Node.js Dependencies
import { describe, it, mock } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import {
  ProbeContext,
  ProbeRunner
} from "../src/ProbeRunner.js";
import { SourceFile } from "../src/SourceFile.js";

describe("ProbeRunner", () => {
  describe("constructor", () => {
    it("should instanciate class with Defaults probes when none are provide", () => {
      const pr = new ProbeRunner(new SourceFile());

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
      const pr = new ProbeRunner(new SourceFile(), fakeProbe);
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
      const pr = new ProbeRunner(new SourceFile(), fakeProbe);
      assert.strictEqual(pr.probes, fakeProbe);
    });

    it("should fail if main not present", () => {
      const fakeProbe = {
        validateNode: (node: ESTree.Node) => [node.type === "CallExpression"],
        teardown: mock.fn()
      };

      function instantiateProbeRunner() {
        // @ts-expect-error
        return new ProbeRunner(new SourceFile(), [fakeProbe]);
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
        return new ProbeRunner(new SourceFile(), [fakeProbe]);
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
        return new ProbeRunner(new SourceFile(), [fakeProbe]);
      }

      assert.throws(instantiateProbeRunner, Error, "Invalid probe");
    });

    it("should throw if one the provided probe is sealed or frozen", () => {
      const methods = ["seal", "freeze"];
      for (const method of methods) {
        const fakeProbe = Object[method]({
          name: "frozen-probe",
          initialize() {
            return {};
          },
          validateNode: mock.fn((_: ESTree.Node) => [true]),
          main: () => ProbeRunner.Signals.Skip
        });

        assert.throws(() => {
          new ProbeRunner(
            new SourceFile(),
            [fakeProbe]
          );
        }, {
          message: "Failed to define original context for probe 'frozen-probe'"
        });
      }
    });
  });

  describe("walk", () => {
    it("should pass validateNode, enter main and then teardown", () => {
      const sourceFile = new SourceFile();
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
        astNode, { sourceFile, data: null, context: undefined, signals: ProbeRunner.Signals }
      ]);

      assert.strictEqual(fakeProbe.teardown.mock.calls.length, 1);
      assert.deepEqual(fakeProbe.teardown.mock.calls.at(0)?.arguments, [
        { sourceFile, context: undefined }
      ]);
    });

    it("should forward validateNode data to main", () => {
      const data = { test: "data" };
      const fakeProbe = {
        validateNode: mock.fn((_: ESTree.Node) => [true, data]),
        main: mock.fn(() => ProbeRunner.Signals.Skip)
      };

      const sourceFile = new SourceFile();

      const pr = new ProbeRunner(
        sourceFile,
        // @ts-expect-error
        [fakeProbe]
      );

      const astNode: ESTree.Literal = {
        type: "Literal",
        value: "test"
      };
      pr.walk(astNode);
      pr.finalize();

      const expectedContext = { sourceFile, context: undefined };
      assert.deepEqual(fakeProbe.validateNode.mock.calls.at(0)?.arguments, [
        astNode, expectedContext
      ]);
      assert.deepEqual(fakeProbe.main.mock.calls.at(0)?.arguments, [
        astNode, { ...expectedContext, data, signals: ProbeRunner.Signals }
      ]);
    });

    it("should trigger and return a skip signal", () => {
      const fakeProbe = {
        validateNode: (node: ESTree.Node) => [node.type === "Literal"],
        main: () => ProbeRunner.Signals.Skip,
        teardown: mock.fn()
      };

      const pr = new ProbeRunner(
        new SourceFile(),
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
        main: () => ProbeRunner.Signals.Skip,
        finalize: mock.fn()
      };

      const fakeProbeSkip = {
        validateNode: (_: ESTree.Node) => [true],
        main: () => ProbeRunner.Signals.Skip,
        teardown: mock.fn(),
        finalize: mock.fn()
      };

      const fakeProbeBreak = {
        validateNode: (_: ESTree.Node) => [true],
        main: () => ProbeRunner.Signals.Break,
        teardown: mock.fn(),
        finalize: mock.fn()
      };

      const probes = [fakeProbe, fakeProbeBreak, fakeProbeSkip];

      const sourceFile = new SourceFile();

      const pr = new ProbeRunner(
        sourceFile,
        // @ts-expect-error
        probes
      );

      pr.finalize();

      probes.forEach((probe) => {
        assert.strictEqual(probe.finalize.mock.calls.length, 1);
        assert.deepEqual(probe.finalize.mock.calls.at(0)?.arguments, [
          { sourceFile, context: undefined }
        ]);
      });
    });
  });

  describe("context", () => {
    it("should define context with initialize and dispatch it to all methods", () => {
      const fakeCtx = {};

      const fakeProbe = {
        initialize: mock.fn(() => fakeCtx),
        validateNode: mock.fn((_: ESTree.Node) => [true]),
        main: mock.fn(() => ProbeRunner.Signals.Skip),
        finalize: mock.fn()
      };

      const sourceFile = new SourceFile();

      const pr = new ProbeRunner(
        sourceFile,
        // @ts-expect-error
        [fakeProbe]
      );

      const astNode: ESTree.Literal = {
        type: "Literal",
        value: "test"
      };
      pr.walk(astNode);
      pr.finalize();

      const expectedContext = { sourceFile, context: fakeCtx };
      assert.deepEqual(fakeProbe.validateNode.mock.calls.at(0)?.arguments, [
        astNode, expectedContext
      ]);
      assert.deepEqual(fakeProbe.main.mock.calls.at(0)?.arguments, [
        astNode, { ...expectedContext, data: null, signals: ProbeRunner.Signals }
      ]);
      assert.deepEqual(fakeProbe.initialize.mock.calls.at(0)?.arguments, [
        { sourceFile, context: undefined }
      ]);
      assert.deepEqual(fakeProbe.finalize.mock.calls.at(0)?.arguments, [
        expectedContext
      ]);
    });

    it("should define context within the probe and dispatch it to all methods", () => {
      const fakeCtx = {};
      const fakeProbe = {
        initialize: mock.fn(),
        validateNode: mock.fn((_: ESTree.Node) => [true]),
        main: mock.fn(() => ProbeRunner.Signals.Skip),
        finalize: mock.fn(),
        context: fakeCtx
      };

      const sourceFile = new SourceFile();

      const pr = new ProbeRunner(
        sourceFile,
        // @ts-expect-error
        [fakeProbe]
      );

      const astNode: ESTree.Literal = {
        type: "Literal",
        value: "test"
      };
      pr.walk(astNode);
      pr.finalize();

      const expectedContext = { sourceFile, context: fakeCtx };
      assert.deepEqual(fakeProbe.validateNode.mock.calls.at(0)?.arguments, [
        astNode, expectedContext
      ]);
      assert.deepEqual(fakeProbe.main.mock.calls.at(0)?.arguments, [
        astNode, { ...expectedContext, data: null, signals: ProbeRunner.Signals }
      ]);
      assert.deepEqual(fakeProbe.finalize.mock.calls.at(0)?.arguments, [
        expectedContext
      ]);
      assert.deepEqual(fakeProbe.initialize.mock.calls.at(0)?.arguments, [
        expectedContext
      ]);
    });

    it("should deep clone initialization context and clear context when the probe is fully executed", () => {
      const fakeCtx = {};
      const fakeProbe: any = {
        initialize() {
          return fakeCtx;
        },
        validateNode: mock.fn((_: ESTree.Node) => [true]),
        main(_node: ESTree.Node, ctx: Required<ProbeContext>) {
          ctx.context.hello = "world";

          return ProbeRunner.Signals.Skip;
        }
      };

      const sourceFile = new SourceFile();

      const pr = new ProbeRunner(
        sourceFile,
        [fakeProbe]
      );

      const astNode: ESTree.Literal = {
        type: "Literal",
        value: "test"
      };
      pr.walk(astNode);
      assert.deepEqual(fakeProbe.context, {
        hello: "world"
      });

      pr.finalize();

      assert.strictEqual(fakeProbe.context, undefined);
      const { context = null } = fakeProbe.validateNode.mock.calls.at(0)?.arguments[1] ?? {};
      assert.deepEqual(context, {
        hello: "world"
      });
      assert.notStrictEqual(context, fakeCtx);
    });
  });
});
