# Unsafe VM Context

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| unsafe-vm-context | `Warning` | `sast_warnings.unsafe_vm_context` | ❌ |

## Introduction

Detects potentially dangerous use of `vm.runInNewContext()` and `(vm.Script(code,options)).runInContext` from the vm module. Despite appearing to provide an isolated execution environment, this API does not constitute a real security sandbox and should be considered as dangerous as a command injection vulnerability. It only separates JavaScript global scopes while sharing the same underlying V8 heap. Any code executed through it can escape the context via prototype chain traversal and gain full access to the host process.

## Example

```js
import vm from "vm";

const userInput = req.body.expression;
const result = vm.runInNewContext(userInput, { x: 10, y: 20 });

const context = {
  animal: 'cat',
  count: 2,
};

const script = new vm.Script(userInput);

vm.createContext(context);

script.runInContext(context);
```

## References
- [Defending Against Code Injection Vulnerabilities](https://www.nodejs-security.com/book/code-injection)
