# EntryFilesAnalyser

```js
import { EntryFilesAnalyser } from "@nodesecure/js-x-ray";

const efa = new EntryFilesAnalyser();

// Either a string path or a WHAWG URL
const entryFiles = [
  "./path/to/file.js"
];

for await (const report of efa.analyse(entryFiles)) {
  console.log(report);
}
```

The constructor options is described by the following TS interface

```ts
interface EntryFilesAnalyserOptions {
  /**
   * An instance of `AstAnalyser` to use for analysing the entry files.
   * If not provided, a default instance will be created with a `DefaultCollectableSet` for "dependency".
   */
  astAnalyzer?: AstAnalyser;
  /**
   * A function that receives the default allowed extensions and
   * returns a new array of extensions to allow when resolving internal dependencies.
   */
  loadExtensions?: (
    defaults: string[]
  ) => string[];
  rootPath?: string | URL;
  /**
   * Whether to ignore ENOENT errors when analysing files.
   * If set to `true`, files that do not exist will be skipped without throwing an error.
   *
   * @default false
   */
  ignoreENOENT?: boolean;
  /**
   * A set of dependencies to ignore when resolving internal dependencies.
   *
   * @default []
   */
  packageDependencies?: Iterable<string>;
}
```

Default files extensions are `.js`, `.cjs`, `.mjs` and `.node`

## API

### Stats

The `stats` property of the EntryFilesAnalyser instance:

```ts
stats = {
    numberOfImportsDetected: 0,
    numberOfFilesProcessed: 0
  };
```
The stats will provide :
- the number of unique internal dependencies detected (after resolution)
- the total number of files processed during the analysis

Note:
- imports are deduplicated based on their resolved file path, meaning that different import statements pointing to the same file will be counted once.
- external dependencies are not included in the imports count.

### EntryFilesAnalyser Class

```ts
type ReportOnEntryFile = ReportOnFile & {
  file: string;
};

declare class EntryFilesAnalyser {
  public astAnalyzer: AstAnalyser;
  public allowedExtensions: Set<string>;
  public dependencies: DiGraph<VertexDefinition<VertexBody>>;

  constructor(options?: EntryFilesAnalyserOptions);

  /**
   * Asynchronously analyze a set of entry files yielding analysis reports.
   */
  analyse(
    entryFiles: Iterable<string | URL>,
    options?: RuntimeOptions
  ): AsyncGenerator<ReportOnEntryFile>;
}
```

For more informations about `Report` and `ReportOnFile` interfaces please see [AstAnalyser documentation](./AstAnalyser.md)
