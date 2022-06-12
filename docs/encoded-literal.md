# Encoded literal

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| encoded-literal | `Information` | `sast_warnings.encoded_literal` | ❌ | 

## Introduction

The SAST scanner assert all Literals in the tree and search for encoded values. JS-X-Ray currently supports three types of detection:
- Hexadecimal sequence: `'\x72\x4b\x58\x6e\x75\x65\x38\x3d'`
- Unicode sequence: `\u03B1`
- Base64 encryption: `z0PgB0O=`

Hexadecimal and Unicode sequence are tested directly on the raw Literal provided by meriyah. For base64 detection we use the npm package [is-base64](https://github.com/miguelmota/is-base64).

Example of a JavaScript implementation:
```js
const hasHexadecimalSequence = /\\x[a-fA-F0-9]{2}/g.exec(node.raw) !== null;
const hasUnicodeSequence = /\\u[a-fA-F0-9]{4}/g.exec(node.raw) !== null;
const isBase64 = isStringBase64(node.value, { allowEmpty: false });
```
