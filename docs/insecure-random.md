# Insecure random

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| insecure-random | `Information` | `sast_warnings.insecure_random` | ❌ | 

## Introduction

Identify usage of the **insecure random** number generator `Math.random()`. `Math.random()` is not cryptographically secure and should not be used for security-sensitive operations like token generation, password salt, etc.

It is recommended to use `crypto.randomBytes()` or `crypto.getRandomValues()` instead.

## Example

```js
const token = Math.random().toString(36).substring(2);
```
