<p align="center">
  <img src="https://user-images.githubusercontent.com/4438263/213887379-c873eb89-8786-4b5c-8a59-dcca49e01cb8.jpg" alt="@nodesecure/js-x-ray">
</p>

<p align="center">
    <a href="https://github.com/NodeSecure/js-x-ray">
      <img src="https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&url=https://raw.githubusercontent.com/NodeSecure/js-x-ray/master/package.json&query=$.version&label=Version" alt="npm version">
    </a>
    <a href="https://github.com/NodeSecure/js-x-ray/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/NodeSecure/js-x-ray.svg?style=for-the-badge" alt="license">
    </a>
    <a href="https://api.securityscorecards.dev/projects/github.com/NodeSecure/js-x-ray">
      <img src="https://api.securityscorecards.dev/projects/github.com/NodeSecure/js-x-ray/badge?style=for-the-badge" alt="ossf scorecard">
    </a>
    <a href="https://github.com/NodeSecure/js-x-ray/actions?query=workflow%3A%22Node.js+CI%22">
      <img src="https://img.shields.io/github/actions/workflow/status/NodeSecure/js-x-ray/node.js.yml?style=for-the-badge" alt="github ci workflow">
    </a>
    <a href="https://codecov.io/github/NodeSecure/js-xray">
      <img src="https://img.shields.io/codecov/c/github/NodeSecure/js-x-ray?style=for-the-badge" alt="codecov">
    </a>
</p>

JavaScript AST analysis. This package has been created to export the [NodeSecure](https://github.com/NodeSecure/cli) AST Analysis to enable better code evolution and allow better access to developers and researchers.

The goal is to quickly identify dangerous code and patterns for developers and Security researchers. Interpreting the results of this tool will still require you to have a set of security notions.

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
---

If you meant to run this example with Node.js quickly in terminal, use this example below to correctly display the ``location`` field.
```js
import { runASTAnalysis } from "@nodesecure/js-x-ray";
import { readFileSync } from "fs";

const str = readFileSync("./file.js", "utf-8");
const { warnings, dependencies } = runASTAnalysis(str);

const dependenciesName = [...dependencies];
const inTryDeps = [...dependencies.getDependenciesInTryStatement()];

console.log(dependenciesName);
console.log(inTryDeps);
console.log(JSON.stringify(warnings, null, 2));
```
save content above to a ``.mjs`` file and run it with this command in your terminal``
node ./example_filename.mjs``

---

The analysis will return: `http` (in try), `crypto`, `util` and `fs`.

> [!NOTE]
> There is also a lot of suspicious code example in the `./examples` cases directory. Feel free to try the tool on these files.

## Warnings

This section describes how use `warnings` export.

```ts
type WarningName = "parsing-error"
| "encoded-literal"
| "unsafe-regex"
| "unsafe-stmt"
| "short-identifiers"
| "suspicious-literal"
| "suspicious-file"
| "obfuscated-code"
| "weak-crypto"
| "unsafe-import"
| "shady-link";

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

console.log(i18n.getTokenSync(jsxray.warnings["parsing-error"].i18n));
```

## Warnings Legends

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
| [suspicious-file](./docs/suspicious-file.md) | ✔️ | A suspicious file with more than ten encoded-literal in it |
| [obfuscated-code](./docs/obfuscated-code.md) | ✔️ | There's a very high probability that the code is obfuscated. |
| [weak-crypto](./docs/weak-crypto.md) | ✔️ | The code probably contains a weak crypto algorithm (md5, sha1...) |
| [shady-link](./docs/shady-link.md) | ✔️ | The code contains shady/unsafe link |

## API

<details>
<summary>runASTAnalysis(str: string, options?: RuntimeOptions): Report</summary>

```ts
interface RuntimeOptions {
  module?: boolean;
  isMinified?: boolean;
  removeHTMLComments?: boolean;
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
  removeHTMLComments?: boolean;
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

## Workspaces

Click on one of the links to access the documentation of the workspace:

| name | package and link |
| --- | --- |
| estree-ast-util | [@nodesecure/estree-ast-util](./workspaces/estree-ast-util) |
| sec-literal | [@nodesecure/sec-literal ](./workspaces/sec-literal) |

These packages are available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).
```bash
$ npm i @nodesecure/estree-ast-util
# or
$ yarn add @nodesecure/estree-ast-util
```

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-11-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/thomas-gentilhomme/"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt="Gentilhomme"/><br /><sub><b>Gentilhomme</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=fraxken" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=fraxken" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/js-x-ray/pulls?q=is%3Apr+reviewed-by%3Afraxken" title="Reviewed Pull Requests">👀</a> <a href="#security-fraxken" title="Security">🛡️</a> <a href="https://github.com/NodeSecure/js-x-ray/issues?q=author%3Afraxken" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Rossb0b"><img src="https://avatars.githubusercontent.com/u/39910164?v=4?s=100" width="100px;" alt="Nicolas Hallaert"/><br /><sub><b>Nicolas Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=Rossb0b" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/antoine-coulon"><img src="https://avatars.githubusercontent.com/u/43391199?v=4?s=100" width="100px;" alt="Antoine"/><br /><sub><b>Antoine</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=antoine-coulon" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Mathieuka"><img src="https://avatars.githubusercontent.com/u/34446722?v=4?s=100" width="100px;" alt="Mathieu"/><br /><sub><b>Mathieu</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=Mathieuka" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Kawacrepe"><img src="https://avatars.githubusercontent.com/u/40260517?v=4?s=100" width="100px;" alt="Vincent Dhennin"/><br /><sub><b>Vincent Dhennin</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=Kawacrepe" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=Kawacrepe" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://tonygo.dev"><img src="https://avatars.githubusercontent.com/u/22824417?v=4?s=100" width="100px;" alt="Tony Gorez"/><br /><sub><b>Tony Gorez</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=tony-go" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=tony-go" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=tony-go" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/PierreDemailly"><img src="https://avatars.githubusercontent.com/u/39910767?v=4?s=100" width="100px;" alt="PierreD"/><br /><sub><b>PierreD</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=PierreDemailly" title="Tests">⚠️</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=PierreDemailly" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/franck-hallaert/"><img src="https://avatars.githubusercontent.com/u/110826655?v=4?s=100" width="100px;" alt="Franck Hallaert"/><br /><sub><b>Franck Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=Aekk0" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://maji.kiwi"><img src="https://avatars.githubusercontent.com/u/33150916?v=4?s=100" width="100px;" alt="Maji"/><br /><sub><b>Maji</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=M4gie" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/targos"><img src="https://avatars.githubusercontent.com/u/2352663?v=4?s=100" width="100px;" alt="Michaël Zasso"/><br /><sub><b>Michaël Zasso</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=targos" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/issues?q=author%3Atargos" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fabnguess"><img src="https://avatars.githubusercontent.com/u/72697416?v=4?s=100" width="100px;" alt="Kouadio Fabrice Nguessan"/><br /><sub><b>Kouadio Fabrice Nguessan</b></sub></a><br /><a href="#maintenance-fabnguess" title="Maintenance">🚧</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=fabnguess" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
