# Weak bcrypt

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| weak-bcrypt | `Warning` | `sast_warnings.weak_bcrypt` | :white_check_mark: |

## Introduction

Detect usage of **weak bcrypt** parameters with the `bcryptjs` npm package. This probe checks for:

- **low-cost**: the work factor (rounds) passed to `hash`, `hashSync`, `genSalt`, or `genSaltSync` is below the [OWASP minimum recommendation](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#bcrypt) of **10**.
- **hardcoded-salt**: a salt is supplied as a hardcoded string literal instead of being randomly generated.

> **NOTE**
> This warning is **optional** and must be explicitly enabled via the `optionalWarnings` option.

> **NOTE**
> Only the `bcryptjs` package is supported. The older `bcrypt` (native binding) package is not tracked.

## Example

```js
import bcrypt from "bcryptjs";

// low-cost: rounds (8) is below the OWASP minimum of 10
bcrypt.hash(password, 8, (err, hash) => {});

// low-cost: rounds (4) is too low
const hash = bcrypt.hashSync(password, 4);

// low-cost: generating a salt with fewer than 10 rounds
bcrypt.genSalt(8, (err, salt) => {});

// hardcoded-salt: salt should be randomly generated, not a string literal
bcrypt.hash(password, "$2b$10$N9qo8uLOickgx2ZMRZoMye", (err, hash) => {});
```

## Usage

```js
import { AstAnalyser } from "@nodesecure/js-x-ray";

const { warnings } = new AstAnalyser({
  optionalWarnings: ["weak-bcrypt"]
}).analyse(source);
```

## Safe alternatives

```js
import bcrypt from "bcryptjs";

// Use at least 10 rounds
const hash = await bcrypt.hash(password, 12);

// Or generate a random salt with sufficient rounds
const salt = await bcrypt.genSalt(12);
const hash = await bcrypt.hash(password, salt);
```
