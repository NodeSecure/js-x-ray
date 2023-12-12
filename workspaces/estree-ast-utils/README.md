# estree-ast-utils

[![version](https://img.shields.io/github/package-json/v/NodeSecure/js-x-ray?filename=workspaces%2Festree-ast-utils%2Fpackage.json&style=for-the-badge)](https://www.npmjs.com/package/@nodesecure/estree-ast-utils)
[![maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/NodeSecure/js-x-ray/blob/master/workspaces/estree-ast-utils/graphs/commit-activity)
[![OpenSSF
Scorecard](https://api.securityscorecards.dev/projects/github.com/NodeSecure/js-x-ray/badge?style=for-the-badge)](https://api.securityscorecards.dev/projects/github.com/NodeSecure/js-x-ray)
[![mit](https://img.shields.io/github/license/NodeSecure/js-x-ray?style=for-the-badge)](https://github.com/NodeSecure/js-x-ray/blob/master/workspaces/estree-ast-utils/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/NodeSecure/js-x-ray/estree-ast-utils.yml?style=for-the-badge)](https://github.com/NodeSecure/js-x-ray/actions?query=workflow%3A%22estree+ast+utils+CI%22)

Utilities for AST (ESTree compliant)

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/estree-ast-utils
# or
$ yarn add @nodesecure/estree-ast-utils
```

## Usage example

```js
import { VariableTracer } from "@nodesecure/estree-ast-utils";

const tracer = new VariableTracer().enableDefaultTracing();

const data = tracer.getDataFromIdentifier("identifier...here");
console.log(data);
```

## API

<details><summary>arrayExpressionToString(node): IterableIterator< string ></summary>

Translate an ESTree ArrayExpression into an iterable of Literal value.

```js
["foo", "bar"];
```

will return `"foo"` then `"bar"`.

</details>

<details><summary>concatBinaryExpression(node, options): IterableIterator< string ></summary>

Return all Literal part of a given Binary Expression.

```js
"foo" + "bar";
```

will return `"foo"` then `"bar"`.

One of the options of the method is `stopOnUnsupportedNode`, if true it will throw an Error if the left or right side of the Expr is not a supported type.

</details>

<details><summary>getCallExpressionIdentifier(node): string | null</summary>

Return the identifier name of the CallExpression (or null if there is none).

```js
foobar();
```

will return `"foobar"`.

</details>

<details><summary>getMemberExpressionIdentifier(node): IterableIterator< string ></summary>

Return the identifier name of the CallExpression (or null if there is none).

```js
foo.bar();
```

will return `"foo"` then `"bar"`.

</details>

<details><summary>getVariableDeclarationIdentifiers(node): IterableIterator< string ></summary>

Get all variables identifier name.

```js
const [foo, bar] = [1, 2];
```

will return `"foo"` then `"bar"`.

</details>

<details><summary>isLiteralRegex(node): boolean</summary>

Return `true` if the given Node is a Literal Regex Node.

```js
/^hello/g;
```

</details>

## License

MIT
