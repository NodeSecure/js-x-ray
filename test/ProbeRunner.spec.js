// Import Node.js Dependencies
import { describe, it, mock } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { ProbeRunner, ProbeSignals } from "../src/ProbeRunner.js";

describe("ProbeRunner", () => {
  describe("constructor", () => {
    it("should instanciate class with Defaults probes when none are provide", () => {
      const pr = new ProbeRunner(null);

      assert.strictEqual(pr.sourceFile, null);
      assert.strictEqual(pr.probes, ProbeRunner.Defaults);
    });

    it("should use provided probes", () => {
      const probes = [{}];

      const pr = new ProbeRunner(null, probes);
      assert.strictEqual(pr.sourceFile, null);
      assert.strictEqual(pr.probes, probes);
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
        astNode, { analysis: sourceFile, data: null }
      ]);

      assert.strictEqual(fakeProbe.teardown.mock.calls.length, 1);
      assert.deepEqual(fakeProbe.teardown.mock.calls.at(0).arguments, [
        { analysis: sourceFile }
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
