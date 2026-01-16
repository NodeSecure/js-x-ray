// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it, mock } from "node:test";

// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import {
  type ProbeContext,
  ProbeRunner
} from "../src/ProbeRunner.ts";
import { SourceFile } from "../src/SourceFile.ts";
import { CollectableSetRegistry } from "../src/CollectableSetRegistry.ts";

function assertProbeCtx(ctx: unknown, expected: {
  sourceFile: SourceFile;
  collectableSetRegistry: CollectableSetRegistry;
  context?: any;
}) {
  const c = ctx as any;
  assert.strictEqual(c.sourceFile, expected.sourceFile);
  assert.strictEqual(c.collectableSetRegistry, expected.collectableSetRegistry);
  assert.deepStrictEqual(c.context, expected.context);
  assert.strictEqual(typeof c.setEntryPoint, "function");
}

function assertProbeMainContext(ctx: unknown, expected: {
  sourceFile: SourceFile;
  collectableSetRegistry: CollectableSetRegistry;
  context?: any;
  data?: any;
  signals: any;
}) {
  const c = ctx as any;
  assertProbeCtx(c, expected);
  assert.deepStrictEqual(c.data, expected.data);
  assert.strictEqual(c.signals, expected.signals);
}

describe("ProbeRunner", () => {
  describe("constructor", () => {
    it("should instanciate class with Defaults probes when none are provide", () => {
      const pr = new ProbeRunner(new SourceFile(), new CollectableSetRegistry([]));

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

      const pr = new ProbeRunner(new SourceFile(),
        new CollectableSetRegistry([]),
        // @ts-expect-error
        fakeProbe);
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

      const pr = new ProbeRunner(new SourceFile(),
        new CollectableSetRegistry([]),
        // @ts-expect-error
        fakeProbe);
      assert.strictEqual(pr.probes, fakeProbe);
    });

    it("should fail if main not present", () => {
      const fakeProbe = {
        validateNode: (node: ESTree.Node) => [node.type === "CallExpression"],
        teardown: mock.fn()
      };

      function instantiateProbeRunner() {
        return new ProbeRunner(new SourceFile(),
          new CollectableSetRegistry([]),
          // @ts-expect-error
          [fakeProbe]);
      }

      assert.throws(instantiateProbeRunner, Error, "Invalid probe");
    });

    it("should fail if validate not present", () => {
      const fakeProbe = {
        main: mock.fn(),
        teardown: mock.fn()
      };

      function instantiateProbeRunner() {
        return new ProbeRunner(new SourceFile(),
          new CollectableSetRegistry([]),
          // @ts-expect-error
          [fakeProbe]);
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
        return new ProbeRunner(
          new SourceFile(),
          new CollectableSetRegistry([]),
          // @ts-expect-error
          [fakeProbe]
        );
      }

      assert.throws(instantiateProbeRunner, Error, "Invalid probe");
    });

    it("should throw if one the provided probe is sealed or frozen", () => {
      const methods = ["seal", "freeze"];
      for (const method of methods) {
        // @ts-expect-error
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
            new CollectableSetRegistry([]),
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

      const registry = new CollectableSetRegistry([]);
      // @ts-expect-error
      const pr = new ProbeRunner(sourceFile, registry, [fakeProbe]);

      const astNode: ESTree.Literal = {
        type: "Literal",
        value: "test"
      };
      const result = pr.walk(astNode);
      assert.strictEqual(result, null);

      const mainCallArgs = fakeProbe.main.mock.calls.at(0)?.arguments;
      assert.ok(mainCallArgs, "mainCallArgs should be defined");
      assert.strictEqual(mainCallArgs[0], astNode);
      
      assertProbeMainContext(mainCallArgs[1], {
        sourceFile,
        collectableSetRegistry: registry,
        context: undefined,
        data: null,
        signals: ProbeRunner.Signals
      });

      assert.strictEqual(fakeProbe.teardown.mock.calls.length, 1);
      const teardownCallArgs = fakeProbe.teardown.mock.calls.at(0)?.arguments;
      assert.ok(teardownCallArgs);
      assertProbeCtx(teardownCallArgs[0], {
        sourceFile,
        collectableSetRegistry: registry,
        context: undefined
      });
    });

    it("should forward validateNode data to main", () => {
      const data = { test: "data" };
      const fakeProbe = {
        validateNode: mock.fn((_: ESTree.Node) => [true, data]),
        main: mock.fn(() => ProbeRunner.Signals.Skip)
      };

      const sourceFile = new SourceFile();

      const registry = new CollectableSetRegistry([]);
      const pr = new ProbeRunner(
        sourceFile,
        registry,
        // @ts-expect-error
        [fakeProbe]
      );

      const astNode: ESTree.Literal = {
        type: "Literal",
        value: "test"
      };
      pr.walk(astNode);
      pr.finalize();

      const expectedContext = {
        collectableSetRegistry: registry,
        sourceFile,
        context: undefined
      };
      
      const validateNodeArgs = fakeProbe.validateNode.mock.calls.at(0)?.arguments;
      assert.ok(validateNodeArgs);
      assert.strictEqual(validateNodeArgs[0], astNode);
      assertProbeCtx((validateNodeArgs as any)[1], expectedContext);

      const mainArgs = fakeProbe.main.mock.calls.at(0)?.arguments;
      assert.ok(mainArgs);
      assert.strictEqual((mainArgs as any)[0], astNode);
      assertProbeMainContext((mainArgs as any)[1], {
        ...expectedContext,
        data,
        signals: ProbeRunner.Signals
      });
    });

    it("should trigger and return a skip signal", () => {
      const fakeProbe = {
        validateNode: (node: ESTree.Node) => [node.type === "Literal"],
        main: () => ProbeRunner.Signals.Skip,
        teardown: mock.fn()
      };

      const pr = new ProbeRunner(
        new SourceFile(),
        new CollectableSetRegistry([]),
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

      const registry = new CollectableSetRegistry([]);
      const pr = new ProbeRunner(
        sourceFile,
        registry,
        // @ts-expect-error
        probes
      );

      pr.finalize();

      probes.forEach((probe) => {
        assert.strictEqual(probe.finalize.mock.calls.length, 1);
        const finalizeArgs = probe.finalize.mock.calls.at(0)?.arguments;
        assert.ok(finalizeArgs);
        assertProbeCtx(finalizeArgs[0], {
          collectableSetRegistry: registry,
          sourceFile,
          context: undefined
        });
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

      const registry = new CollectableSetRegistry([]);
      const pr = new ProbeRunner(
        sourceFile,
        registry,
        // @ts-expect-error
        [fakeProbe]
      );

      const astNode: ESTree.Literal = {
        type: "Literal",
        value: "test"
      };
      pr.walk(astNode);
      pr.finalize();

      const expectedContext = {
        collectableSetRegistry: registry,
        sourceFile,
        context: fakeCtx
      };
      
      const validateNodeArgs = fakeProbe.validateNode.mock.calls.at(0)?.arguments;
      assert.ok(validateNodeArgs, "validateNodeArgs should be defined");
      assert.strictEqual(validateNodeArgs[0], astNode);
      assertProbeCtx((validateNodeArgs as any)[1], expectedContext);
      
      const mainArgs = fakeProbe.main.mock.calls.at(0)?.arguments;
      assert.ok(mainArgs, "mainArgs should be defined");
      assert.strictEqual((mainArgs as any)[0], astNode);
      assertProbeMainContext((mainArgs as any)[1], {
        ...expectedContext,
        data: null,
        signals: ProbeRunner.Signals
      });
      
      const initializeArgs = fakeProbe.initialize.mock.calls.at(0)?.arguments;
      assert.ok(initializeArgs);
      assertProbeCtx((initializeArgs as any)[0], {
        ...expectedContext,
        context: undefined
      });
      
      const finalizeArgs = fakeProbe.finalize.mock.calls.at(0)?.arguments;
      assert.ok(finalizeArgs, "finalizeArgs should be defined");
      assertProbeCtx(finalizeArgs[0], expectedContext);
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

      const registry = new CollectableSetRegistry([]);
      const pr = new ProbeRunner(
        sourceFile,
        registry,
        // @ts-expect-error
        [fakeProbe]
      );

      const astNode: ESTree.Literal = {
        type: "Literal",
        value: "test"
      };
      pr.walk(astNode);
      pr.finalize();

      const expectedContext = {
        collectableSetRegistry: registry,
        sourceFile,
        context: fakeCtx
      };
      
      const validateNodeArgs = fakeProbe.validateNode.mock.calls.at(0)?.arguments;
      assert.ok(validateNodeArgs);
      assert.strictEqual(validateNodeArgs[0], astNode);
      assertProbeCtx((validateNodeArgs as any)[1], expectedContext);

      const mainArgs = fakeProbe.main.mock.calls.at(0)?.arguments;
      assert.ok(mainArgs);
      assert.strictEqual((mainArgs as any)[0], astNode);
      assertProbeMainContext((mainArgs as any)[1], {
        ...expectedContext,
        data: null,
        signals: ProbeRunner.Signals
      });

      const finalizeArgs = fakeProbe.finalize.mock.calls.at(0)?.arguments;
      assert.ok(finalizeArgs);
      assertProbeCtx(finalizeArgs[0], expectedContext);

      const initializeArgs = fakeProbe.initialize.mock.calls.at(0)?.arguments;
      assert.ok(initializeArgs);
      assertProbeCtx(initializeArgs[0], expectedContext);
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
        new CollectableSetRegistry([]),
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
