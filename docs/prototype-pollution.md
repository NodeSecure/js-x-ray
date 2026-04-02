# Prototype Pollution

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| prototype-pollution | `Warning` | `sast_warnings.prototype_pollution` | ❌ |

## Introduction

Prototype pollution is an attack technique in which an adversary manipulates an object's `__proto__` property to inject or override inherited properties on all objects of that type. Because JavaScript objects share a prototype chain, a successful pollution can affect any code that reads from those inherited properties — enabling unexpected behavior, authentication bypasses, or even remote code execution in some server-side scenarios.

JS-X-Ray raises a `prototype-pollution` warning when it detects:

- **Direct `__proto__` property access** — e.g. `obj.__proto__.foo = "bar"`
- **Computed `__proto__` property access** — e.g. `obj["__proto__"].foo = "bar"`
- **The `"__proto__"` string literal** — e.g. `const key = "__proto__"`, which may later be used as a dynamic key

## Examples

```js
// Direct property access — pollutes every object's prototype
const obj = {};
obj.__proto__.polluted = true;
console.log({}.polluted); // true

// Computed property access — equivalent attack, just harder to spot
const payload = {};
payload["__proto__"].isAdmin = true;

// String literal — the key will be tracked as a potential pollution vector
const key = "__proto__";
const target = {};
target[key] = { isAdmin: true };
```

## Resources

- [OWASP Prototype Pollution](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-Side_Testing/10-Testing_for_Client-Side_Template_Injection)
- [Prototype Pollution — Portswigger](https://portswigger.net/web-security/prototype-pollution)
- [HackerOne — Prototype Pollution in lodash](https://hackerone.com/reports/310443)
