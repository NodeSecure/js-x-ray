# Unsafe spawn

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| unsafe-spwan | `Warning` | `sast_warnings.unsafe_spawn` | ✅ | 

## Introduction

This warning identifies potentially dangerous use of the `spawn()` function from the `child_process` module. 
Spawning system-level commands can introduce security risks, especially if user-controlled input is involved or if the 
command itself is sensitive (e.g., tools that query or change system configurations).

> [!NOTE]
> This rule is experimental. The list of suspicious commands is not exhaustive and will evolve over time.

## Example

```js
const { spawn } = require("child_process");
spawn("csrutil", ["status"]);
```
