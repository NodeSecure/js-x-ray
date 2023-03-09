# Shady link
| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| shady-link | `Warning` | `sast_warnings.shady_link` | ✔️ | 

## Introduction

Identify when a Literal (string) contains an URL to a domain with a suspicious extension.

> **Note** credit goes to the [guarddog](https://github.dev/DataDog/guarddog) team.

## Example

```js
const foo = "http://foo.xyz";
```
