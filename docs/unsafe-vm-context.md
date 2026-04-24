# Unsafe VM Context

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| unsafe-vm-context | `Warning` | `sast_warnings.unsafe_vm_context` | ❌ |

## Introduction

Detects potentially dangerous use of `vm.runInNewContext()` and `(vm.Script(code,options)).runInContext` from the vm module. Despite appearing to provide an isolated execution environment, this API does not constitute a real security sandbox and should be considered as dangerous as a command injection vulnerability. It only separates JavaScript global scopes while sharing the same underlying V8 heap. Any code executed through it can escape the context via prototype chain traversal and gain full access to the host process.

## Example

```js
import vm from "vm";

// command injection

code = 'var x = this.constructor.constructor("return process.mainModule.require(\'child_process\').execSync(\'cat /etc/passwd\',{encoding:'utf-8'})")()';

const context = {y : 1}
vm.runInNewContext(code,context);
console.log(context.x);

// environment variables leak

code = 'var x = this.constructor.constructor("return process.env")()';

const context = {y : 1}

const script = new vm.Script(code);

vm.runInContext(vm.createContext(context));
console.log(context.x);
```

## References
- [Defending Against Code Injection Vulnerabilities](https://www.nodejs-security.com/book/code-injection)
