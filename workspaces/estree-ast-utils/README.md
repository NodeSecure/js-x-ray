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

Most utility options extend the `DefaultOptions` interface:

```ts
export interface DefaultOptions {
  externalIdentifierLookup?(name: string): string | null;
}
```

You can provide a custom `externalIdentifierLookup` function to enable the utilities to resolve identifiers from external sources—such as **VariableTracer**, for example.

---

<details>
<summary>arrayExpressionToString(node: ESTree.Node | null, options?: ArrayExpressionToStringOptions): IterableIterator< string ></summary>

Transforms an ESTree `ArrayExpression` into an iterable of literal values.

```js
["foo", "bar"];
```

will yield `"foo"`, then `"bar"`.

```ts
export interface ArrayExpressionToStringOptions extends DefaultOptions {
  /**
   * When enabled, resolves the char code of the literal value.
   *
   * @default true
   * @example
   * [65, 66] // => ['A', 'B']
   */
  resolveCharCode?: boolean;
}
```

</details>

<details>
<summary>joinArrayExpression(node: ESTree.Node | null, options?: DefaultOptions): string | null</summary>

Compute simple ArrayExpression that are using a CallExpression `join()`

```js
{
  host: [
    ["goo", "g", "gle"].join(""),
    "com"
  ].join(".")
}
```

Will return `google.com`

</details>

<details>
<summary>concatBinaryExpression(node: ESTree.BinaryExpression, options?: ConcatBinaryExpressionOptions): IterableIterator< string ></summary>

Returns all `Literal` nodes from a binary expression.

```js
"foo" + "bar";
```

Will yield `"foo"`, then `"bar"`.

Options are described by the following interface:

```ts
interface ConcatBinaryExpressionOptions extends DefaultOptions {
  /**
   * When set to true, the function will throw an error if it encounters
   * a node type that is not supported (i.e., not a Literal, BinaryExpr, ArrayExpr or Identifier).
   *
   * @default false
   * @example
   * "foo" + fn() + "bar" // <- will throw an error if `stopOnUnsupportedNode` is true
   */
  stopOnUnsupportedNode?: boolean;
}
```

</details>

<details>
<summary>extractLogicalExpression(node: ESTree.Node): IterableIterator< { operator: string; node: ESTree.Expression; } ></summary>

Recursively extracts all `LogicalExpression` components.

```ts
{ operator: "||" | "&&" | "??", node: ESTree.Expression }
```

For example:

```js
freeGlobal || freeSelf || Function('return this')();
```

Will yield three components:
- freeGlobal
- freeSelf
- and finally `Function('return this')();`

</details>

<details>
<summary>getCallExpressionArguments(node: ESTree.Node, options?: DefaultOptions): string[] | null</summary>

Returns the literal arguments of a `CallExpression`.

For example:

```js
eval("require");
```

Returns

```js
["require"]
```

</details>

<details>
<summary>getCallExpressionIdentifier(node: ESTree.Node, options?: GetCallExpressionIdentifierOptions): string | null</summary>

Returns the identifier name of a `CallExpression`, or **null** if not resolvable.

```js
foobar();
```

Returns `"foobar"`.

By default, it resolves member expressions.
This can be disabled with resolveCallExpression: false.

```js
require('./file.js')();
//     ^ Second     ^ First
```

With `resolveCallExpression`: false, the function will return null.

```ts
interface GetCallExpressionIdentifierOptions extends DefaultOptions {
  /**
   * Resolve the CallExpression callee if it is a MemberExpression.
   *
   * @default true
   * @example
   * require('./file.js')();
            ^ Second     ^ First
   */
  resolveCallExpression?: boolean;
}
```

</details>

<details>
<summary>getMemberExpressionIdentifier(node: ESTree.MemberExpression, options?: DefaultOptions): IterableIterator< string ></summary>

Returns the identifier chain from a `MemberExpression`.

```js
foo.bar();
```

will return `"foo"` then `"bar"`.

</details>

<details>
<summary>getVariableDeclarationIdentifiers(node: any, options?: GetVariableDeclarationIdentifiersOptions): IterableIterator< string ></summary>

Extracts all variable identifiers from a declaration.

```js
const [foo, bar] = [1, 2];
```

will return `"foo"` then `"bar"`.

</details>

## License

MIT
