# Weak crypto

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| weak-crypto | `Information` | `sast_warnings.weak_crypto` | ✔️ | 

## Introduction

Detect usage of weak crypto algorithm with the Node.js core `Crypto` dependency. Algorithm considered to be weak are:

- md5
- md4
- md2
- sha1
- ripemd160

## Example

```js
import crypto from "crypto";

crypto.createHash("md5");
```
