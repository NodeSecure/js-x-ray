# SourceParser

SourceParser is an interface that defines how source code should be parsed into an Abstract Syntax Tree (AST).

```ts
interface SourceParser {
  parse(source: string, options: unknown): ESTree.Statement[];
}
```

JS-X-Ray provides two built-in parsers.

## JsSourceParser (Default)

JavaScript parser using [Meriyah](https://github.com/meriyah/meriyah).

```ts
import {
  JsSourceParser
} from "@nodesecure/js-x-ray";

const jsParser = new JsSourceParser();
const jsBody = jsParser.parse("const foo = 'bar';");
```

> [!NOTE]
> `JsSourceParser` supports type stripping by accepting a `stripTypeScriptTypes` function.
The [built-in Node.js](https://nodejs.org/api/module.html#modulestriptypescripttypescode-options) implementation can be used, if you are on another runtime the [Bun transpiler](https://bun.com/docs/runtime/transpiler#transformsync) can be used for Bun, for Deno there is no built-in implementation yet but third-party type-strippers like [ts-blank-space](https://github.com/bloomberg/ts-blank-space) can be used.

## TsSourceParser

TypeScript parser using [@typescript-eslint/typescript-estree](https://typescript-eslint.io/packages/typescript-estree).

```ts
import {
  TsSourceParser
} from "@nodesecure/js-x-ray";

const tsParser = new TsSourceParser();
const tsBody = tsParser.parse("const x: number = 5;");
```

## Usage

```js
import { AstAnalyser, TsSourceParser } from "@nodesecure/js-x-ray";

const scanner = new AstAnalyser();

// Runtime parser (per-analysis)
const result = scanner.analyse("const x: number = 5;", {
  customParser: new TsSourceParser()
});

// Global default parser
AstAnalyser.DefaultParser = new TsSourceParser();
const result2 = scanner.analyse("const x: number = 5;");
```
