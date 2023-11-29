# Parsing Error

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| ast-error | `Information` | `sast_warnings.ast_error` | ❌ | 

## Introduction

<kbd>parsing-error</kbd> warning is throw when the library [meriyah](https://github.com/meriyah/meriyah) **fail to parse** the javascript source code into an AST. But it can also happen when the AST analysis fails because we don't manage a case properly.

> [!IMPORTANT]
> If you are in the second case, please open an issue [here](https://github.com/NodeSecure/js-x-ray/issues)

## Example

```json
{
  "kind": "parsing-error",
  "value": "[10:30]: Unexpected token: ','",
  "location": [[0,0],[0,0]],
  "file": "helpers\\asyncIterator.js"
}
```
