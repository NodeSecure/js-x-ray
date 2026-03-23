# Weak scrypt

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| weak-scrypt | `Warning` | `sast_warnings.weak_scrypt` | :x: |

## Introduction

Detect usage of **weak scrypt** parameters with the Node.js core `crypto.scrypt()` function. This probe checks for:

- **low-cost**: scrypt parameters (cost, blockSize, parallelization) that do not meet [OWASP minimum recommendations](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt).
- **short-salt**: salt is a hardcoded string literal shorter than 16 characters.
- **hardcoded-salt**: salt is a hardcoded string literal (should be randomly generated).

## Example

```js
import crypto from "crypto";

// low-cost: default parameters (N=16384, r=8, p=1) are below OWASP minimum
crypto.scrypt("password", salt, 64, (err, derivedKey) => {});

// short-salt: salt is too short
crypto.scrypt("password", "short", 64, (err, derivedKey) => {});

// hardcoded-salt: salt should be randomly generated
crypto.scrypt("password", "a]Zz4M]rP7:L<Mwb", 64, (err, derivedKey) => {});
```
