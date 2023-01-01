# js-x-ray
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/NodeSecure/js-x-ray/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/NodeSecure/js-x-ray/commit-activity)
[![mit](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/NodeSecure/js-x-ray/blob/master/LICENSE)
![build](https://img.shields.io/github/actions/workflow/status/NodeSecure/js-x-ray/node.js.yml)

JavaScript AST analysis. This package has been created to export the [Node-Secure](https://github.com/ES-Community/nsecure) AST Analysis to enable better code evolution and allow better access to developers and researchers.

The goal is to quickly identify dangerous code and patterns for developers and Security researchers. Interpreting the results of this tool will still require you to have a set of security notions.

> **Note** I have no particular background in security. I'm simply becoming more and more interested and passionate about static code analysis. But I would be more than happy to learn that my work can help prevent potential future attacks (or leaks).

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
$ npm i @nodesecure/js-x-ray
# or
$ yarn add @nodesecure/js-x-ray
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
import { runASTAnalysis } from "@nodesecure/js-x-ray";
import { readFileSync } from "fs";

const str = readFileSync("./file.js", "utf-8");
const { warnings, dependencies } = runASTAnalysis(str);

const dependenciesName = [...dependencies];
const inTryDeps = [...dependencies.getDependenciesInTryStatement()];

console.log(dependenciesName);
console.log(inTryDeps);
console.log(warnings);
```

The analysis will return: `http` (in try), `crypto`, `util` and `fs`.

> **Warning** There is also a lot of suspicious code example in the `./examples` cases directory. Feel free to try the tool on these files.

## Warnings

This section describes how use `warnings` export.

```ts
type WarningName = "parsing-error"
| "encoded-literal"
| "unsafe-regex"
| "unsafe-stmt"
| "short-identifiers"
| "suspicious-literal"
| "obfuscated-code"
| "weak-crypto"
| "unsafe-import";

declare const warnings: Record<WarningName, {
  i18n: string;
  severity: "Information" | "Warning" | "Critical";
  experimental?: boolean;
}>;
```

We make a call to `i18n` through the package `NodeSecure/i18n` to get the translation.

```js
import * as jsxray from "@nodesecure/js-x-ray";
import * as i18n from "@nodesecure/i18n";

console.log(i18n.getToken(jsxray.warnings["parsing-error"].i18n));
```

## Warnings Legends

> **Warning** versions of NodeSecure greather than v0.7.0 are no longer compatible with the warnings table below.

This section describe all the possible warnings returned by JSXRay. Click on the warning **name** for additional information and examples.

| name | experimental | description |
| --- | :-: | --- |
| [parsing-error](./docs/parsing-error.md) | ❌ | The AST parser throw an error |
| [unsafe-import](./docs/unsafe-import.md) | ❌ | Unable to follow an import (require, require.resolve) statement/expr. |
| [unsafe-regex](./docs/unsafe-regex.md) | ❌ | A RegEx as been detected as unsafe and may be used for a ReDoS Attack. |
| [unsafe-stmt](./docs//unsafe-stmt.md) | ❌ | Usage of dangerous statement like `eval()` or `Function("")`. |
| [encoded-literal](./docs/encoded-literal.md) | ❌ | An encoded literal has been detected (it can be an hexa value, unicode sequence or a base64 string) |
| [short-identifiers](./docs/short-identifiers.md) | ❌ | This mean that all identifiers has an average length below 1.5. |
| [suspicious-literal](./docs/suspicious-literal.md) | ❌ | A suspicious literal has been found in the source code. |
| [obfuscated-code](./docs/obfuscated-code.md) | ✔️ | There's a very high probability that the code is obfuscated. |
| [weak-crypto](./docs/weak-crypto.md) | ✔️ | The code probably contains a weak crypto algorithm (md5, sha1...) |

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
    warnings: Warning[];
    idsLengthAvg: number;
    stringScore: number;
    isOneLineRequire: boolean;
}
```

</details>

<details>
<summary>runASTAnalysisOnFile(pathToFile: string, options?: RuntimeFileOptions): Promise< ReportOnFile ></summary>

```ts
interface RuntimeOptions {
    module?: boolean;
    isMinified?: boolean;
}
```

Run the SAST scanner on a given JavaScript file.

```ts
export type ReportOnFile = {
  ok: true,
  warnings: Warning[];
  dependencies: ASTDeps;
  isMinified: boolean;
} | {
  ok: false,
  warnings: Warning[];
}
```

</details>


## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-10-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://www.linkedin.com/in/thomas-gentilhomme/"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt="Gentilhomme"/><br /><sub><b>Gentilhomme</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=fraxken" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=fraxken" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/js-x-ray/pulls?q=is%3Apr+reviewed-by%3Afraxken" title="Reviewed Pull Requests">👀</a> <a href="#security-fraxken" title="Security">🛡️</a> <a href="https://github.com/NodeSecure/js-x-ray/issues?q=author%3Afraxken" title="Bug reports">🐛</a></td>
      <td align="center"><a href="https://github.com/Rossb0b"><img src="https://avatars.githubusercontent.com/u/39910164?v=4?s=100" width="100px;" alt="Nicolas Hallaert"/><br /><sub><b>Nicolas Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=Rossb0b" title="Documentation">📖</a></td>
      <td align="center"><a href="https://github.com/antoine-coulon"><img src="https://avatars.githubusercontent.com/u/43391199?v=4?s=100" width="100px;" alt="Antoine"/><br /><sub><b>Antoine</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=antoine-coulon" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/Mathieuka"><img src="https://avatars.githubusercontent.com/u/34446722?v=4?s=100" width="100px;" alt="Mathieu"/><br /><sub><b>Mathieu</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=Mathieuka" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/Kawacrepe"><img src="https://avatars.githubusercontent.com/u/40260517?v=4?s=100" width="100px;" alt="Vincent Dhennin"/><br /><sub><b>Vincent Dhennin</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=Kawacrepe" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=Kawacrepe" title="Tests">⚠️</a></td>
      <td align="center"><a href="http://tonygo.dev"><img src="https://avatars.githubusercontent.com/u/22824417?v=4?s=100" width="100px;" alt="Tony Gorez"/><br /><sub><b>Tony Gorez</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=tony-go" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=tony-go" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=tony-go" title="Tests">⚠️</a></td>
      <td align="center"><a href="https://github.com/PierreDemailly"><img src="https://avatars.githubusercontent.com/u/39910767?v=4?s=100" width="100px;" alt="PierreD"/><br /><sub><b>PierreD</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=PierreDemailly" title="Tests">⚠️</a></td>
    </tr>
    <tr>
      <td align="center"><a href="https://www.linkedin.com/in/franck-hallaert/"><img src="https://avatars.githubusercontent.com/u/110826655?v=4?s=100" width="100px;" alt="Franck Hallaert"/><br /><sub><b>Franck Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=Aekk0" title="Code">💻</a></td>
      <td align="center"><a href="https://maji.kiwi"><img src="https://avatars.githubusercontent.com/u/33150916?v=4?s=100" width="100px;" alt="Maji"/><br /><sub><b>Maji</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=M4gie" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/targos"><img src="https://avatars.githubusercontent.com/u/2352663?v=4?s=100" width="100px;" alt="Michaël Zasso"/><br /><sub><b>Michaël Zasso</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=targos" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/issues?q=author%3Atargos" title="Bug reports">🐛</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
