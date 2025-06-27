---
"@nodesecure/tracer": patch
---

Trace Node.js core imports that use /promises

Here is an example:
```ts
import { readFile } from "fs/promises";

const foobar = readFile;
await foobar("test.txt");
```
