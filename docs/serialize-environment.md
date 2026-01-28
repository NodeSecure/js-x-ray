# Serialize Environment Warning

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| serialize-environment | `Warning` | `sast_warnings.serialize_environment` | ❌ | 

## Introduction

This warning is triggered when the code attempts to serialize the entire Node.js `process.env` object, potentially indicating environment variable exfiltration. Environment variables often contain sensitive information such as API keys, database credentials, authentication tokens, and other secrets.

## Detection Behavior

The probe has different detection modes depending on the sensitivity level:

### Conservative Mode (default)
Detects only explicit serialization of `process.env`:
- `JSON.stringify(process.env)` - Direct serialization
- `JSON.stringify(process["env"])` - Bracket notation variants

### Aggressive Mode
In addition to serialization, also detects:
- Any direct `process.env` access
- Variable assignments like `const env = process.env`

## Examples

```js
// Detected in both modes: JSON.stringify
const envData = JSON.stringify(process.env);
const envData = JSON.stringify(process["env"]);
const envData = JSON.stringify(process['env']);
const envData = JSON.stringify(process[`env`]);

// Detected only in aggressive mode: direct access
const env = process.env;
console.log(process.env);
```

## References

- [Malicious Packages: A Growing Threat to the Software Supply Chain](https://www.mend.io/wp-content/uploads/2024/07/malicious-packages-a-growing-threat-to-the-software-supply-chain-mendio-darkreading-1.pdf)
- [GuardDog npm-serialize-environment rule](https://github.com/DataDog/guarddog/blob/main/guarddog/analyzer/sourcecode/npm-serialize-environment.yml)
