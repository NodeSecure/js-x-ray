# Password shucking

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| crypto.password-shucking | `Warning` | `sast_warnings.password_shucking` | :white_check_mark: |

## Introduction

Detect **password shucking** — using a plain cryptographic hash (`crypto.createHash`) to pre-hash a password before passing it to [`bcryptjs`](https://www.npmjs.com/package/bcryptjs)'s `bcrypt.hash()` / `bcrypt.hashSync()`.

Only `bcryptjs` is covered. Extending this probe to also cover the `bcrypt` native package is a separate work.

## What is password shucking?

Password shucking exploits the mathematical equivalence:

```
bcrypt(base64(H(password)), salt, cost) == bcrypt(base64(leaked_hash), salt, cost)
```

If the inner hash function `H` (e.g. SHA-512) is deterministic and keyless, an attacker who obtains a bcrypt hash can reduce cracking to simply breaking `H`. Testing a dictionary entry costs only one SHA-512 invocation, not a full bcrypt operation. The effective security is identical to storing a raw SHA-512 hash. bcrypt's cost factor provides no additional protection.

The attack requires a known leaked hash. Using a **pepper** via `crypto.createHmac` prevents shucking because the key is unknown to the attacker.

See [OWASP Password Storage Cheat Sheet — bcrypt](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#bcrypt).

## What is detected

A `crypto.createHash` digest passed as the first argument to `bcryptjs.hash` or `bcryptjs.hashSync`, either inline or via a variable, regardless of the digest encoding, since shuckability is encoding-independent.

`crypto.createHmac` (HMAC with a pepper) is **not** flagged; it is the OWASP-recommended mitigation.

## Examples

```js
import bcrypt from "bcryptjs";
import crypto from "crypto";

// shucking: SHA-512 pre-hash is as weak as a raw SHA-512 hash
bcrypt.hash(crypto.createHash("sha512").update(password).digest("base64"), salt, callback);

// shucking: encoding does not matter, hex is still shuckable
bcrypt.hash(crypto.createHash("sha512").update(password).digest("hex"), salt, callback);

// shucking: same issue when the digest is stored in a variable first
const prehashed = crypto.createHash("sha512").update(password).digest("hex");
bcrypt.hash(prehashed, salt, callback);

// safe: HMAC with a pepper, the OWASP-recommended pattern
bcrypt.hash(crypto.createHmac("sha512", pepper).update(password).digest("base64"), salt, callback);

// safe: no pre-hashing at all
bcrypt.hash(password, salt, callback);
```

## Limitations

- **The `bcrypt` package is not detected.** Only `bcryptjs` is supported.

- **Renamed named imports aren't recognized.** This is a `VariableTracer` limitation.

  ```js
  // not detected: aliased via "as"
  import { hash as bcryptHash } from "bcryptjs";
  bcryptHash(crypto.createHash("sha512").update(password).digest(), salt, callback);
  ```

## Relationship to `crypto.unsafe-prehash`

Both probes target `bcryptjs` pre-hashing, but detect different vulnerabilities:

| | `crypto.unsafe-prehash` | `crypto.password-shucking` |
|---|---|---|
| Trigger | Unsafe encoding (null-byte truncation risk) | Any `createHash` digest (shuckable regardless of encoding) |
| `digest('hex')` → bcrypt | Not flagged (safe encoding) | Flagged (still shuckable) |
| `createHmac` chains | Flagged (if unsafe encoding) | Not flagged (OWASP-safe pattern) |
