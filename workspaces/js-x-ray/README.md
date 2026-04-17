<p align="center">
  <img src="https://user-images.githubusercontent.com/4438263/213887379-c873eb89-8786-4b5c-8a59-dcca49e01cb8.jpg" alt="@nodesecure/js-x-ray">
</p>

**JS-X-Ray** is a JavaScript & TypeScript [SAST](https://github.com/resources/articles/what-is-sast) for identifying malicious patterns, security vulnerabilities, and code anomalies. Think of it as ESLint, but dedicated to security analysis. Originally created for [NodeSecure CLI](https://github.com/NodeSecure/cli), JS-X-Ray has become an independent and serious option for supply chain protection.

## 🔎 How It Works

JS-X-Ray parses JS or TS code into an **Abstract Syntax Tree (AST)** with no extensive usage of RegEx or Semgrep rules. This enables variable tracing, dynamic import resolution, and detection of sophisticated obfuscation that pattern-matching tools miss. The tradeoff is that JS-X-Ray is purely dedicated to the JavaScript/TypeScript ecosystem.

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
  - Weak scrypt parameters (insufficient cost, short or hardcoded salt)
- Detect code quality issues
  - Monkey-patching of built-in prototypes
  - Encoded literals (hex, Unicode, base64)
  - Suspicious URLs and links
  - Short identifier lengths (obfuscation indicators)
  - Synchronous I/O and logging usage (optional)
- Configurable sensitivity modes (conservative/aggressive) and extensible probe system
- Support both JavaScript and TypeScript

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

Alternatively, you can use `EntryFilesAnalyser` directly for multi-file analysis. See the [EntryFilesAnalyser API documentation](./docs/EntryFilesAnalyser.md) for more details.

## 📚 API

- [AstAnalyser](./docs/AstAnalyser.md)
- [EntryFilesAnalyser](./docs/EntryFilesAnalyser.md)
- [CollectableSet](./docs/CollectableSet.md)
- [SourceParser](./docs/SourceParser.md)
- [VariableTracer](./docs/VariableTracer.md)

## Warnings

```ts
type OptionalWarningName =
  | "synchronous-io"
  | "log-usage"
  | "weak-scrypt"
  | "weak-argon2";

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
  | "prototype-pollution"
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
  optionalWarnings: ["synchronous-io", "log-usage", "weak-scrypt", "weak-argon2"]
});
```

The following warnings are optional:
- `synchronous-io` - Detects synchronous I/O operations that could impact performance
- `log-usage` - Tracks usage of logging functions (console.log, logger.info, etc.)
- `weak-scrypt` - Detects weak scrypt parameters (low cost, short or hardcoded salt)
- `weak-argon2` - Detects weak Argon2 parameters (wrong algorithm, weak parameters, hardcoded nonce)

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
| [suspicious-file](https://github.com/NodeSecure/js-x-ray/blob/master/docs/suspicious-file.md) | No | Suspicious file containing more than ten encoded literals |
| [obfuscated-code](https://github.com/NodeSecure/js-x-ray/blob/master/docs/obfuscated-code.md) | **Yes** | High probability of code obfuscation detected |

#### Warning Severity

| Name | Experimental | Description |
| --- | :-: | --- |
| [unsafe-import](https://github.com/NodeSecure/js-x-ray/blob/master/docs/unsafe-import.md) | No | Unable to follow an import (`require`, `require.resolve`) statement |
| [unsafe-regex](https://github.com/NodeSecure/js-x-ray/blob/master/docs/unsafe-regex.md) | No | Unsafe regular expression that may be vulnerable to ReDoS attacks |
| [unsafe-stmt](https://github.com/NodeSecure/js-x-ray/blob/master/docs/unsafe-stmt.md) | No | Usage of dangerous statements like `eval()` or `Function("")` |
| [unsafe-command](https://github.com/NodeSecure/js-x-ray/blob/master/docs/unsafe-command.md) | **Yes** | Suspicious commands detected in `spawn()` or `exec()` |
| [short-identifiers](https://github.com/NodeSecure/js-x-ray/blob/master/docs/short-identifiers.md) | No | Average identifier length below 1.5 characters (possible obfuscation) |
| [suspicious-literal](https://github.com/NodeSecure/js-x-ray/blob/master/docs/suspicious-literal.md) | No | Suspicious literal values detected in source code |
| [weak-crypto](https://github.com/NodeSecure/js-x-ray/blob/master/docs/weak-crypto.md) | No | Usage of weak cryptographic algorithms (MD5, SHA1, etc.) |
| [shady-link](https://github.com/NodeSecure/js-x-ray/blob/master/docs/shady-link.md) | No | Suspicious or potentially malicious URLs detected |
| [synchronous-io](https://github.com/NodeSecure/js-x-ray/blob/master/docs/synchronous-io.md) ⚠️ | **Yes** | Synchronous I/O operations that may impact performance |
| [serialize-environment](https://github.com/NodeSecure/js-x-ray/blob/master/docs/serialize-environment.md) | No | Attempts to serialize `process.env` (potential data exfiltration) |
| [data-exfiltration](https://github.com/NodeSecure/js-x-ray/blob/master/docs/data-exfiltration.md) | No | Potential unauthorized transfer of sensitive data |
| [sql-injection](https://github.com/NodeSecure/js-x-ray/blob/master/docs/sql-injection.md) | No | Potential SQL injection vulnerability detected |
| [monkey-patch](https://github.com/NodeSecure/js-x-ray/blob/master/docs/monkey-patch.md) | No | Modification of built-in JavaScript prototype properties |
| [prototype-pollution](https://github.com/NodeSecure/js-x-ray/blob/master/docs/prototype-pollution.md) | No | Detected use of `__proto__` to pollute object prototypes |
| [weak-scrypt](https://github.com/NodeSecure/js-x-ray/blob/master/docs/weak-scrypt.md) ⚠️ | **Yes** | Usage of weak scrypt parameters (low cost, short or hardcoded salt) |
| [weak-argon2](https://github.com/NodeSecure/js-x-ray/blob/master/docs/weak-argon2.md) ⚠️ | **Yes** | Usage of weak Argon2 parameters (wrong algorithm, weak parameters, hardcoded nonce) |

#### Information Severity

| Name | Experimental | Description |
| --- | :-: | --- |
| [parsing-error](https://github.com/NodeSecure/js-x-ray/blob/master/docs/parsing-error.md) | No | AST parser encountered an error while analyzing the code |
| [encoded-literal](https://github.com/NodeSecure/js-x-ray/blob/master/docs/encoded-literal.md) | No | Encoded literal detected (hexadecimal, Unicode, base64) |
| [log-usage](https://github.com/NodeSecure/js-x-ray/blob/master/docs/log-usage.md) ⚠️ | No | Usage of logging functions (console.log, logger methods, etc.) |

> [!NOTE]
> Warnings marked with ⚠️ are optional and must be explicitly enabled (see [Optional Warnings](#optional-warnings) section).

## License 
MIT
