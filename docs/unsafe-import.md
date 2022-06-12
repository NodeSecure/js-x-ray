# Unsafe Import

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| unsafe-import | `Warning` | `sast_warnings.unsafe_import` | ❌ | 

## Introduction

On JS-X-Ray we intensively track the use of `require` CallExpression and also ESM Import declarations. Knowing the dependencies used is really important for our analysis and that why when the SAST fail to follow an important it will throw an `unsafe-import` warning.

> **Note** Sometimes we trigger this warning on purpose because we have detected a malicious import

### CJS Note
We analyze and trace several ways to require in Node.js (with CJS):
- require
- require.main.require
- require.mainModule.require
- require.resolve

## Example

The code below try to require Node.js core dependency `http`. JS-X-Ray sucessfully detect it and throw an `unsafe-import` warning.

```js
function unhex(r) {
   return Buffer.from(r, "hex").toString();
}

const g = Function("return this")();
const p = g["pro" + "cess"];

// Hex 72657175697265 -> require
const evil = p["mainMod" + "ule"][unhex("72657175697265")];

// Hex 68747470 -> http
evil(unhex("68747470")).request
```

