# Weak PBKDF2

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| crypto.weak-pbkdf2 | `Warning` | `sast_warnings.weak_pbkdf2` | :white_check_mark: |

## Introduction

Detect usage of **weak PBKDF2** parameters with the Node.js core `crypto.pbkdf2()` and `crypto.pbkdf2Sync()` functions.
Checks for:

- **low-iterations**: the `iterations` count is below the [OWASP recommended minimum](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2) for the digest in use (1,300,000 for SHA-1, 600,000 for SHA-256, 210,000 for SHA-512).
- **short-salt**: salt is a hardcoded string shorter than 16 bytes.
- **hardcoded-salt**: salt is a hardcoded string (should be randomly generated).

## Parameters

OWASP recommends 1,300,000 iterations for PBKDF2-HMAC-SHA-1, 600,000 iterations for PBKDF2-HMAC-SHA-256 and 210,000 iterations for PBKDF2-HMAC-SHA-512. A call is reported when its iteration count is below the minimum for the resolved digest.

| Digest | Minimum iterations |
| --- | --- |
| `sha1` | 1,300,000 |
| `sha256` | 600,000 |
| `sha512` | 210,000 |
| unknown (not statically resolvable) | 210,000 |

Digest names are matched case-insensitively, the way Node.js and OpenSSL accept them (`SHA256`, `Sha256`, ...).

An unresolvable digest only lowers the bar to the strictest unambiguous floor: counts below 210,000 are weak for every digest, so only those are reported.

## Resolving values

The `salt`, `iterations` and `digest` may be written inline or held in a variable. Identifiers assigned a literal are followed through the `VariableTracer`, so both forms below are reported.

```js
crypto.pbkdf2(password, salt, 1000, 64, "sha512", callback);

const iterations = 1000;
crypto.pbkdf2(password, salt, iterations, 64, "sha512", callback);
```

Anything that cannot be read statically — an iteration count computed at runtime, for example — is left alone rather than reported on a value that is unknown.

## Example

```js
import crypto from "crypto";

// low-iterations — 1,000 is far below the OWASP minimum of 210,000 for SHA-512
crypto.pbkdf2(password, salt, 1000, 64, "sha512", (err, key) => {});

// low-iterations, short-salt — weak count and a hardcoded short salt
crypto.pbkdf2Sync(password, "abc", 1000, 64, "sha512");

// hardcoded-salt — the salt must be randomly generated per password
crypto.pbkdf2(password, "this-is-a-long-hardcoded-salt", 210000, 64, "sha512", (err, key) => {});
```

The following call is not reported.

```js
crypto.pbkdf2(password, crypto.randomBytes(16), 210000, 64, "sha512", (err, key) => {});
```
