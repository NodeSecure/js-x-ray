<p align="center">
  <h1 align="center">
    @nodesecure/ts-source-parser
  </h1>
</p>

<p align="center">
  This package provide a TypeScript source parser for the `@nodesecure/js-x-ray` project.
</p>

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/ts-source-parser
# or
$ yarn add @nodesecure/ts-source-parser
```

## Usage example

```js
import { TsSourceParser } from "@nodesecure/ts-source-parser";

const parser = new TsSourceParser();
const body = parser.parse("const x: number = 5;");

console.log(body);
```

## Usage with `js-x-ray` 

```js
import { AstAnalyser } from "@nodesecure/js-x-ray";
import { TsSourceParser } from "@nodesecure/ts-source-parser";

const scanner = new AstAnalyser();

const result = scanner.analyse("const x: number = 5;", {
  customParser: new TsSourceParser()
});
console.log(result);
```
