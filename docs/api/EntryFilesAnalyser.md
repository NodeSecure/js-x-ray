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
  astAnalyzer?: AstAnalyser;
  loadExtensions?: (defaults: string[]) => string[];
  rootPath?: string | URL;
}
```

Default files extensions are `.js`, `.cjs`, `.mjs` and `.node`

## API

```ts
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
    options?: RuntimeFileOptions
  ): AsyncGenerator<ReportOnFile & { file: string }>;
}
```

For more informations about `Report` and `ReportOnFile` interfaces please see [AstAnalyser documentation](./AstAnalyser.md)
