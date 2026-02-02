# @nodesecure/tracer

## 4.0.0

### Major Changes

- [#501](https://github.com/NodeSecure/js-x-ray/pull/501) [`1c2c39f`](https://github.com/NodeSecure/js-x-ray/commit/1c2c39fecc9a584e8788507a822023d10bd87c7c) Thanks [@clemgbld](https://github.com/clemgbld)! - feat: detect identifier sql-injection

### Patch Changes

- Updated dependencies [[`1c2c39f`](https://github.com/NodeSecure/js-x-ray/commit/1c2c39fecc9a584e8788507a822023d10bd87c7c)]:
  - @nodesecure/estree-ast-utils@4.3.0

## 3.1.0

### Minor Changes

- [#471](https://github.com/NodeSecure/js-x-ray/pull/471) [`e288c04`](https://github.com/NodeSecure/js-x-ray/commit/e288c045fe24f58b4344350a23d9b2d2b7f1b824) Thanks [@clemgbld](https://github.com/clemgbld)! - feat: generate data-exfiltration warning on import when the sensitivity is aggressive

## 3.0.0

### Major Changes

- [#383](https://github.com/NodeSecure/js-x-ray/pull/383) [`09c3575`](https://github.com/NodeSecure/js-x-ray/commit/09c357550ba0bcf6642c73fde8ea9d8a039caf45) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(tracer): support tracking function return values

### Minor Changes

- [#385](https://github.com/NodeSecure/js-x-ray/pull/385) [`91031f8`](https://github.com/NodeSecure/js-x-ray/commit/91031f84c7962474822640017d227d5bb31282dc) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(tracer): add follow consecutive assignment of return values

- [#390](https://github.com/NodeSecure/js-x-ray/pull/390) [`7927535`](https://github.com/NodeSecure/js-x-ray/commit/7927535396dc6bc50f100d153188fc16c5367237) Thanks [@fraxken](https://github.com/fraxken)! - Refactor global id prefix removal by implementing a new generic Util function

- [#391](https://github.com/NodeSecure/js-x-ray/pull/391) [`facb858`](https://github.com/NodeSecure/js-x-ray/commit/facb8581e8ebfe9082a8566647e1858bf40a8958) Thanks [@fraxken](https://github.com/fraxken)! - Enhance docs, types and syntax

### Patch Changes

- Updated dependencies [[`53b25a4`](https://github.com/NodeSecure/js-x-ray/commit/53b25a485fed51776c673b4e86de907faa25989e)]:
  - @nodesecure/estree-ast-utils@4.2.0

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
