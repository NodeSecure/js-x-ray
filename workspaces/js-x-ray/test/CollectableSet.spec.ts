// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { DefaultCollectableSet } from "../src/CollectableSet.ts";

describe("CollectableSet", () => {
  test("should get the type of the given CollectableSet", () => {
    const collectableSet = new DefaultCollectableSet("url");
    assert.strictEqual(collectableSet.type, "url");
  });

  test("should be able to add a value", () => {
    const collectableSet = new DefaultCollectableSet("url");
    collectableSet.add("https://example.com", {
      file: "str.js",
      location: [[0, 0], [0, 0]],
      metadata: { spec: "react@19.0.1" }
    });

    collectableSet.add("https://example.com", {
      file: "str.js",
      location: [[5, 5], [7, 8]],
      metadata: { spec: "react@19.0.1" }
    });

    collectableSet.add("https://example.com", {
      file: "other.js",
      location: [[0, 0], [0, 0]],
      metadata: { spec: "react@19.0.1" }
    });

    collectableSet.add("https://other.com", {
      location: [[0, 0], [0, 0]],
      metadata: { spec: "react@19.0.1" }
    });

    assert.deepEqual(Array.from(collectableSet), [
      {
        value: "https://example.com",
        locations: [
          { file: "str.js", location: [[[0, 0], [0, 0]]], metadata: { spec: "react@19.0.1" } },
          { file: "str.js", location: [[[5, 5], [7, 8]]], metadata: { spec: "react@19.0.1" } },
          { file: "other.js", location: [[[0, 0], [0, 0]]], metadata: { spec: "react@19.0.1" } }
        ]
      },
      {
        value: "https://other.com",
        locations: [{ file: null, location: [[[0, 0], [0, 0]]], metadata: { spec: "react@19.0.1" } }]
      }
    ]);
  });
});
