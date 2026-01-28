# Unsafe Command

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| unsafe-command | `Warning` | `sast_warnings.unsafe_command` | ✅ |

## Introduction

Detects potentially dangerous use of child process execution functions from the `child_process` module. Spawning system-level commands can introduce security risks, especially if user-controlled input is involved or if the command itself is sensitive (e.g., tools that query or change system configurations).

> [!NOTE]
> This rule is experimental. The list of suspicious commands is not exhaustive and will evolve over time.

## Detection Behavior

The probe has different detection modes depending on the sensitivity level:

### Conservative Mode (default)
Detects usage of specific unsafe commands:
- `csrutil` - System Integrity Protection configuration
- `uname` - System information
- `ping` - Network connectivity testing
- `curl` - HTTP requests and downloads

### Aggressive Mode
Flags **any** usage of `child_process` execution methods, regardless of the command.

## Detected APIs

The probe monitors the following `child_process` methods:

- `child_process.spawn()`
- `child_process.spawnSync()`
- `child_process.exec()`
- `child_process.execSync()`

## Examples

```js
import { spawn, exec } from "child_process";

// Detected in conservative mode: Known unsafe commands
spawn("csrutil", ["status"]);
spawn("uname", ["-a"]);
exec("ping google.com");
exec("curl https://malicious.com");

// Detected only in aggressive mode: Any command
spawn("ls", ["-la"]);
exec("echo hello");
```

## References
- [Defending Against Command Injection Vulnerabilities](https://www.nodejs-security.com/book/command-injection)
