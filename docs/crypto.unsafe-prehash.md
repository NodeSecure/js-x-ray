# Unsafe prehash

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| crypto.unsafe-prehash | `Warning` | `sast_warnings.unsafe_prehash` | :white_check_mark: |

## Introduction

Detect **unsafe password pre-hashing** before passing the result to [`bcryptjs`](https://www.npmjs.com/package/bcryptjs)'s `bcrypt.hash()` / `bcrypt.hashSync()`.

Only `bcryptjs` is covered, not the `bcrypt` package. It gets roughly 2x `bcrypt`'s weekly npm downloads. Extending this probe to also cover `bcrypt` is a separate work.

Pre-hashing a password by passing the raw digest `Buffer` directly can be dangerous: bcrypt treats its input as a null-terminated string, so a digest containing a `0x00` byte gets silently truncated at that byte, increasing the chance of hash collisions.

This probe flags `bcrypt.hash()` / `bcrypt.hashSync()` calls (from `bcryptjs`) whose first argument is a `digest(encoding)` or `.digest().toString(encoding)` call that does not use a null-byte-free encoding (base64, base64url or hex).

The probe also follows the common pattern of computing the digest first and passing it to bcrypt by reference.

## How detection works

`bcryptjs` is tracked through the codebase's shared `VariableTracer`, so all the common import forms are recognized:

```js
import bcrypt from "bcryptjs";        
import * as bcrypt from "bcryptjs";   
import { hash } from "bcryptjs";      
// except this one: not recognized
import { hash as bcryptHash } from "bcryptjs"; 
```


## Example

```js
import bcrypt from "bcryptjs";
import crypto from "crypto";

// unsafe: raw digest Buffer may contain a null byte
bcrypt.hash(crypto.createHash("sha256").update(password).digest(), salt, callback);

// unsafe: same issue, written as digest().toString(...)
bcrypt.hash(crypto.createHash("sha256").update(password).digest().toString("binary"), salt, callback);

// unsafe: same issue, with the digest stored in a variable first
const prehashed = crypto.createHash("sha256").update(password).digest();
bcrypt.hash(prehashed, salt, callback);

// safe: base64 output never contains a null byte
bcrypt.hash(crypto.createHash("sha256").update(password).digest("base64"), salt, callback);

// safe: digest() already returned a safely-encoded hex string
bcrypt.hash(crypto.createHash("sha256").update(password).digest("hex").toString("binary"), salt, callback);
```

## Limitations

This probe is purely name-based and has no lexical scope resolution. Several consequences:

- **The `bcrypt` package is not detected at all.**

- **Renamed named imports aren't recognized.** This is a separate, `VariableTracer` limitation.

  ```js
  // not detected: aliased via "as", the local binding "bcryptHash" isn't tracked
  import { hash as bcryptHash } from "bcryptjs";
  bcryptHash(crypto.createHash("sha256").update(password).digest(), salt, callback);
  ```

- **Variable indirection only works one level deep, in source order.** The variable must be declared with `const`/`let`/`var` and an initializer earlier in the same file. 
Reassignment, destructuring, function parameters, or a digest returned from a helper function are not tracked:

  ```js
  // not detected: the digest only reaches bcrypt through a function parameter
  function hashPassword(prehashed) {
    bcrypt.hash(prehashed, salt, callback);
  }
  hashPassword(crypto.createHash("sha256").update(password).digest());
  ```

- **Matching is by identifier name only, not by binding/scope, with two safeguards.** A name is excluded from matching if it's ever used as a function/arrow parameter anywhere in the file, *or* if it's declared by more than one `VariableDeclarator` anywhere in the file (a sign that two unrelated bindings happen to share a name). Together these cover the common collision shapes:

  ```js
  function foo() {
    const prehashed = crypto.createHash("sha256").update(password).digest(); // unsafe, name "prehashed" is remembered
  }

  function bar(prehashed) { // excluded: "prehashed" is used as a parameter name elsewhere
    bcrypt.hash(prehashed, salt, callback); // not flagged
  }

  function baz() {
    const prehashed = someUnrelatedSafeValue(); // excluded: "prehashed" is declared more than once in the file
    bcrypt.hash(prehashed, salt, callback); // not flagged
  }
  ```

## References

- [OWASP Password Storage Cheat Sheet — Pre-Hashing Passwords with bcrypt](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pre-hashing-passwords-with-bcrypt)
