# js-x-ray
JavaScript AST x-ray analysis. This package has been created to export the [Node-Secure](https://github.com/ES-Community/nsecure) AST Analysis to make it easier to use and evolve the code over time.

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i js-x-ray
# or
$ yarn add js-x-ray
```

## Usage example
```js
const { searchRuntimeDependencies } = require("js-x-ray");
const { readFileSync } = require("fs");

const str = readFileSync("./fileToAnalyze.js", "utf-8");
const report = searchRuntimeDependencies(str, { module: false });
const dependencies = [...report.dependencies];
console.log(dependencies);
```

## API

### searchRuntimeDependencies(str: string, options?: RuntimeOptions): Report;

## License
MIT
