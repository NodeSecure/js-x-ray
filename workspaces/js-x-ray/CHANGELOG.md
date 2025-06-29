# @nodesecure/js-x-ray

## 9.1.0

### Minor Changes

- [#363](https://github.com/NodeSecure/js-x-ray/pull/363) [`e37384c`](https://github.com/NodeSecure/js-x-ray/commit/e37384c216a191a14dde19954c281a39512d5485) Thanks [@intincrab](https://github.com/intincrab)! - feat(probes): add serialize-environment warning detection

  Add new probe to detect potential environment variable exfiltration through `JSON.stringify(process.env)`.

- [#362](https://github.com/NodeSecure/js-x-ray/pull/362) [`5f78d4a`](https://github.com/NodeSecure/js-x-ray/commit/5f78d4a7bb19390b6d31892994339c193bf048cf) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(probes): add initialize

### Patch Changes

- Updated dependencies [[`c3016e0`](https://github.com/NodeSecure/js-x-ray/commit/c3016e0b5266178ad88b65c6fcca4c0a2ddb71b1)]:
  - @nodesecure/tracer@1.0.2
