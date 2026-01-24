# Suspicious literal

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| suspicious-literal | `Information` | `sast_warnings.log_usage` | ❌ | 

## Introduction

An optional warning that is capable of detecting a log usage.

## Example

```js
console.log(process.env);
```
