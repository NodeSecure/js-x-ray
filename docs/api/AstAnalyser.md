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
