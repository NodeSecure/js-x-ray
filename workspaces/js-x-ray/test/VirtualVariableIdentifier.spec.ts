// Import Node.js Dependencies
import assert from "node:assert/strict";
import { describe, beforeEach, it } from "node:test";

// Import Internal Dependencies
import { VirtualVariableIdentifier } from "../src/VirtualVariableIdentifier.ts";

describe("VirtualVariableIdentifier", () => {
  beforeEach(() => {
    VirtualVariableIdentifier.reset();
  });

  describe("generate()", () => {
    it("should generate a virtual identifier with incrementing counter", () => {
      const id1 = VirtualVariableIdentifier.generate("foo");
      const id2 = VirtualVariableIdentifier.generate("bar");

      assert.strictEqual(id1, "__virtual_foo_0__");
      assert.strictEqual(id2, "__virtual_bar_1__");
    });

    it("should store location when provided", () => {
      const location = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 10 }
      };
      const id = VirtualVariableIdentifier.generate("test", location);

      assert.deepStrictEqual(
        VirtualVariableIdentifier.getLocation(id),
        location
      );
    });
  });

  describe("getLocation()", () => {
    it("should return undefined for unknown virtual id", () => {
      assert.strictEqual(
        VirtualVariableIdentifier.getLocation("unknown"),
        undefined
      );
    });

    it("should return undefined when no location was provided", () => {
      const id = VirtualVariableIdentifier.generate("noLoc");

      assert.strictEqual(
        VirtualVariableIdentifier.getLocation(id),
        undefined
      );
    });
  });

  describe("reset()", () => {
    it("should reset counter and clear stored locations", () => {
      const id1 = VirtualVariableIdentifier.generate("before");
      assert.strictEqual(id1, "__virtual_before_0__");

      VirtualVariableIdentifier.reset();

      const id2 = VirtualVariableIdentifier.generate("after");
      assert.strictEqual(id2, "__virtual_after_0__");
      assert.strictEqual(VirtualVariableIdentifier.getLocation(id1), undefined);
    });
  });
});
