# CollectableSet

CollectableSet is a specialized data structure for collecting and aggregating infrastructure-related data points (e.g., URLs, hostnames, IPs, dependencies) during JavaScript AST analysis. It groups locations by value and file, with optional metadata support. Post-analysis, the collected data can be exploited externally (e.g., for network monitoring, security audits, or infrastructure mapping) to derive insights beyond JS-X-Ray's built-in warnings.

- **type**: Type
- **add(value, infos)**: Adds an entry to the set. Groups by value and file.
- **values()**: Returns an iterable of all values of the CollectableSet.

CollectableSet is only an interface but Js-X-Ray provides a default implementation named DefaultCollectableSet.
The default implementation has an additional method to read what it has collected.

- **[Symbol.iterator]()**: Iterates over entries, yielding `{ value, locations }` for each unique value.

```ts
import { DefaultCollectableSet } from "@nodesecure/js-x-ray";

const hostnameSet = new DefaultCollectableSet<{ spec: string }>("hostname");

// Add infrastructure data during analysis (e.g., via probes)
hostnameSet.add("example.com", {
  file: "src/index.js",
  location: [{ start: { line: 5, column: 10 }, end: { line: 5, column: 21 } }],
  metadata: { spec: "@nodesecure/scanner" }
});

// Post-analysis exploitation: Iterate and process data
for (const { value, locations } of hostnameSet) {
  console.log(`Found hostname: ${value}`);
  locations.forEach(({ file, location, metadata }) => {
    // Example: Log or export for further analysis
    console.log(`  In ${file}: ${JSON.stringify(location)} (${metadata?.spec})`);
  });
}
```

## API

```ts
export type Type = "url" | "hostname" | "ip" | "email" | "dependency" | (string & {});

export type Location<T = Record<string, unknown>> = {
  file: string | null;
  location: SourceArrayLocation[];
  metadata?: T;
};

export type CollectableInfos<T = Record<string, unknown>> = {
  file?: string | null;
  metadata?: T;
  location: SourceArrayLocation;
};

export interface CollectableSet<T = Record<string, unknown>> {
  add(value: string, infos: CollectableInfos<T>): void;
  type: Type;
  values(): Iterable<string>;
}

export class DefaultCollectableSet<T = Record<string, unknown>> implements CollectableSet<T> {
  // same methods signature than CollectableSet

  constructor(type: Type);

  *[Symbol.iterator](): Generator<{
    value: string;
    locations: Location<T>[];
  }>;
}
```

## Usage with AstAnalyser

CollectableSet integrates with AstAnalyser via the `collectables` option. Pass an array of CollectableSet instances to gather data during analysis. Probes can populate them, and post-analysis, you can exploit the data for external processing.

```ts
import { AstAnalyser, DefaultCollectableSet } from "@nodesecure/js-x-ray";

const hostnameSet = new DefaultCollectableSet("hostname");
const analyser = new AstAnalyser({
  collectables: [hostnameSet],
  // Other options...
});

// Analyze code
const result = analyser.analyse("const url = 'https://example.com';");

// Post-analysis exploitation
for (const { value, locations } of hostnameSet) {
  console.log(`Hostname: ${value}`, locations);
}
```

## Usage with EntryFilesAnalyser

EntryFilesAnalyser uses AstAnalyser internally, so pass collectables via the `astAnalyzer` option for multi-file infrastructure data aggregation. Exploit the data across dependencies for comprehensive checks.

```ts
import { EntryFilesAnalyser, DefaultCollectableSet } from "@nodesecure/js-x-ray";

const urlSet = new DefaultCollectableSet("url");
const analyser = new EntryFilesAnalyser({
  astAnalyzer: new AstAnalyser({ collectables: [urlSet] })
});

// Analyze multiple files
for await (const report of analyser.analyse(["src/index.js"])) {
  // Analysis happens here
}

// Post-analysis: Exploit aggregated data
for (const { value, locations } of urlSet) {
  console.log(`Aggregated url: ${value}`, locations);
}
```

This enables exploitation across files.
