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

  describe("mergeData", () => {
    test("should return the same set instance that was passed in", () => {
      const set = new DefaultCollectableSet("url");
      const data = set.toJSON();

      const returned = DefaultCollectableSet.mergeData(set, data);

      assert.strictEqual(returned, set);
    });

    test("should populate an empty set from CollectableSetData", () => {
      const set = new DefaultCollectableSet<{ spec: string; }>("url");

      DefaultCollectableSet.mergeData(set, {
        type: "url",
        entries: [
          {
            value: "https://example.com",
            locations: [
              { file: "str.js", location: [[[0, 0], [0, 10]]], metadata: { spec: "react@19.0.1" } }
            ]
          }
        ]
      });

      assert.deepEqual(Array.from(set), [
        {
          value: "https://example.com",
          locations: [
            { file: "str.js", location: [[[0, 0], [0, 10]]], metadata: { spec: "react@19.0.1" } }
          ]
        }
      ]);
    });

    test("should accumulate into a set that already has entries", () => {
      const set = new DefaultCollectableSet("hostname");
      set.add("example.com", { file: "a.js", location: [[0, 0], [0, 11]] });

      DefaultCollectableSet.mergeData(set, {
        type: "hostname",
        entries: [
          {
            value: "other.com",
            locations: [{ file: "b.js", location: [[[1, 0], [1, 9]]] }]
          }
        ]
      });

      assert.deepEqual(Array.from(set.values()), ["example.com", "other.com"]);
    });

    test("should expand multiple locations within a single location entry", () => {
      const set = new DefaultCollectableSet("url");

      DefaultCollectableSet.mergeData(set, {
        type: "url",
        entries: [
          {
            value: "https://example.com",
            locations: [
              {
                file: "str.js",
                location: [[[0, 0], [0, 10]], [[5, 0], [5, 10]]]
              }
            ]
          }
        ]
      });

      assert.deepEqual(Array.from(set), [
        {
          value: "https://example.com",
          locations: [
            { file: "str.js", location: [[[0, 0], [0, 10]]] },
            { file: "str.js", location: [[[5, 0], [5, 10]]] }
          ]
        }
      ]);
    });

    test("should handle entries without metadata", () => {
      const set = new DefaultCollectableSet("dependency");

      DefaultCollectableSet.mergeData(set, {
        type: "dependency",
        entries: [
          {
            value: "lodash",
            locations: [{ file: null, location: [[[3, 0], [3, 20]]] }]
          }
        ]
      });

      assert.deepEqual(Array.from(set), [
        {
          value: "lodash",
          locations: [{ file: null, location: [[[3, 0], [3, 20]]] }]
        }
      ]);
    });

    test("should handle an empty entries array without error", () => {
      const set = new DefaultCollectableSet("ip");

      DefaultCollectableSet.mergeData(set, { type: "ip", entries: [] });

      assert.deepEqual(Array.from(set), []);
    });

    test("should be compatible with toJSON output (round-trip via mergeData)", () => {
      const original = new DefaultCollectableSet<{ spec: string; }>("url");
      original.add("https://example.com", {
        file: "str.js",
        location: [[0, 0], [0, 10]],
        metadata: { spec: "react@19.0.1" }
      });
      original.add("https://other.com", {
        file: null,
        location: [[2, 0], [2, 18]]
      });

      const target = new DefaultCollectableSet<{ spec: string; }>("url");
      DefaultCollectableSet.mergeData(target, original.toJSON());

      assert.deepEqual(Array.from(target), Array.from(original));
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
