# CollectableSet

During AST analysis, js-x-ray encounters interesting string values embedded in code: hostnames, URLs, IP addresses, email addresses, imported module specifiers. The built-in **warnings** system flags security anomalies; collectables serve a different purpose: **structured data extraction** for post-analysis use.

A `CollectableSet` acts as a side-channel output, populated during analysis and read afterwards. Instead of discarding these values once a warning is (or isn't) emitted, you capture them in a typed collection that you can then forward to other tools or process yourself.

```ts
import {
  AstAnalyser,
  DefaultCollectableSet
} from "@nodesecure/js-x-ray";

const hostnames = new DefaultCollectableSet("hostname");
const analyser = new AstAnalyser({
  collectables: [hostnames]
});

analyser.analyse("const url = 'https://example.com';");

for (const { value, locations } of hostnames) {
  console.log(value, locations);
}
```

Each collectable instance focuses on a single **type** of value (e.g., hostnames). Internally, it deduplicates by value and groups locations by file:

```
value "example.com"
  > file "src/a.js"
      - location [line 5, col 10-21]
      - location [line 12, col 4-15]
  > file "src/b.js"
      - location [line 2, col 0-11]
```

If the same hostname appears in three files, you get one entry with three location groups, not three separate entries.

## Types

The built-in `Type` values cover the most common infrastructure data points:

| Type | Description |
|---|---|
| `"url"` | Full URLs |
| `"hostname"` | Extracted hostnames |
| `"ip"` | IP addresses |
| `"email"` | Email addresses |
| `"dependency"` | Imported module specifiers |

```ts
type Type = "url" | "hostname" | "ip" | "email" | "dependency" | (string & {});
```

The type is open-ended (`string & {}`) so you can define custom types for domain-specific needs.

## Interface and implementation

```ts
export type CollectableInfos<T = Record<string, unknown>> = {
  file?: string | null;
  metadata?: T;
  location: SourceArrayLocation;
};

export interface CollectableSet<T = Record<string, unknown>> {
  type: Type;
  add(
    value: string,
    infos: CollectableInfos<T>
  ): void;
  values(): Iterable<string>;
}
```

`CollectableSet<T>` is a minimal interface with three members:

- `type` — identifies what kind of values this set collects.
- `add(value, infos)` — called by probes during analysis to record a value and its source location. `infos` accepts an optional `metadata` field (typed as `T`) for probe-specific data attached to each occurrence.
- `values()` — returns the unique collected values with no location data. Useful for quick existence checks without iterating over the full location graph.

You can implement it yourself to control how collected data is stored or processed.

For most use cases, `DefaultCollectableSet<T>` is sufficient. It implements the interface and adds `[Symbol.iterator]`, which yields `{ value, locations }` pairs once analysis is complete. The generic parameter `T` types the `metadata` field carried on each location entry.

```ts
export type Location<T = Record<string, unknown>> = {
  file: string | null;
  location: SourceArrayLocation[];
  metadata?: T;
};

export type CollectableSetData<T = Record<string, unknown>> = {
  type: Type;
  entries: Array<{ value: string; locations: Location<T>[]; }>;
};

export class DefaultCollectableSet<T = Record<string, unknown>> implements CollectableSet<T> {
  constructor(type: Type);

  static mergeData<T>(
    set: CollectableSet<T>,
    data: CollectableSetData<T>
  ): CollectableSet<T>;

  static fromJSON<T>(data: CollectableSetData<T>): DefaultCollectableSet<T>;

  toJSON(): CollectableSetData<T>;

  *[Symbol.iterator](): Generator<{
    value: string;
    locations: Location<T>[];
  }>;
}
```

## Usage

### AstAnalyser

Pass one or more collectable instances via the `collectables` option. After calling `analyse()`, iterate the set to read results.

The `analyse()` method accepts an optional `metadata` field. Whatever is passed there is attached to every entry recorded during that analysis call, which lets you tag results with caller-specific context (e.g. the package name, a scan identifier, or any structured data your downstream tooling needs).

```ts
import {
  AstAnalyser,
  DefaultCollectableSet
} from "@nodesecure/js-x-ray";

interface ScanMetadata {
  packageName: string;
}

const hostnames = new DefaultCollectableSet<ScanMetadata>("hostname");
const analyser = new AstAnalyser({
  collectables: [hostnames]
});

analyser.analyse(source, {
  metadata: { packageName: "lodash" }
});

for (const { value, locations } of hostnames) {
  for (const { file, metadata } of locations) {
    console.log(value, file, metadata?.packageName);
  }
}
```

### Serialization

`DefaultCollectableSet` supports full serialization to and from plain JSON objects via `toJSON()` and `fromJSON()`.

`toJSON()` produces a plain `CollectableSetData<T>` object that is safe to pass to `JSON.stringify`. `fromJSON()` reconstructs a `DefaultCollectableSet` from that snapshot.

```ts
const original = new DefaultCollectableSet("hostname");
original.add("example.com", { file: "index.js", location: [[0, 0], [0, 11]] });

// Serialize
const snapshot = JSON.stringify(original);

// Restore
const restored = DefaultCollectableSet.fromJSON(JSON.parse(snapshot));
```

#### `mergeData`

This is useful when you want to accumulate data from multiple snapshots into a single live set, or when you implement `CollectableSet` yourself and need to hydrate it from serialized data.

```ts
const live = new DefaultCollectableSet("url");

// Populate from two previously serialized snapshots
for (const snapshot of snapshots) {
  DefaultCollectableSet.mergeData(live, snapshot);
}
```

`mergeData` expands the `location` arrays stored in each `CollectableSetData` entry back into individual `add()` calls, so the resulting set behaves identically to one that was built by recording each occurrence one at a time.

### EntryFilesAnalyser

Pass collectable instances via the `collectables` option of `AstAnalyser`.

The same instance is reused across every file `EntryFilesAnalyser` processes, so data accumulates in a single set and is ready to read once the full analysis finishes.

The `analyse()` method accepts two complementary metadata options:

- `metadata` — a static object merged into every file's analysis context.
- `fileMetadata` — a function called per file that returns file-specific metadata. Its result is merged on top of `metadata`, so it can extend or override shared fields for a given file.

```ts
import {
  AstAnalyser,
  EntryFilesAnalyser,
  DefaultCollectableSet
} from "@nodesecure/js-x-ray";

interface ScanMetadata {
  scanId: string;
  file: string;
}

const urls = new DefaultCollectableSet<ScanMetadata>("url");
const analyser = new EntryFilesAnalyser({
  astAnalyzer: new AstAnalyser({
    collectables: [urls]
  })
});

for await (const report of analyser.analyse(["src/index.js"], {
  metadata: { scanId: "abc-123" },
  fileMetadata: (file) => ({ file })
})) {
  // analysis runs here
}

for (const { value, locations } of urls) {
  for (const { file, metadata } of locations) {
    console.log(value, file, metadata?.scanId);
  }
}
```
