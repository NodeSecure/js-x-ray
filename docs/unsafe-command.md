# Unsafe command

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| unsafe-command | `Warning` | `sast_warnings.unsafe_command` | ✅ |

## Introduction

This warning identifies potentially dangerous use of the `spawn()` or `exec()` function from the `child_process` module.
Spawning system-level commands can introduce security risks, especially if user-controlled input is involved or if the
command itself is sensitive (e.g., tools that query or change system configurations). This warning identifies also
commands passed to `spawnSync()` and `execSync()`.

> [!NOTE]
> This rule is experimental. The list of suspicious commands is not exhaustive and will evolve over time.

## Example

```js
const { spawn } = require("child_process");
spawn("csrutil", ["status"]);
```
