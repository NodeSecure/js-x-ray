<p align="center">
  <h1 align="center">
    @nodesecure/estree-ast-utils
  </h1>
</p>

<p align="center">
  ESTree compliant utilities to manipulate, extract and transform AST nodes.
</p>

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/estree-ast-utils
# or
$ yarn add @nodesecure/estree-ast-utils
```

## API

<details><summary>arrayExpressionToString(node: ESTree.Node | null): IterableIterator< string ></summary>

Translate an ESTree ArrayExpression into an iterable of Literal value.

```js
["foo", "bar"];
```

will return `"foo"` then `"bar"`.

</details>

<details><summary>concatBinaryExpression(node: ESTree.BinaryExpression, options?: ConcatBinaryExpressionOptions): IterableIterator< string ></summary>

Return all Literal part of a given Binary Expression.

```js
"foo" + "bar";
```

will return `"foo"` then `"bar"`.

```ts
export interface ConcatBinaryExpressionOptions extends TracerOptions {
  stopOnUnsupportedNode?: boolean;
}
```

If `stopOnUnsupportedNode` option is enabled it will throw an Error if the left or right side of the Expr is not a supported type.

</details>

<details><summary>getCallExpressionIdentifier(node: ESTree.Node, options?: GetCallExpressionIdentifierOptions): string | null</summary>

Return the identifier name of the CallExpression (or null if there is none).

```js
foobar();
```

will return `"foobar"`.

One of the options of the method is `resolveCallExpression` (which is true by default).

Sometimes you don't want to resolve/jump early CallExpression like in the following example:
```js
require('./file.js')();
//     ^ Second     ^ First
```

With **resolveCallExpression** equal to **false** the function return `null`.


</details>

<details><summary>getMemberExpressionIdentifier(node: ESTree.MemberExpression, options?: TracerOptions): IterableIterator< string ></summary>

Return the identifier name of the CallExpression (or null if there is none).

```js
foo.bar();
```

will return `"foo"` then `"bar"`.

</details>

<details><summary>getVariableDeclarationIdentifiers(node: any, options?: GetVariableDeclarationIdentifiersOptions): IterableIterator< string ></summary>

Get all variables identifier name.

```js
const [foo, bar] = [1, 2];
```

will return `"foo"` then `"bar"`.

</details>

<details><summary>extractLogicalExpression(node: ESTree.Node): IterableIterator< { operator: string; node: ESTree.Expression; } ></summary>

Extract all LogicalExpression recursively and return an IterableIterator of 

```ts
{ operator: "||" | "&&" | "??", node: any }
```

For the following code example

```js
freeGlobal || freeSelf || Function('return this')();
```

The extract will return three parts
- freeGlobal
- freeSelf
- and finally `Function('return this')();`

</details>

## License

MIT
