# Synchronous IO

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| synchronous-io | `Warning` | `sast_warnings.synchronous-io` | ✔️ |

## Introduction

A warning capable of detecting potential performance issues linked to the usage of synchronous APIs from Node.js core modules such as `fs`, `crypto`, `child_process`, and `zlib` that can block the event loop.

Synchronous operations freeze the event loop, preventing Node.js from processing other tasks until the operation completes. This can significantly degrade application performance and responsiveness, especially in server environments.

[Node.js - Overview of Blocking vs Non-Blocking](https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking)

### Detected APIs

This probe detects the following synchronous Node.js APIs:

- `fs.readFileSync()`
- `fs.writeFileSync()`
- `fs.appendFileSync()`
- `fs.readSync()`
- `fs.writeSync()`
- `fs.readdirSync()`
- `fs.statSync()`
- `fs.mkdirSync()`
- `fs.renameSync()`
- `fs.unlinkSync()`
- `fs.symlinkSync()`
- `fs.openSync()`
- `fs.fstatSync()`
- `fs.linkSync()`
- `fs.realpathSync()`
- `crypto.pbkdf2Sync()`
- `crypto.scryptSync()`
- `crypto.generateKeyPairSync()`
- `crypto.generateKeySync`
- `crypto.hkdfSync`
- `crypto.randomFillSync`
- `crypto.checkPrimeSync`
- `crypto.argon2Sync`
- `child_process.execSync()`
- `child_process.spawnSync()`
- `child_process.execFileSync()`
- `zlib.deflateSync()`
- `zlib.inflateSync()`
- `zlib.gzipSync()`
- `zlib.gunzipSync()`
- `zlib.brotliCompressSync()`
- `zlib.brotliDecompressSync()`

## Example

```js
import fs from 'fs';

const data = fs.readFileSync('/foo.txt'); 
```

## Recommendations

- Use asynchronous / promises-based APIs (e.g., `fs.promises.readFile()`)
- Reserve synchronous APIs for startup/initialization code only
