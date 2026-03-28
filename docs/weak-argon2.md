# Weak argon2

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| weak-argon2 | `Warning` | `sast_warnings.weak_argon2` | :x: |

## Introduction

Detect usage of **weak Argon2** parameters with the Node.js core `crypto.argon2()` / `crypto.argon2Sync()` functions. This probe checks for:

- **wrong-algorithm**: using `argon2d` or `argon2i` instead of the recommended `argon2id`.
- **weak-parameters**: memory, passes, or parallelism values that do not meet [OWASP minimum recommendations](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id).
- **hardcoded-nonce**: nonce (salt) is a hardcoded string literal (should be randomly generated).

## Example

```js
import crypto from "crypto";

// wrong-algorithm: argon2d is vulnerable to side-channel attacks
crypto.argon2("argon2d", {
  message: "password",
  nonce: crypto.randomBytes(16),
  memory: 47104,
  passes: 1,
  parallelism: 1,
  tagLength: 64
});

// weak-parameters: memory and passes are below OWASP minimum
crypto.argon2("argon2id", {
  message: "password",
  nonce: crypto.randomBytes(16),
  memory: 512,
  passes: 1,
  parallelism: 1,
  tagLength: 64
});

// hardcoded-nonce: nonce should be randomly generated
crypto.argon2("argon2id", {
  message: "password",
  nonce: "hardcoded-salt",
  memory: 47104,
  passes: 1,
  parallelism: 1,
  tagLength: 64
});
```
