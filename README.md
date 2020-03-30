# js-x-ray
JavaScript AST x-ray analysis. This package has been created to export the [Node-Secure](https://github.com/ES-Community/nsecure) AST Analysis to make it easier to use and evolve the code over time.

> WIP (doc not complete as i want yet.. i'm going to work on it in the next few weeks!)

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i js-x-ray
# or
$ yarn add js-x-ray
```

## Usage example
Create a local .js file with the following content in it:
```js
try  {
    require("http");
}
catch (err) {
    // do nothing
}
const lib = "crypto";
require(lib);
require("util");
require(Buffer.from("6673", "hex").toString());
```

Then use js-x-ray to analyze the file:
```js
const { searchRuntimeDependencies } = require("js-x-ray");
const { readFileSync } = require("fs");

const str = readFileSync("./file.js", "utf-8");
const { warnings, dependencies } = searchRuntimeDependencies(str);

const dependenciesName = [...dependencies];
const inTryDeps = [...dependencies.getDependenciesInTryStatement()];

console.log(dependenciesName);
console.log(inTryDeps);
console.log(warnings);
```

The analysis will return: `http` (in try), `crypto`, `util` and `fs`.

## API

```ts
interface BaseWarning {
    file: string | null;
    kind: "unsafe-import" | "unsafe-regex" | "ast-error" | "hexa-value" | "short-ids";
    value: string;
    start: { line: number; column: number };
    end: { line: number; column: number };
}

type Warning<T extends BaseWarning> = T extends { kind: "ast-error" | "hexa-value" | "unsafe-regex" } ? T : Omit<T, "value">;

interface Report {
    dependencies: ASTDeps;
    warnings: Warning[];
    idsLengthAvg: number;
    isOneLineRequire: boolean;
}
```

### searchRuntimeDependencies(str: string, options?: RuntimeOptions): Report;
The method take a first argument which is the code you want to analyse. Only available options is `module` is tell if the code use ESM or CJS.

## License
MIT
