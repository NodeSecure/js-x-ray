# Unsafe Import

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| unsafe-regex | `Warning` | `sast_warnings.unsafe_regex` | ❌ | 

## Introduction

This warning has been designed to detect and report any regular expressions (regexes) that could lead to a catastrophic backtracking.  This can be used by an attacker to drastically reduce the performance of your application. We often call this kind of attack REDOS.

Learn more:
- [How a RegEx can bring your Node.js service down](https://lirantal.medium.com/node-js-pitfalls-how-a-regex-can-bring-your-system-down-cbf1dc6c4e02)
- [An additional non-backtracking RegExp engine](https://v8.dev/blog/non-backtracking-regexp)
- [The Impact of Regular Expression Denial of Service (ReDoS) in Practice](https://infosecwriteups.com/introduction-987fdc4c7b0)
- [Why Aren’t Regexes a Lingua Franca?](https://davisjam.medium.com/why-arent-regexes-a-lingua-franca-esecfse19-a36348df3a2)
- [Comparing regex matching algorithms](https://swtch.com/~rsc/regexp/regexp1.html)

> **Note** credit goes to the `safe-regex` package author for the last three resources.

### Technical implementation

Under the hood the package [safe-regex](https://github.com/davisjam/safe-regex) is used to assert all **RegExpLiteral** and RegEx Constructor (eg `new RegEx()`).

## Example

```json
{
  "kind": "unsafe-regex",
  "location": [[286,18],[286,65]],
  "value": "^node_modules\\/(@[^/]+\\/?[^/]+|[^/]+)(\\/.*)?$",
  "file": "index.js"
}
```
