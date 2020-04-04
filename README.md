# js-x-ray
JavaScript AST analysis. This package has been created to export the [Node-Secure](https://github.com/ES-Community/nsecure) AST Analysis to make it easier to use and evolve the code over time.

The goal is to quickly identify dangerous code and patterns for developers and researchers.

## Features
- Retrieve required dependencies and files.
- Detect unsafe RegEx.
- Get warnings when the AST Analysis as a problem or when not able to follow a statement.
- Highlight common attack patterns.

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i js-x-ray
# or
$ yarn add js-x-ray
```

## Usage example
Create a local `.js` file with the following content:
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

Then use `js-x-ray` to run an analysis of the JavaScript code:
```js
const { runASTAnalysis } = require("js-x-ray");
const { readFileSync } = require("fs");

const str = readFileSync("./file.js", "utf-8");
const { warnings, dependencies } = runASTAnalysis(str);

const dependenciesName = [...dependencies];
const inTryDeps = [...dependencies.getDependenciesInTryStatement()];

console.log(dependenciesName);
console.log(inTryDeps);
console.log(warnings);
```

The analysis will return: `http` (in try), `crypto`, `util` and `fs`.

## Warnings

| name | description |
| --- | --- |
| ast-error | An error occured when parsing the JavaScript code with meriyah. It mean that the conversion from string to AST as failed. |
| unsafe-import | Unable to follow an import (require, require.resolve) statement/expr. |
| unsafe-regex | A RegEx as been detected as unsafe and may be used for a ReDOS Attack |
| hexa-value | An hex value has been detected in a Literal |
| short-ids | This mean that all identifiers has an average length below 1.5. Only possible if the file contains more than 5 identifiers. |
| suspicious-string | This mean that the suspicious score of all Literal is bigger than 3 |

## API

### runASTAnalysis(str: string, options?: RuntimeOptions) -> Report

```ts
interface RuntimeOptions {
    module?: boolean;
    isMinified?: boolean;
}
```

The method take a first argument which is the code you want to analyse. It will return a Report Object:

```ts
interface Report {
    dependencies: ASTDeps;
    warnings: Warning<BaseWarning>[];
    idsLengthAvg: number;
    stringScore: number;
    isOneLineRequire: boolean;
}
```

## License
MIT
