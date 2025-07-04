# @nodesecure/js-x-ray

## 9.2.0

### Minor Changes

- [#369](https://github.com/NodeSecure/js-x-ray/pull/369) [`644232a`](https://github.com/NodeSecure/js-x-ray/commit/644232a76abbd4fcc75421ebfbb1092abe0d4ca1) Thanks [@clemgbld](https://github.com/clemgbld)! - refactor(probe/isSerializeEnv): trace re-assignment of JSON.stringy & process.env

### Patch Changes

- [#375](https://github.com/NodeSecure/js-x-ray/pull/375) [`20181e7`](https://github.com/NodeSecure/js-x-ray/commit/20181e77479a7f623100c6b5568148356bbc2625) Thanks [@PierreDemailly](https://github.com/PierreDemailly)! - Update files to includes /dist folder

- Updated dependencies [[`19f9822`](https://github.com/NodeSecure/js-x-ray/commit/19f9822fb74ea6de9d2978106a719ce93dcbb918)]:
  - @nodesecure/estree-ast-utils@4.1.0

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
