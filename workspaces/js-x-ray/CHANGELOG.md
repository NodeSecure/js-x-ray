# @nodesecure/js-x-ray

## 9.3.0

### Minor Changes

- [#382](https://github.com/NodeSecure/js-x-ray/pull/382) [`bc62d3e`](https://github.com/NodeSecure/js-x-ray/commit/bc62d3eeac861ff75e4dcd7901a77c6ef09ef461) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(probes): add finalize callback

- [#380](https://github.com/NodeSecure/js-x-ray/pull/380) [`99fd4fe`](https://github.com/NodeSecure/js-x-ray/commit/99fd4fe674ce880bf5d91d0d2589a3bba6a68097) Thanks [@clemgbld](https://github.com/clemgbld)! - refactor(probes): isFetch detect fetch re-assigment

### Patch Changes

- [#376](https://github.com/NodeSecure/js-x-ray/pull/376) [`d5b98de`](https://github.com/NodeSecure/js-x-ray/commit/d5b98de21ce00282c5226f663513a2236d45bbdc) Thanks [@tony-go](https://github.com/tony-go)! - Handle uname as unsafe-command

- Updated dependencies [[`53b25a4`](https://github.com/NodeSecure/js-x-ray/commit/53b25a485fed51776c673b4e86de907faa25989e)]:
  - @nodesecure/estree-ast-utils@4.2.0

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
