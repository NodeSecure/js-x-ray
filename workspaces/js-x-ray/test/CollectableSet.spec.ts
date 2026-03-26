// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { DefaultCollectableSet } from "../src/CollectableSet.ts";

describe("DefaultCollectableSet", () => {
  describe("values", () => {
    test("should get all the values", () => {
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

      assert.deepEqual(Array.from(collectableSet.values()), [
        "https://example.com",
        "https://other.com"
      ]);
    });
  });
  describe("toJSON", () => {
    test("should return a serializable snapshot with type and entries", () => {
      const collectableSet = new DefaultCollectableSet("url");
      collectableSet.add("https://example.com", {
        file: "str.js",
        location: [[0, 0], [0, 0]],
        metadata: { spec: "react@19.0.1" }
      });
      collectableSet.add("https://example.com", {
        file: null,
        location: [[1, 0], [1, 10]]
      });

      const data = collectableSet.toJSON();

      assert.strictEqual(data.type, "url");
      assert.deepEqual(data.entries, [
        {
          value: "https://example.com",
          locations: [
            { file: "str.js", location: [[[0, 0], [0, 0]]], metadata: { spec: "react@19.0.1" } },
            { file: null, location: [[[1, 0], [1, 10]]] }
          ]
        }
      ]);
    });

    test("should produce output compatible with JSON.stringify / JSON.parse round-trip", () => {
      const collectableSet = new DefaultCollectableSet("dependency");
      collectableSet.add("lodash", { file: "index.js", location: [[3, 0], [3, 20]] });

      const parsed = JSON.parse(JSON.stringify(collectableSet.toJSON()));

      assert.deepEqual(parsed, collectableSet.toJSON());
    });
  });

  describe("fromJSON", () => {
    test("should reconstruct a DefaultCollectableSet equal to the original", () => {
      const original = new DefaultCollectableSet("url");
      original.add("https://example.com", {
        file: "str.js",
        location: [[0, 0], [0, 0]],
        metadata: { spec: "react@19.0.1" }
      });
      original.add("https://example.com", {
        file: "str.js",
        location: [[5, 5], [7, 8]],
        metadata: { spec: "react@19.0.1" }
      });
      original.add("https://example.com", {
        file: "other.js",
        location: [[0, 0], [0, 0]],
        metadata: { spec: "react@19.0.1" }
      });
      original.add("https://other.com", {
        location: [[0, 0], [0, 0]],
        metadata: { spec: "react@19.0.1" }
      });

      const restored = DefaultCollectableSet.fromJSON(original.toJSON());

      assert.deepEqual(Array.from(restored), Array.from(original));
      assert.strictEqual(restored.type, original.type);
    });

    test("should survive a JSON.stringify / JSON.parse round-trip", () => {
      const original = new DefaultCollectableSet("hostname");
      original.add("example.com", { file: null, location: [[0, 0], [0, 5]] });

      const restored = DefaultCollectableSet.fromJSON(
        JSON.parse(JSON.stringify(original.toJSON()))
      );

      assert.deepEqual(Array.from(restored), Array.from(original));
    });
  });

  describe("add", () => {
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
});
