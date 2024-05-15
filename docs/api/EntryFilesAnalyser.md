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
}
```

Default files extensions are `.js`, `.cjs`, `.mjs` and `.node`

## API

```ts
declare class EntryFilesAnalyser {
  constructor(options?: EntryFilesAnalyserOptions);
  analyse(entryFiles: (string | URL)[]): AsyncGenerator<ReportOnFile & { url: string }>;
}
```

For more informations about `Report` and `ReportOnFile` interfaces please see [AstAnalyser documentation](./AstAnalyser.md)
