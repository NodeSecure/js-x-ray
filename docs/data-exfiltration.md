# Data Exfiltration

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| data-exfiltration | `Warning` | `sast_warnings.data_exfiltration` | ❌ | 

## Introduction

Detects potential data exfiltration patterns where sensitive system information is being serialized, which could indicate unauthorized collection of system data for external transmission. This probe identifies when sensitive methods from Node.js core modules are combined with `JSON.stringify()`, a common pattern in malicious packages.

## Detection Behavior

The probe has different detection modes depending on the sensitivity level:

### Conservative Mode (default)
Detects serialization of sensitive system information using `JSON.stringify()` combined with:
- `os.userInfo()` - User account information
- `os.networkInterfaces()` - Network configuration
- `os.cpus()` - CPU information
- `dns.getServers()` - DNS server configuration

### Aggressive Mode
In addition to the conservative mode detections, also flags:
- Any import of `os` or `dns` modules

## Examples

```js
// Detected only in aggressive mode: Importing sensitive modules
import os from "os";
import dns from "dns";

// Detected in conservative mode: Serializing sensitive data
JSON.stringify(os.userInfo());
JSON.stringify(os.networkInterfaces());
JSON.stringify(os.cpus());
JSON.stringify(dns.getServers());
```
