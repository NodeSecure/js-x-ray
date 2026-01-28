# Log Usage

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| log-usage | `Information` | `sast_warnings.log_usage` | ❌ | 

## Introduction

Detects usage of console logging methods in the code. This warning helps identify logging statements that may expose sensitive information in production environments or clutter the console output.

The probe tracks the following console methods:
- `console.log()`
- `console.info()`
- `console.warn()`
- `console.error()`
- `console.debug()`

## Example

```js
console.log(process.env);
console.info("...");
console.warn("...");
console.error("...");
console.debug("...");
```
