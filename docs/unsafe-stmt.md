# Unsafe Statement

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| unsafe-stmt | `Warning` | `sast_warnings.unsafe_stmt` | ❌ | 

## Introduction

Warning to notify of the usage of `eval()` or `Function()` in the source code. Their use is not recommended and can be used to execute insecure code (for example to retrieve the `globalThis` / `window` object).

- [MDN - Never use eval()!](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!)

## Example

The warning **value** can be either `Function` or `eval`.

```json
{
  "kind": "unsafe-stmt",
  "location": [[49,37],[49,62]],
  "value": "Function",
  "file": "index.js"
}
```

Example of a dangerous code that an attacker may use:
```js
const xxx = Function("return this")();
// xxx is equal to globalThis
console.log(xxx);
```
