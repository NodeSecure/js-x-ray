# Weak Argon2

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| crypto.weak-argon2 | `Warning` | `sast_warnings.weak_argon2` | :white_check_mark: |

## Introduction

Detect usage of **weak Argon2** parameters with the Node.js core `crypto.argon2()` and `crypto.argon2Sync()` functions.
Checks for:

- **weak-algorithm: `<variant>`**: the `argon2d` variant, which is data-dependent and not intended for password hashing.
- **low-params: `memory` | `passes`**: `memory` and `passes` that do not meet [OWASP recommended combinations](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id). The reported name is the parameter that has to change.
- **short-nonce**: nonce is a hardcoded string shorter than 16 characters.
- **hardcoded-nonce**: nonce is a hardcoded string (should be randomly generated).

> [!NOTE]
> Argon2 calls the salt a **nonce**, and so does the Node.js API. The warning values follow that
> naming so they match what the analysed source code actually writes.

## Variants

[RFC 9106 section 1](https://www.rfc-editor.org/rfc/rfc9106.html#section-1) describes `argon2d` as *"suitable for cryptocurrencies and proof-of-work applications with no threats from side-channel timing attacks"*, and `argon2i` as using data-independent memory access *"which is preferred for password hashing and password-based key derivation"*. [Section 4](https://www.rfc-editor.org/rfc/rfc9106.html#section-4) adds that if you do not know the difference between the types, you should choose `argon2id`.

| Variant | Verdict |
| --- | --- |
| `argon2d` | Always reported. Data-dependent memory access leaks information through side channels. |
| `argon2i` | Accepted, but restricted to `passes >= 3` (see below). |
| `argon2id` | Accepted. |

## Parameters

OWASP publishes five configurations that provide an equal level of defense, trading CPU against RAM. A call is reported when its `memory` and `passes` satisfy none of them.

| memory (KiB) | passes | |
| --- | --- | --- |
| 47104 (46 MiB) | 1 | Do not use with Argon2i |
| 19456 (19 MiB) | 2 | Do not use with Argon2i |
| 12288 (12 MiB) | 3 | |
| 9216 (9 MiB) | 4 | |
| 7168 (7 MiB) | 5 | |

Argon2i is data-independent and therefore weaker against time-memory trade-off attacks, which additional passes mitigate — see [RFC 9106 section 7.3](https://www.rfc-editor.org/rfc/rfc9106.html#section-7.3). The two lowest-pass rows are consequently unavailable to it, so `argon2i` with `passes` below 3 is reported regardless of how much memory is allocated.

`parallelism` is not checked: raising it does not reduce the total memory cost, so it is not a weakness on its own.

## Resolving values

The algorithm, `memory`, `passes` and `nonce` may be written inline or held in a variable. Identifiers assigned a literal are followed through the `VariableTracer`, so both forms below are reported.

```js
crypto.argon2("argon2d", options, callback);

const algorithm = "argon2d";
crypto.argon2(algorithm, options, callback);
```

Anything that cannot be read statically — a value computed at runtime, a key computed from a variable, an options object spread from elsewhere — is left alone rather than reported on a value that is unknown.

## Example

```js
import crypto from "crypto";

// weak-algorithm: argon2d — not intended for password hashing
crypto.argon2("argon2d", {
  message: password,
  nonce: crypto.randomBytes(16),
  parallelism: 1,
  tagLength: 32,
  memory: 19456,
  passes: 2
}, (err, tag) => {});

// low-params: memory — 8 KiB is far below the lowest OWASP row (7168 KiB)
crypto.argon2("argon2id", {
  message: password,
  nonce: crypto.randomBytes(16),
  parallelism: 1,
  tagLength: 32,
  memory: 8,
  passes: 1
}, (err, tag) => {});

// low-params: passes — argon2i cannot use the passes=2 row
crypto.argon2("argon2i", {
  message: password,
  nonce: crypto.randomBytes(16),
  parallelism: 1,
  tagLength: 32,
  memory: 19456,
  passes: 2
}, (err, tag) => {});

// hardcoded-nonce: the nonce must be randomly generated per password
crypto.argon2Sync("argon2id", {
  message: password,
  nonce: "a]Zz4M]rP7:L<Mwb",
  parallelism: 1,
  tagLength: 32,
  memory: 19456,
  passes: 2
});
```

The following call is not reported.

```js
crypto.argon2("argon2id", {
  message: password,
  nonce: crypto.randomBytes(16),
  parallelism: 1,
  tagLength: 32,
  memory: 19456,
  passes: 2
}, (err, tag) => {});
```
