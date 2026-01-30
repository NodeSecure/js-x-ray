<p align="center">
  <img src="https://user-images.githubusercontent.com/4438263/213887379-c873eb89-8786-4b5c-8a59-dcca49e01cb8.jpg" alt="@nodesecure/js-x-ray">
</p>

<p align="center">
    <a href="https://github.com/NodeSecure/js-x-ray">
      <img src="https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&url=https://raw.githubusercontent.com/NodeSecure/js-x-ray/refs/heads/master/workspaces/js-x-ray/package.json&query=$.version&label=Version" alt="npm version">
    </a>
    <a href="https://github.com/NodeSecure/js-x-ray/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/NodeSecure/js-x-ray.svg?style=for-the-badge" alt="license">
    </a>
    <a href="https://api.securityscorecards.dev/projects/github.com/NodeSecure/js-x-ray">
      <img src="https://api.securityscorecards.dev/projects/github.com/NodeSecure/js-x-ray/badge?style=for-the-badge" alt="ossf scorecard">
    </a>
    <a href="https://slsa.dev/spec/v1.0/levels#build-l3">
      <img src="https://img.shields.io/badge/SLSA-level%203-green?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABMlBMVEXvMQDvMADwMQDwMADwMADvMADvMADwMADwMQDvMQDvMQDwMADwMADvMADwMADwMADwMQDvMQDvMQDwMQDvMQDwMQDwMADwMADwMQDwMADwMADvMADvMQDvMQDwMADwMQDwMADvMQDwMADwMQDwMADwMADwMADwMADwMADwMADvMQDvMQDwMADwMQDwMADvMQDvMQDwMADvMQDvMQDwMADwMQDwMQDwMQDvMQDwMADvMADwMADwMQDvMQDwMADwMQDwMQDwMQDwMQDvMQDvMQDvMADwMADvMADvMADvMADwMQDwMQDvMADvMQDvMQDvMADvMADvMQDwMQDvMQDvMADvMADvMADvMQDwMQDvMQDvMQDvMADvMADwMADvMQDvMQDvMQDvMADwMADwMQDwMAAAAAA/HoSwAAAAY3RSTlMpsvneQlQrU/LQSWzvM5DzmzeF9Pi+N6vvrk9HuP3asTaPgkVFmO3rUrMjqvL6d0LLTVjI/PuMQNSGOWa/6YU8zNuDLihJ0e6aMGzl8s2IT7b6lIFkRj1mtvQ0eJW95rG0+Sid59x/AAAAAWJLR0Rltd2InwAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAAd0SU1FB+YHGg0tGLrTaD4AAACqSURBVAjXY2BgZEqGAGYWVjYGdg4oj5OLm4eRgZcvBcThFxAUEk4WYRAVE09OlpCUkpaRTU6WY0iWV1BUUlZRVQMqUddgSE7W1NLS1gFp0NXTB3KTDQyNjE2Sk03NzC1A3GR1SytrG1s7e4dkBogtjk7OLq5uyTCuu4enl3cyhOvj66fvHxAIEmYICg4JDQuPiAQrEmGIio6JjZOFOjSegSHBBMpOToxPAgCJfDZC/m2KHgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0wNy0yNlQxMzo0NToyNCswMDowMC8AywoAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMDctMjZUMTM6NDU6MjQrMDA6MDBeXXO2AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg==" alt="slsa level3">
    </a>
    <a href="https://github.com/NodeSecure/js-x-ray/actions?query=workflow%3A%22Node.js+CI%22">
      <img src="https://img.shields.io/github/actions/workflow/status/NodeSecure/js-x-ray/node.js.yml?style=for-the-badge" alt="github ci workflow">
    </a>
</p>

**JS-X-Ray** is a JavaScript & TypeScript [SAST](https://github.com/resources/articles/what-is-sast) for identifying malicious patterns, security vulnerabilities, and code anomalies. Think of it as ESLint, but dedicated to security analysis. Originally created for [NodeSecure CLI](https://github.com/NodeSecure/cli), JS-X-Ray has become an independent and serious option for supply chain protection.

## 🔎 How It Works

JS-X-Ray parses code into an **Abstract Syntax Tree (AST)** using [Meriyah](https://github.com/meriyah/meriyah) with no extensive usage of RegEx or Semgrep rules. This enables variable tracing, dynamic import resolution, and detection of sophisticated obfuscation that pattern-matching tools miss. The tradeoff is that JS-X-Ray is purely dedicated to the JavaScript/TypeScript ecosystem.

## 💡 Features
- Retrieve required dependencies and files for Node.js
  - Track `require()`, `import`, and dynamic imports with full tracing capabilities
  - Detect untraceable and malicious import patterns
- Scan entire projects with multi-file analysis capabilities
- Extract infrastructure components (URLs, IPs, hostnames, emails)
- Detect malicious code patterns
  - Obfuscated code with tool identification (freejsobfuscator, jsfuck, jjencode, obfuscator.io, morse, Trojan Source)
  - Data exfiltration and unauthorized system information collection
  - Suspicious files with excessive encoded literals
- Identify vulnerable code patterns
  - Unsafe statements (`eval()`, `Function()` constructor)
  - ReDoS vulnerabilities in regular expressions
  - SQL injection vulnerabilities
  - Unsafe shell commands in `spawn()` or `exec()` calls
  - `process.env` serialization attempts
- Flag weak cryptographic usage
  - Deprecated algorithms (MD5, SHA1, MD4, MD2, RIPEMD160)
- Detect code quality issues
  - Monkey-patching of built-in prototypes
  - Encoded literals (hex, Unicode, base64)
  - Suspicious URLs and links
  - Short identifier lengths (obfuscation indicators)
  - Synchronous I/O and logging usage (optional)
- Configurable sensitivity modes (conservative/aggressive) and extensible probe system 

## 💃 Getting Started

This package is available in the Node package repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/js-x-ray
# or
$ yarn add @nodesecure/js-x-ray
```

## 👀 Usage example

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
import { AstAnalyser } from "@nodesecure/js-x-ray";
import { readFileSync } from "node:fs";

const scanner = new AstAnalyser();

const { warnings, dependencies } = await scanner.analyseFile(
  "./file.js"
);

console.log(dependencies);
console.dir(warnings, { depth: null });
```

The analysis will return: `http` (in try), `crypto`, `util` and `fs`.

> [!TIP]
> There are also a lot of suspicious code examples in the `./workspaces/js-x-ray/examples` directory. Feel free to try the tool on these files.

### Scanning a complete project

By itself, JS-X-Ray does not provide utilities to walk and scan a complete project. However, NodeSecure has packages to achieve that:

```ts
import { ManifestManager } from "@nodesecure/mama";
import { NpmTarball } from "@nodesecure/tarball";

const mama = await ManifestManager.fromPackageJSON(
  "./path/to/package.json"
);
const extractor = new NpmTarball(mama);

const {
  composition, // Project composition (files, dependencies, extensions)
  conformance, // License conformance (SPDX)
  code         // JS-X-Ray analysis results
} = await extractor.scanFiles();

console.log(code);
```

The `NpmTarball` class uses JS-X-Ray under the hood, and `ManifestManager` locates entry (input) files for analysis.

Alternatively, you can use `EntryFilesAnalyser` directly for multi-file analysis. See the [EntryFilesAnalyser API documentation](./workspaces/js-x-ray/docs/EntryFilesAnalyser.md) for more details.

## 📚 API

- [AstAnalyser](./workspaces/js-x-ray/docs/AstAnalyser.md)
- [EntryFilesAnalyser](./workspaces/js-x-ray/docs/EntryFilesAnalyser.md)
- [CollectableSet](./workspaces/js-x-ray/docs/CollectableSet.md)


## Warnings

```ts
type OptionalWarningName =
  | "synchronous-io"
  | "log-usage";

type WarningName =
  | "parsing-error"
  | "encoded-literal"
  | "unsafe-regex"
  | "unsafe-stmt"
  | "short-identifiers"
  | "suspicious-literal"
  | "suspicious-file"
  | "obfuscated-code"
  | "weak-crypto"
  | "shady-link"
  | "unsafe-command"
  | "unsafe-import"
  | "serialize-environment"
  | "data-exfiltration"
  | "sql-injection"
  | "monkey-patch"
  | OptionalWarningName;

interface Warning<T = WarningName> {
  kind: T | (string & {});
  file?: string;
  value: string | null;
  source: string;
  location: null | SourceArrayLocation | SourceArrayLocation[];
  i18n: string;
  severity: "Information" | "Warning" | "Critical";
  experimental?: boolean;
}

declare const warnings: Record<WarningName, {
  i18n: string;
  severity: "Information" | "Warning" | "Critical";
  experimental: boolean;
}>;
```

### Optional Warnings

Some warnings are not included by default and must be explicitly requested through the `AstAnalyser` API.

```js
import { AstAnalyser } from "@nodesecure/js-x-ray";

// Enable all optional warnings
const scanner = new AstAnalyser({
  optionalWarnings: true
});

// Or enable specific optional warnings
const scannerSpecific = new AstAnalyser({
  optionalWarnings: ["synchronous-io", "log-usage"]
});
```

The following warnings are optional:
- `synchronous-io` - Detects synchronous I/O operations that could impact performance
- `log-usage` - Tracks usage of logging functions (console.log, logger.info, etc.)

### Internationalization (i18n)

Warnings support internationalization through the `@nodesecure/i18n` package. Each warning has an i18n key that can be used to retrieve localized descriptions.

```js
import * as jsxray from "@nodesecure/js-x-ray";
import * as i18n from "@nodesecure/i18n";

await i18n.extendFromSystemPath(jsxray.i18nLocation());

const message = i18n.getTokenSync(
  jsxray.warnings["parsing-error"].i18n
);
console.log(message);
```

### Warning Catalog

Click on the warning **name** for detailed documentation and examples.

#### Critical Severity

| Name | Experimental | Description |
| --- | :-: | --- |
| [suspicious-file](./docs/suspicious-file.md) | No | Suspicious file containing more than ten encoded literals |
| [obfuscated-code](./docs/obfuscated-code.md) | **Yes** | High probability of code obfuscation detected |

#### Warning Severity

| Name | Experimental | Description |
| --- | :-: | --- |
| [unsafe-import](./docs/unsafe-import.md) | No | Unable to follow an import (`require`, `require.resolve`) statement |
| [unsafe-regex](./docs/unsafe-regex.md) | No | Unsafe regular expression that may be vulnerable to ReDoS attacks |
| [unsafe-stmt](./docs/unsafe-stmt.md) | No | Usage of dangerous statements like `eval()` or `Function("")` |
| [unsafe-command](./docs/unsafe-command.md) | **Yes** | Suspicious commands detected in `spawn()` or `exec()` |
| [short-identifiers](./docs/short-identifiers.md) | No | Average identifier length below 1.5 characters (possible obfuscation) |
| [suspicious-literal](./docs/suspicious-literal.md) | No | Suspicious literal values detected in source code |
| [weak-crypto](./docs/weak-crypto.md) | No | Usage of weak cryptographic algorithms (MD5, SHA1, etc.) |
| [shady-link](./docs/shady-link.md) | No | Suspicious or potentially malicious URLs detected |
| [synchronous-io](./docs/synchronous-io.md) ⚠️ | **Yes** | Synchronous I/O operations that may impact performance |
| [serialize-environment](./docs/serialize-environment.md) | No | Attempts to serialize `process.env` (potential data exfiltration) |
| [data-exfiltration](./docs/data-exfiltration.md) | No | Potential unauthorized transfer of sensitive data |
| [sql-injection](./docs/sql-injection.md) | No | Potential SQL injection vulnerability detected |
| [monkey-patch](./docs/monkey-patch.md) | No | Modification of built-in JavaScript prototype properties |

#### Information Severity

| Name | Experimental | Description |
| --- | :-: | --- |
| [parsing-error](./docs/parsing-error.md) | No | AST parser encountered an error while analyzing the code |
| [encoded-literal](./docs/encoded-literal.md) | No | Encoded literal detected (hexadecimal, Unicode, base64) |
| [log-usage](./docs/log-usage.md) ⚠️ | No | Usage of logging functions (console.log, logger methods, etc.) |

> [!NOTE]
> Warnings marked with ⚠️ are optional and must be explicitly enabled (see [Optional Warnings](#optional-warnings) section).

## Contributors guide

If you are a developer **looking to contribute** to the project, you must first read the [CONTRIBUTING](./CONTRIBUTING.md) guide.

Once you have finished your development, check that the tests (and linter) are still good by running the following script:

```bash
$ npm run check
```

> [!CAUTION]
> In case you introduce a new feature or fix a bug, make sure to include tests for it as well.

### Benchmarks

The performance of js-x-ray is measured and tracked using [mitata](https://github.com/evanwashere/mitata).

To run the benchmarks:
1. Navigate to `workspaces/js-x-ray`.
2. Run `npm run bench`.

### Workspaces

Click on one of the links to access the documentation of the workspace:

| name | package and link |
| --- | --- |
| js-x-ray | [@nodesecure/js-x-ray](./workspaces/js-x-ray) |
| js-x-ray-ai | [@nodesecure/js-x-ray-ai](./workspaces/js-x-ray-ai) |
| estree-ast-utils | [@nodesecure/estree-ast-utils](./workspaces/estree-ast-utils) |
| tracer | [@nodesecure/tracer](./workspaces/tracer) |
| sec-literal | [@nodesecure/sec-literal](./workspaces/sec-literal) |
| ts-source-parser | [@nodesecure/ts-source-parser](./workspaces/ts-source-parser) |

These packages are available in the Node package repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).
```bash
$ npm i @nodesecure/estree-ast-util
# or
$ yarn add @nodesecure/estree-ast-util
```

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-22-orange.svg?style=flat-square)](#contributors-)
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
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jean-michelet"><img src="https://avatars.githubusercontent.com/u/110341611?v=4?s=100" width="100px;" alt="Jean"/><br /><sub><b>Jean</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=jean-michelet" title="Tests">⚠️</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=jean-michelet" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=jean-michelet" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tchapacan"><img src="https://avatars.githubusercontent.com/u/28821702?v=4?s=100" width="100px;" alt="tchapacan"/><br /><sub><b>tchapacan</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=tchapacan" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=tchapacan" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://miikkak.dev"><img src="https://avatars.githubusercontent.com/u/65869801?v=4?s=100" width="100px;" alt="mkarkkainen"/><br /><sub><b>mkarkkainen</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=mkarkkainen" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/FredGuiou"><img src="https://avatars.githubusercontent.com/u/99122562?v=4?s=100" width="100px;" alt="FredGuiou"/><br /><sub><b>FredGuiou</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=FredGuiou" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=FredGuiou" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/madina0801"><img src="https://avatars.githubusercontent.com/u/101329759?v=4?s=100" width="100px;" alt="Madina"/><br /><sub><b>Madina</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=madina0801" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sairuss7"><img src="https://avatars.githubusercontent.com/u/87803528?v=4?s=100" width="100px;" alt="SairussDev"/><br /><sub><b>SairussDev</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=sairuss7" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fless-lab"><img src="https://avatars.githubusercontent.com/u/71844440?v=4?s=100" width="100px;" alt="Abdou-Raouf ATARMLA"/><br /><sub><b>Abdou-Raouf ATARMLA</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=fless-lab" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://clementgombauld.netlify.app/"><img src="https://avatars.githubusercontent.com/u/91478082?v=4?s=100" width="100px;" alt="Clement Gombauld"/><br /><sub><b>Clement Gombauld</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=clemgbld" title="Code">💻</a> <a href="https://github.com/NodeSecure/js-x-ray/commits?author=clemgbld" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/intincrab"><img src="https://avatars.githubusercontent.com/u/93028153?v=4?s=100" width="100px;" alt="Ajāy "/><br /><sub><b>Ajāy </b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=intincrab" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://michael.mior.ca"><img src="https://avatars.githubusercontent.com/u/82501?v=4?s=100" width="100px;" alt="Michael Mior"/><br /><sub><b>Michael Mior</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=michaelmior" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/7amed3li"><img src="https://avatars.githubusercontent.com/u/190534558?v=4?s=100" width="100px;" alt="Hamed Mohamed"/><br /><sub><b>Hamed Mohamed</b></sub></a><br /><a href="https://github.com/NodeSecure/js-x-ray/commits?author=7amed3li" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
