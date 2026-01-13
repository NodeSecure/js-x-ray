# @nodesecure/js-x-ray

## 11.3.0

### Minor Changes

- [#453](https://github.com/NodeSecure/js-x-ray/pull/453) [`0b0751a`](https://github.com/NodeSecure/js-x-ray/commit/0b0751acc749f240aca0b7699718c1c990432e43) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(js-x-ray): scan and collect ip address that are not urls

- [#452](https://github.com/NodeSecure/js-x-ray/pull/452) [`a01b8e7`](https://github.com/NodeSecure/js-x-ray/commit/a01b8e7f60c47674011adc13342c5768ec25ad2f) Thanks [@7amed3li](https://github.com/7amed3li)! - Added detection for local IP addresses and `localhost` in URLs. These are now flagged with the existing `shady-link` warning but with `Information` severity level instead of `Warning`.

- [#450](https://github.com/NodeSecure/js-x-ray/pull/450) [`3185318`](https://github.com/NodeSecure/js-x-ray/commit/3185318c55f77e992a107966f3e491716192f2fc) Thanks [@fraxken](https://github.com/fraxken)! - Allow to customize warnings severity

## 11.2.0

### Minor Changes

- [#445](https://github.com/NodeSecure/js-x-ray/pull/445) [`20a03d2`](https://github.com/NodeSecure/js-x-ray/commit/20a03d254ba94f83977037786908114fe00146e2) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(js-x-ray): add collectable api

- [#443](https://github.com/NodeSecure/js-x-ray/pull/443) [`297c072`](https://github.com/NodeSecure/js-x-ray/commit/297c072c143a53888517486dd071e7fd4397374b) Thanks [@clemgbld](https://github.com/clemgbld)! - fix(js-x-ray): parsing error in data exfiltration probe

## 11.1.0

### Minor Changes

- [#438](https://github.com/NodeSecure/js-x-ray/pull/438) [`8d7efd2`](https://github.com/NodeSecure/js-x-ray/commit/8d7efd23b0d1e87ecf2844edd19b91b537061939) Thanks [@fraxken](https://github.com/fraxken)! - Implement TypeScript files support in EntryFileAnalyser

### Patch Changes

- Updated dependencies [[`8d7efd2`](https://github.com/NodeSecure/js-x-ray/commit/8d7efd23b0d1e87ecf2844edd19b91b537061939)]:
  - @nodesecure/ts-source-parser@1.1.0

## 11.0.1

### Patch Changes

- [#436](https://github.com/NodeSecure/js-x-ray/pull/436) [`f4d8a68`](https://github.com/NodeSecure/js-x-ray/commit/f4d8a6867b3c87f58960ce4bab83bedc76bf8c1e) Thanks [@fraxken](https://github.com/fraxken)! - Ignore valid URL with unknown protocol

## 11.0.0

### Major Changes

- [#432](https://github.com/NodeSecure/js-x-ray/pull/432) [`0e1b5f5`](https://github.com/NodeSecure/js-x-ray/commit/0e1b5f54586956aeb6627f132d7ef7ee121786ed) Thanks [@fraxken](https://github.com/fraxken)! - Migrate to meriyah v7

- [#431](https://github.com/NodeSecure/js-x-ray/pull/431) [`eb6c0c3`](https://github.com/NodeSecure/js-x-ray/commit/eb6c0c3cc40ed3282fa0c1aa6b52cc0d368ae527) Thanks [@fraxken](https://github.com/fraxken)! - move customParser from constructor to analyse and runtime options

### Minor Changes

- [#421](https://github.com/NodeSecure/js-x-ray/pull/421) [`76a7425`](https://github.com/NodeSecure/js-x-ray/commit/76a7425ab5210ec35e25ea5a783b3ab53ff25a54) Thanks [@fraxken](https://github.com/fraxken)! - Improve trojan-source detection

- [#429](https://github.com/NodeSecure/js-x-ray/pull/429) [`b1d67a4`](https://github.com/NodeSecure/js-x-ray/commit/b1d67a4be64d8c0b8ba5043a0792d8d4028cdf3f) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(isRequire): Unsafe-import for prebuilt-install binary file

- [#423](https://github.com/NodeSecure/js-x-ray/pull/423) [`9a9a88a`](https://github.com/NodeSecure/js-x-ray/commit/9a9a88a4b0e96c3253e9eeec80cce0e31a966735) Thanks [@fraxken](https://github.com/fraxken)! - Implement a new ShadyURL class with ipaddr.js to detect malicious URL/ips

- [#428](https://github.com/NodeSecure/js-x-ray/pull/428) [`d83087f`](https://github.com/NodeSecure/js-x-ray/commit/d83087f3a261fde295d9461b18e3278d21a9da7b) Thanks [@fraxken](https://github.com/fraxken)! - Implement new SourceFilePath to locate source code

## 10.2.1

### Patch Changes

- [#417](https://github.com/NodeSecure/js-x-ray/pull/417) [`8125cfb`](https://github.com/NodeSecure/js-x-ray/commit/8125cfb12a4f99136246562e35e5d55947674426) Thanks [@fraxken](https://github.com/fraxken)! - Normalize experimental property in warnings

## 10.2.0

### Minor Changes

- [#415](https://github.com/NodeSecure/js-x-ray/pull/415) [`d17c784`](https://github.com/NodeSecure/js-x-ray/commit/d17c784b0a584e20301b630a4fec01df59a2c9e5) Thanks [@fraxken](https://github.com/fraxken)! - Remove is-minified-code from dependencies and re-implement function in utils

### Patch Changes

- [#412](https://github.com/NodeSecure/js-x-ray/pull/412) [`a5c8473`](https://github.com/NodeSecure/js-x-ray/commit/a5c8473ed1c6c5f995be698c1fbeec8f744ca63b) Thanks [@fraxken](https://github.com/fraxken)! - Update digraph-js to v2.2.4 to remove deprecated lodash.isequal

- Updated dependencies [[`a98fe96`](https://github.com/NodeSecure/js-x-ray/commit/a98fe96418e7da1ca90a735f6811bf78ae486f51)]:
  - @nodesecure/sec-literal@1.4.0

## 10.1.0

### Minor Changes

- [#407](https://github.com/NodeSecure/js-x-ray/pull/407) [`71c96d1`](https://github.com/NodeSecure/js-x-ray/commit/71c96d1d265a4eac0b10af421de0e796ea1ce102) Thanks [@fraxken](https://github.com/fraxken)! - Update FrequencySet to v2.1.x

### Patch Changes

- Updated dependencies [[`71c96d1`](https://github.com/NodeSecure/js-x-ray/commit/71c96d1d265a4eac0b10af421de0e796ea1ce102)]:
  - @nodesecure/sec-literal@1.3.0

## 10.0.0

### Major Changes

- [#383](https://github.com/NodeSecure/js-x-ray/pull/383) [`09c3575`](https://github.com/NodeSecure/js-x-ray/commit/09c357550ba0bcf6642c73fde8ea9d8a039caf45) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(tracer): support tracking function return values

### Minor Changes

- [#399](https://github.com/NodeSecure/js-x-ray/pull/399) [`857308c`](https://github.com/NodeSecure/js-x-ray/commit/857308c1e34495d15a10196910ed33713095c497) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(probes) add minimal implementation of data-exfiltration

- [#392](https://github.com/NodeSecure/js-x-ray/pull/392) [`02a2d05`](https://github.com/NodeSecure/js-x-ray/commit/02a2d05b22be7cb38916c72bba7323bc77f3ff66) Thanks [@fraxken](https://github.com/fraxken)! - Simplify tracing validation & add new spread test for the probe

- [#398](https://github.com/NodeSecure/js-x-ray/pull/398) [`b6d2474`](https://github.com/NodeSecure/js-x-ray/commit/b6d2474a344e3dd63746822b7ce7f55571bd7578) Thanks [@fraxken](https://github.com/fraxken)! - Implement new pipeline mechanism with a built-in deobfuscate

- [#382](https://github.com/NodeSecure/js-x-ray/pull/382) [`bc62d3e`](https://github.com/NodeSecure/js-x-ray/commit/bc62d3eeac861ff75e4dcd7901a77c6ef09ef461) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(probes): add finalize callback

- [#397](https://github.com/NodeSecure/js-x-ray/pull/397) [`283d5b6`](https://github.com/NodeSecure/js-x-ray/commit/283d5b62ad8efd8d4b86be987671b9e9461f1836) Thanks [@fraxken](https://github.com/fraxken)! - Integrate estree-walker natively using meriyah ESTree types

- [#387](https://github.com/NodeSecure/js-x-ray/pull/387) [`4d097cc`](https://github.com/NodeSecure/js-x-ray/commit/4d097cc62c0b4a30e4c14f652c79be3907436346) Thanks [@fraxken](https://github.com/fraxken)! - Move trojan-source detection from SourceFile to AstAnalyser

- [#396](https://github.com/NodeSecure/js-x-ray/pull/396) [`f66af80`](https://github.com/NodeSecure/js-x-ray/commit/f66af8069f08a266b8b7c802839d476c2ce4ba32) Thanks [@fraxken](https://github.com/fraxken)! - Move Signals into probe.main context

- [#380](https://github.com/NodeSecure/js-x-ray/pull/380) [`99fd4fe`](https://github.com/NodeSecure/js-x-ray/commit/99fd4fe674ce880bf5d91d0d2589a3bba6a68097) Thanks [@clemgbld](https://github.com/clemgbld)! - refactor(probes): isFetch detect fetch re-assigment

- [#395](https://github.com/NodeSecure/js-x-ray/pull/395) [`fad019f`](https://github.com/NodeSecure/js-x-ray/commit/fad019fd25c2e3d7dc41740fbf171d6d62682b29) Thanks [@fraxken](https://github.com/fraxken)! - Implement context for Probe and ProbeRunner

- [#389](https://github.com/NodeSecure/js-x-ray/pull/389) [`f037105`](https://github.com/NodeSecure/js-x-ray/commit/f03710537ad475e6e07378f3ecae51589bfec789) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(probes): isLiteral detect api.ipify.org with shady link

- [#384](https://github.com/NodeSecure/js-x-ray/pull/384) [`728d744`](https://github.com/NodeSecure/js-x-ray/commit/728d744afc6de86a7a5b8fd6d6df32edfb13e882) Thanks [@fraxken](https://github.com/fraxken)! - move ProbeRunner from SourceFile to AstAnalyser class

### Patch Changes

- [#376](https://github.com/NodeSecure/js-x-ray/pull/376) [`d5b98de`](https://github.com/NodeSecure/js-x-ray/commit/d5b98de21ce00282c5226f663513a2236d45bbdc) Thanks [@tony-go](https://github.com/tony-go)! - Handle uname as unsafe-command

- [#400](https://github.com/NodeSecure/js-x-ray/pull/400) [`14cb982`](https://github.com/NodeSecure/js-x-ray/commit/14cb9827da4fddde49b8c8dddbca6268d9f3685a) Thanks [@fraxken](https://github.com/fraxken)! - Properly deep clone and reset probe context

- [#381](https://github.com/NodeSecure/js-x-ray/pull/381) [`ca954d8`](https://github.com/NodeSecure/js-x-ray/commit/ca954d8b59a57d703b2c6607311f6040b7596c77) Thanks [@tony-go](https://github.com/tony-go)! - Handle curl and ping for unsafe-command probe

- Updated dependencies [[`91031f8`](https://github.com/NodeSecure/js-x-ray/commit/91031f84c7962474822640017d227d5bb31282dc), [`7927535`](https://github.com/NodeSecure/js-x-ray/commit/7927535396dc6bc50f100d153188fc16c5367237), [`09c3575`](https://github.com/NodeSecure/js-x-ray/commit/09c357550ba0bcf6642c73fde8ea9d8a039caf45), [`facb858`](https://github.com/NodeSecure/js-x-ray/commit/facb8581e8ebfe9082a8566647e1858bf40a8958), [`53b25a4`](https://github.com/NodeSecure/js-x-ray/commit/53b25a485fed51776c673b4e86de907faa25989e)]:
  - @nodesecure/tracer@3.0.0
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
