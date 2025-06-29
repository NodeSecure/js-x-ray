# @nodesecure/tracer

## 1.0.2

### Patch Changes

- [#356](https://github.com/NodeSecure/js-x-ray/pull/356) [`c3016e0`](https://github.com/NodeSecure/js-x-ray/commit/c3016e0b5266178ad88b65c6fcca4c0a2ddb71b1) Thanks [@fraxken](https://github.com/fraxken)! - Trace Node.js core imports that use /promises

  Here is an example:

  ```ts
  import { readFile } from "fs/promises";

  const foobar = readFile;
  await foobar("test.txt");
  ```

## 1.0.1

### Patch Changes

- Updated dependencies [[`d38f809`](https://github.com/NodeSecure/js-x-ray/commit/d38f809aaf4963a0274f7f8355aebc78ccdfaa13)]:
  - @nodesecure/estree-ast-utils@3.0.0
