# Serialize Environment Warning

## Introduction

This warning is triggered when the code attempts to serialize the entire Node.js `process.env` object using `JSON.stringify()`. This is a potential security risk as it could be used to exfiltrate sensitive environment variables.

## Examples

```js
// Direct serialization of process.env
const envData = JSON.stringify(process.env);

// Using bracket notation
const envData = JSON.stringify(process["env"]);

// Using single quotes
const envData = JSON.stringify(process['env']);

// Using template literals
const envData = JSON.stringify(process[`env`]);
```
## References

- [Malicious Packages: A Growing Threat to the Software Supply Chain](https://www.mend.io/wp-content/uploads/2024/07/malicious-packages-a-growing-threat-to-the-software-supply-chain-mendio-darkreading-1.pdf)
- [GuardDog npm-serialize-environment rule](https://github.com/DataDog/guarddog/blob/main/guarddog/analyzer/sourcecode/npm-serialize-environment.yml)
