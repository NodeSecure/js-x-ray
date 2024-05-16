# AstAnalyser

```js
import { AstAnalyser } from "@nodesecure/js-x-ray";
import { TsSourceParser } from "@nodesecure/ts-source-parser";

const scanner = new AstAnalyser({
  customParser: new TsSourceParser()
});

const result = scanner.analyse("const x: number = 5;");
console.log(result);
```

AstAnalyser options is described by the following TS interface:

```ts
interface AstAnalyserOptions {
  /**
   * @default JsSourceParser
   */
  customParser?: SourceParser;
  /**
   * @default []
   */
  customProbes?: Probe[];
  /**
   * @default false
   */
  skipDefaultProbes?: boolean;
}
```

By default the AstAnalyser class is capable of parsing JavaScript source code using Meriyah.

## API

```ts
declare class AstAnalyser {
  constructor(options?: AstAnalyserOptions);
  analyse: (str: string, options?: RuntimeOptions) => Report;
  analyseFile(pathToFile: string, options?: RuntimeFileOptions): Promise<ReportOnFile>;
}
```

The `analyseFile` method is a superset of `analyse` with the ability to read the file on the local filesystem with additional features like detecting if the file is ESM or CJS.

```ts
interface Report {
  dependencies: Map<string, Dependency>;
  warnings: Warning[];
  idsLengthAvg: number;
  stringScore: number;
  isOneLineRequire: boolean;
}

type ReportOnFile = {
  ok: true,
  warnings: Warning[];
  dependencies: Map<string, Dependency>;
  isMinified: boolean;
} | {
  ok: false,
  warnings: Warning[];
}
```

## Examples

### `initialize`/`finalize` Hooks

The `analyse` method allows for the integration of two hooks: `initialize` and `finalize`. 
These hooks are triggered before and after the analysis process, respectively.

Below is an example of how to use these hooks within the `AstAnalyser` class:

```js
import { AstAnalyser } from "@nodesecure/js-x-ray";

const scanner = new AstAnalyser();

scanner.analyse("const foo = 'bar';", {
  initialize(sourceFile) {
    // Code to execute before analysis starts
    sourceFile.tracer.trace("Starting analysis...");
  },
  finalize(sourceFile) {
    // Code to execute after analysis completes
    console.log("Analysis complete.");
  }
});
```
