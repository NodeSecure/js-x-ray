# ts-source-parser
[![version](https://img.shields.io/github/package-json/v/NodeSecure/js-x-ray?filename=workspaces%2Fts-source-parser%2Fpackage.json&style=for-the-badge)](https://www.npmjs.com/package/@nodesecure/ts-source-parser)
[![maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/NodeSecure/js-x-ray/blob/master/workspaces/ts-source-parser/graphs/commit-activity)
[![OpenSSF
Scorecard](https://api.securityscorecards.dev/projects/github.com/NodeSecure/js-x-ray/badge?style=for-the-badge)](https://api.securityscorecards.dev/projects/github.com/NodeSecure/js-x-ray)
[![mit](https://img.shields.io/github/license/NodeSecure/js-x-ray?style=for-the-badge)](https://github.com/NodeSecure/js-x-ray/blob/master/workspaces/ts-source-parser/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/NodeSecure/js-x-ray/ts-source-parser.yml?style=for-the-badge)](https://github.com/NodeSecure/js-x-ray/actions?query=workflow%3A%22sec+literal+CI%22)

This package provide a TypeScript source parser for the `@nodesecure/js-x-ray` project.


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
import { runASTAnalysis } from "@nodesecure/js-x-ray";
import { readFileSync } from "node:fs";

const { warnings, dependencies } = runASTAnalysis(
    readFileSync("./file.ts", "utf-8"),
    { customParser: new TsSourceParser() }
);

console.log(dependencies);
console.dir(warnings, { depth: null });
```