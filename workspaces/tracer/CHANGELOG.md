# @nodesecure/tracer

## 2.0.0

### Major Changes

- [#366](https://github.com/NodeSecure/js-x-ray/pull/366) [`cf2b5eb`](https://github.com/NodeSecure/js-x-ray/commit/cf2b5eb3b247f60d369740630a019928e6c8d7c2) Thanks [@fraxken](https://github.com/fraxken)! - Refactor relation and dependency to Tracer for estree-ast-utils workspace

### Patch Changes

- [#356](https://github.com/NodeSecure/js-x-ray/pull/356) [`c3016e0`](https://github.com/NodeSecure/js-x-ray/commit/c3016e0b5266178ad88b65c6fcca4c0a2ddb71b1) Thanks [@fraxken](https://github.com/fraxken)! - Trace Node.js core imports that use /promises

  Here is an example:

  ```ts
  import { readFile } from "fs/promises";

  const foobar = readFile;
  await foobar("test.txt");
  ```

- Updated dependencies [[`cf2b5eb`](https://github.com/NodeSecure/js-x-ray/commit/cf2b5eb3b247f60d369740630a019928e6c8d7c2), [`8b72326`](https://github.com/NodeSecure/js-x-ray/commit/8b723266a4153e9e05395f06e70e74cab2544eed)]:
  - @nodesecure/estree-ast-utils@4.0.0

## 1.0.1

### Patch Changes

- Updated dependencies [[`d38f809`](https://github.com/NodeSecure/js-x-ray/commit/d38f809aaf4963a0274f7f8355aebc78ccdfaa13)]:
  - @nodesecure/estree-ast-utils@3.0.0
