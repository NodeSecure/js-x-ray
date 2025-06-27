# Perf 

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| perf | `Warning` | `sast_warnings.perf` | ✔️ |

## Introduction

An **experimental** warning capable of detecting potential performance issues.

Such as of the synchronous API from Node.js core such as `fs` or `child_process` that can freeze the event loop. 

[Node.js - Overview of Blocking vs Non-Blocking](https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking)

## Example

```js
import fs from 'fs';

const data = fs.readFileSync('/foo.txt'); 
```