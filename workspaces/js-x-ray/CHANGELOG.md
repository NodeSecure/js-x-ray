# @nodesecure/js-x-ray

## 9.1.0

### Minor Changes

- [#363](https://github.com/NodeSecure/js-x-ray/pull/363) [`e37384c`](https://github.com/NodeSecure/js-x-ray/commit/e37384c216a191a14dde19954c281a39512d5485) Thanks [@intincrab](https://github.com/intincrab)! - feat(probes): add serialize-environment warning detection

  Add new probe to detect potential environment variable exfiltration through `JSON.stringify(process.env)`.

- [#362](https://github.com/NodeSecure/js-x-ray/pull/362) [`5f78d4a`](https://github.com/NodeSecure/js-x-ray/commit/5f78d4a7bb19390b6d31892994339c193bf048cf) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(probes): add initialize

- [#366](https://github.com/NodeSecure/js-x-ray/pull/366) [`cf2b5eb`](https://github.com/NodeSecure/js-x-ray/commit/cf2b5eb3b247f60d369740630a019928e6c8d7c2) Thanks [@fraxken](https://github.com/fraxken)! - Refactor relation and dependency to Tracer for estree-ast-utils workspace

### Patch Changes

- Updated dependencies [[`cf2b5eb`](https://github.com/NodeSecure/js-x-ray/commit/cf2b5eb3b247f60d369740630a019928e6c8d7c2), [`8b72326`](https://github.com/NodeSecure/js-x-ray/commit/8b723266a4153e9e05395f06e70e74cab2544eed), [`c3016e0`](https://github.com/NodeSecure/js-x-ray/commit/c3016e0b5266178ad88b65c6fcca4c0a2ddb71b1)]:
  - @nodesecure/estree-ast-utils@4.0.0
  - @nodesecure/tracer@2.0.0
