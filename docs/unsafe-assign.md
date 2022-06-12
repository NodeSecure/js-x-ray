# Unsafe Assignment

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| unsafe-assign | `Warning` | `sast_warnings.unsafe_assign` | ❌ | 

## Introduction

The SAST scanner traces the assignment of several global variables considered to be dangerous. They can often be used for malicious purposes and hide information from tools like ours.

On Node.js we track the use of `require` and `process` (and particulary things like `process.mainModule.require`). With the example below the analysis will still be able to trace the use of require:

```js
const b = process;
const c = b.mainModule;
c.require("http");
```

> **Note** We may remove this warning in future release (it generate to much noise for almost no additional value).
