# js-x-ray
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/fraxken/js-x-ray/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/fraxken/js-x-ray/commit-activity)
[![mit](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/fraxken/js-x-ray/blob/master/LICENSE)
![dep](https://img.shields.io/david/fraxken/js-x-ray)
![size](https://img.shields.io/bundlephobia/min/js-x-ray)

JavaScript AST analysis. This package has been created to export the [Node-Secure](https://github.com/ES-Community/nsecure) AST Analysis to enable better code evolution and allow better access to developers and researchers.

The goal is to quickly identify dangerous code and patterns for developers and Security researchers. Interpreting the results of this tool will still require you to have a set of security notions.

> 💖 I have no particular background in security. I'm simply becoming more and more interested and passionate about static code analysis. But I would be more than happy to learn that my work can help prevent potential future attacks (or leaks).

## Goals
The objective of the project is to successfully detect all potentially suspicious JavaScript codes.. The target is obviously codes that are added or injected for malicious purposes..

Most of the time these hackers will try to hide the behaviour of their codes as much as possible to avoid being spotted or easily understood... The work of the library is to understand and analyze these patterns that will allow us to detect malicious code..

## Features Highlight
- Retrieve required dependencies and files for Node.js.
- Detect unsafe RegEx.
- Get warnings when the AST Analysis as a problem or when not able to follow a statement.
- Highlight common attack patterns and API usages.
- Capable to follow the usage of dangerous Node.js globals.
- Detect obfuscated code and when possible the tool that has been used.

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

---

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

> ⚠️ There is also a lot of suspicious code example in the root cases directory. Feel free to try the tool on these files.

## Warnings Legends (v2.0+)

> Node-secure versions equal or lower than 0.7.0 are no longer compatible with the warnings table below.

This section describe all the possible warnings returned by JSXRay.

| name | description |
| --- | --- |
| parsing-error | An error occured when parsing the JavaScript code with meriyah. It mean that the conversion from string to AST as failed. If you encounter such an error, **please open an issue here**. |
| unsafe-import | Unable to follow an import (require, require.resolve) statement/expr. |
| unsafe-regex | A RegEx as been detected as unsafe and may be used for a ReDoS Attack. |
| unsafe-stmt | Usage of dangerous statement like `eval()` or `Function("")`. |
| unsafe-assign | Assignment of a protected global like `process` or `require`. |
| encoded-literal | An encoded literal has been detected (it can be an hexa value, unicode sequence, base64 string etc) |
| short-identifiers | This mean that all identifiers has an average length below 1.5. Only possible if the file contains more than 5 identifiers. |
| suspicious-literal | This mean that the sum of suspicious score of all Literals is bigger than 3. |
| obfuscated-code (**experimental**) | There's a very high probability that the code is obfuscated... |

> 👀 More details on warnings and their implementations [here](./WARNINGS.md)

## API

<details>
<summary>runASTAnalysis(str: string, options?: RuntimeOptions): Report</summary>

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

</details>

<details>
<summary>generateWarning(kind: string, options?: WarningOptions): Warning< BaseWarning ></summary>

Generate a new Warning Object.

```ts
interface WarningOptions {
    location: Location;
    file?: string;
    value?: string;
}
```

</details>

<details>
<summary>rootLocation(): SourceLocation</summary>

Return a default SourceLocation with all row and column set to zero.
```js
{ start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }
```

</details>

## License
MIT
