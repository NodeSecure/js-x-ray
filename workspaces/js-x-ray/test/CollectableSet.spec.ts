// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { CollectableSet } from "../src/CollectableSet.ts";

describe("CollectableSet", () => {
  test("should get the type of the given CollectableSet", () => {
    const collectableSet = new CollectableSet("url");
    assert.strictEqual(collectableSet.type, "url");
  });

  test("should be able to add a value", () => {
    const collectableSet = new CollectableSet("url");
    collectableSet.add("https://example.com", {
      file: "str.js",
      location: [[0, 0], [0, 0]]
    });

    collectableSet.add("https://example.com", {
      file: "str.js",
      location: [[5, 5], [7, 8]]
    });

    collectableSet.add("https://example.com", {
      file: "other.js",
      location: [[0, 0], [0, 0]]
    });

    collectableSet.add("https://other.com", {
      location: [[0, 0], [0, 0]]
    });

    assert.deepEqual(Array.from(collectableSet), [
      {
        value: "https://example.com",
        locations: [
          { file: "str.js", location: [[[0, 0], [0, 0]], [[5, 5], [7, 8]]] },
          { file: "other.js", location: [[[0, 0], [0, 0]]] }
        ]
      },
      {
        value: "https://other.com",
        locations: [{ file: null, location: [[[0, 0], [0, 0]]] }]
      }
    ]);
  });
});
