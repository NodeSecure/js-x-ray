# Synchronous IO

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| synchronous-io | `Warning` | `sast_warnings.synchronous-io` | ✔️ |

## Introduction

An **experimental** warning capable of detecting potential performance issues linked to the usage of the synchronous API from Node.js core such as `fs` or `child_process` that can freeze the event loop. 

[Node.js - Overview of Blocking vs Non-Blocking](https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking)

## Example

```js
import fs from 'fs';

const data = fs.readFileSync('/foo.txt'); 
```