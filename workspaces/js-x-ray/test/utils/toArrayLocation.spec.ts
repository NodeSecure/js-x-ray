// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { toArrayLocation } from "../../src/utils/index.ts";
describe("toArrayLocation", () => {
  it("should convert a valid SourceLocation to array format", () => {
    const location = {
      start: { line: 1, column: 2 },
      end: { line: 3, column: 4 }
    };

    assert.deepStrictEqual(
      toArrayLocation(location as any),
      [[1, 2], [3, 4]]
    );
  });

  it("should default to root location when no argument is provided", () => {
    assert.deepStrictEqual(
      toArrayLocation(),
      [[0, 0], [0, 0]]
    );
  });

  it("should use start as end if end is undefined", () => {
    const location = {
      start: { line: 5, column: 6 }
    };

    assert.deepStrictEqual(
      toArrayLocation(location as any),
      [[5, 6], [5, 6]]
    );
  });

  it("should fallback to 0 when line or column is undefined", () => {
    const location = {
      start: { line: undefined, column: undefined },
      end: { line: undefined, column: undefined }
    };

    assert.deepStrictEqual(
      toArrayLocation(location as any),
      [[0, 0], [0, 0]]
    );
  });

  it("should handle mixed defined/undefined properties", () => {
    const location = {
      start: { line: 5, column: undefined },
      end: { line: undefined, column: 10 }
    };
    assert.deepStrictEqual(toArrayLocation(location as any), [[5, 0], [0, 10]]);
  });
});
