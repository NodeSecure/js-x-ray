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
  /**
   * @default false
   */
  optionalWarnings?: boolean | Iterable<string>;
}
```

By default the AstAnalyser class is capable of parsing JavaScript source code using Meriyah.

## API

```ts
class AstAnalyser {
  constructor(options?: AstAnalyserOptions);
  analyse: (
    str: string,
    options?: RuntimeOptions
  ) => Report;
  analyseFile(
    pathToFile: string,
    options?: RuntimeFileOptions
  ): Promise<ReportOnFile>;
  analyseFileSync(
    pathToFile: string,
    options?: RuntimeFileOptions
  ): ReportOnFile;
}
```

The `analyseFile` and `analyseFileSync` methods is a superset of `analyse` with the ability to read the file on the local filesystem with additional features like detecting if the file is ESM/CJS (using the extension).

```ts
interface RuntimeOptions {
  /**
   * @default true
   */
  module?: boolean;
  /**
   * @default false
   */
  removeHTMLComments?: boolean;
  /**
   * @default false
   */
  isMinified?: boolean;
  initialize?: (sourceFile: SourceFile) => void;
  finalize?: (sourceFile: SourceFile) => void;
}

type SourceFlags = "fetch" | "oneline-require" | "is-minified";

interface Report {
  dependencies: Map<string, Dependency>;
  warnings: Warning[];
  flags: Set<SourceFlags>;
  idsLengthAvg: number;
  stringScore: number;
}

type ReportOnFile = {
  ok: true,
  warnings: Warning[];
  flags: Set<SourceFlags>;
  dependencies: Map<string, Dependency>;
} | {
  ok: false,
  warnings: Warning[];
}
```

A given SourceFile can have multiple unique flags:

| name | description |
| --- | --- |
| fetch | the source file include at least one [native fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) CallExpression |
| oneline-require | the source file is a one-line require expression (like `module.exports = require('foo')`) |
| is-minified | the source file is detected as minified |

### Hooks

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

## Custom Probes

You can also create custom probes to detect specific pattern in the code you are analyzing.

A probe is a pair of two functions (`validateNode` and `main`) that will be called on each node of the AST. It will return a warning if the pattern is detected.

Below a basic probe that detect a string assignation to `danger`:

```ts
export const customProbes = [
  {
    name: "customProbeUnsafeDanger",
    validateNode: (node, sourceFile) => [
      node.type === "VariableDeclaration" && node.declarations[0].init.value === "danger"
    ],
    main: (node, options) => {
      const { sourceFile, data: calleeName } = options;
      if (node.declarations[0].init.value === "danger") {
        sourceFile.addWarning("unsafe-danger", calleeName, node.loc);

        return ProbeSignals.Skip;
      }

      return null;
    }
  }
];
```

You can pass an array of probes to the `AstAnalyser` constructor.

| Name | Type | Description | Default Value |
|---|---|---|---|
| **customParser** | `SourceParser \| undefined` | An optional custom parser to be used for parsing the source code. | `JsSourceParser` |
| **customProbes** | `Probe[] \| undefined` | An array of custom probes to be used during AST analysis. | `[]` |
| **skipDefaultProbes** | `boolean \| undefined` | If **true**, default probes will be skipped and only custom probes will be used. | `false` |

Here using the example probe upper:

```ts
import { AstAnalyser } from "@nodesecure/js-x-ray";

// add your customProbes here (see example above)

const scanner = new AstAnalyser({
  customProbes,
  skipDefaultProbes: true
});

const result = scanner.analyse("const danger = 'danger';");

console.log(result);
```

Result:

```sh
✗ node example.js
{
  idsLengthAvg: 0,
  stringScore: 0,
  warnings: [ { kind: 'unsafe-danger', location: [Array], source: 'JS-X-Ray' } ],
  dependencies: Map(0) {},
  flags: Set(0) {},
  isOneLineRequire: false
}
```

Congrats, you have created your first custom probe! 🎉
