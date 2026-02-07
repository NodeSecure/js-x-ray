# @nodesecure/js-x-ray

## 11.7.0

### Minor Changes

- [#523](https://github.com/NodeSecure/js-x-ray/pull/523) [`7918a5d`](https://github.com/NodeSecure/js-x-ray/commit/7918a5d4bd4d338b87b52331cfd90acc0400e589) Thanks [@fraxken](https://github.com/fraxken)! - Add support for native type striping inside JsSourceParser using node:module API

## 11.6.0

### Minor Changes

- [#511](https://github.com/NodeSecure/js-x-ray/pull/511) [`cd46792`](https://github.com/NodeSecure/js-x-ray/commit/cd4679232236259123f6ef2d34e465a66e0c5977) Thanks [@fraxken](https://github.com/fraxken)! - Migrate VariableTracer class to js-x-ray workspace

- [#517](https://github.com/NodeSecure/js-x-ray/pull/517) [`8597384`](https://github.com/NodeSecure/js-x-ray/commit/8597384cbb0ad29a4a65caad18a8ece2c8724e9b) Thanks [@7amed3li](https://github.com/7amed3li)! - feat: add support for Arabic and Turkish languages

- [#512](https://github.com/NodeSecure/js-x-ray/pull/512) [`085c0fd`](https://github.com/NodeSecure/js-x-ray/commit/085c0fd588925fd89a5ed05d9aae704031e0c4eb) Thanks [@7amed3li](https://github.com/7amed3li)! - feat: add prototype pollution detection probe

- [#516](https://github.com/NodeSecure/js-x-ray/pull/516) [`4898768`](https://github.com/NodeSecure/js-x-ray/commit/489876860e1fcf0bceb4ef05983faa7ab877df94) Thanks [@7amed3li](https://github.com/7amed3li)! - Add insecure-random probe to detect Math.random() usage.

- [#520](https://github.com/NodeSecure/js-x-ray/pull/520) [`5991e41`](https://github.com/NodeSecure/js-x-ray/commit/5991e4166081355dc8f6cf415499ffd805f3b2e5) Thanks [@fraxken](https://github.com/fraxken)! - Remove ts-source-parser workspace and migrate TS support natively in JS-X-Ray

- [#513](https://github.com/NodeSecure/js-x-ray/pull/513) [`42888bd`](https://github.com/NodeSecure/js-x-ray/commit/42888bd8c1267673467e18f20583ca50a30a3de2) Thanks [@fraxken](https://github.com/fraxken)! - Migrate estree-ast-utils to JS-X-Ray

- [#522](https://github.com/NodeSecure/js-x-ray/pull/522) [`112d4ee`](https://github.com/NodeSecure/js-x-ray/commit/112d4eeb3b60260ff827e1231c1508936c3c0997) Thanks [@fraxken](https://github.com/fraxken)! - Migrate @nodesecure/sec-literal workspace to JS-X-Ray workspace

## 11.5.0

### Minor Changes

- [#494](https://github.com/NodeSecure/js-x-ray/pull/494) [`3686651`](https://github.com/NodeSecure/js-x-ray/commit/3686651862cb376059353d370518c16e55e70653) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(js-x-ray): detect more sync IO method for crypto module

- [#505](https://github.com/NodeSecure/js-x-ray/pull/505) [`4800d5d`](https://github.com/NodeSecure/js-x-ray/commit/4800d5d0470eed3c51f15258b1723ec1b3a4b349) Thanks [@fraxken](https://github.com/fraxken)! - Implement i18n translation locally for warnings

- [#483](https://github.com/NodeSecure/js-x-ray/pull/483) [`996be20`](https://github.com/NodeSecure/js-x-ray/commit/996be20594911b2de0cb7cb36da5addb81b9f6be) Thanks [@clemgbld](https://github.com/clemgbld)! - refactor(js-x-ray): valideProbe optimisation on CallExpressionIdentifier with tracer

- [#486](https://github.com/NodeSecure/js-x-ray/pull/486) [`4259011`](https://github.com/NodeSecure/js-x-ray/commit/425901199e1153cec1cde067731a1c3b789d36a3) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(js-x-ray): add metadata in analyzeFile and analyzeFileSync in AstAnalyzer

- [#485](https://github.com/NodeSecure/js-x-ray/pull/485) [`cf75218`](https://github.com/NodeSecure/js-x-ray/commit/cf75218976d590dbcde663484523a70add75f2af) Thanks [@fraxken](https://github.com/fraxken)! - Implement a new monkey-patch warning/probe

- [#501](https://github.com/NodeSecure/js-x-ray/pull/501) [`1c2c39f`](https://github.com/NodeSecure/js-x-ray/commit/1c2c39fecc9a584e8788507a822023d10bd87c7c) Thanks [@clemgbld](https://github.com/clemgbld)! - feat: detect identifier sql-injection

- [#491](https://github.com/NodeSecure/js-x-ray/pull/491) [`4674d38`](https://github.com/NodeSecure/js-x-ray/commit/4674d383c94b18aff56a299d4a8f14ed90adea32) Thanks [@fraxken](https://github.com/fraxken)! - Enhance ProbeRunner runProbe readability by removing tabs and implementing a new private method #getProbeHandler

### Patch Changes

- [#496](https://github.com/NodeSecure/js-x-ray/pull/496) [`667cccf`](https://github.com/NodeSecure/js-x-ray/commit/667cccf3163cbad20ba9ca0a3802f1b012e6ae20) Thanks [@7amed3li](https://github.com/7amed3li)! - feat: add performance benchmarks using mitata

- Updated dependencies [[`1c2c39f`](https://github.com/NodeSecure/js-x-ray/commit/1c2c39fecc9a584e8788507a822023d10bd87c7c)]:
  - @nodesecure/tracer@4.0.0
  - @nodesecure/estree-ast-utils@4.3.0

## 11.4.0

### Minor Changes

- [#468](https://github.com/NodeSecure/js-x-ray/pull/468) [`317d679`](https://github.com/NodeSecure/js-x-ray/commit/317d679447b19177459805807b80c91511125e38) Thanks [@7amed3li](https://github.com/7amed3li)! - feat(isLiteral): add email collection using CollectableSet API

  Implemented email detection and collection in the isLiteral probe. The probe now identifies email addresses in string literals using the same regex pattern as the CLI and collects them via the CollectableSet API.

  - Added email regex constant matching CLI implementation
  - Email addresses are now collected when CollectableSet("email") is provided
  - Added comprehensive test cases covering valid/invalid formats and edge cases

- [#462](https://github.com/NodeSecure/js-x-ray/pull/462) [`ed0a637`](https://github.com/NodeSecure/js-x-ray/commit/ed0a637f74f067178ac2482cddc75983ee35bef1) Thanks [@7amed3li](https://github.com/7amed3li)! - Support multiple named main handlers in probes (resolves #460)

  Introduces support for multiple named main entrypoints in probes, allowing probes to define different handlers for various analysis scenarios. This enables more flexible probe implementations while maintaining full backward compatibility.

  **Key Changes:**

  - Added `NamedMainHandlers` type supporting multiple handler functions with required `default` handler
  - Extended `ProbeContext` with `setEntryPoint(handlerName: string)` method for handler selection
  - Updated `Probe` interface to accept either single `main` function or `NamedMainHandlers` object
  - Implemented handler resolution logic in `ProbeRunner#runProbe` with automatic cleanup
  - Added comprehensive test coverage (all 14 existing tests + 8 new tests passing)

  **Backward Compatibility:**

  - Existing probes with single `main` function continue to work without changes
  - `setEntryPoint` method available but optional for backward-compatible probes
  - No breaking changes to existing API

  This is the core infrastructure PR. Future work will include example probe refactoring and documentation updates.

- [#456](https://github.com/NodeSecure/js-x-ray/pull/456) [`9f4e420`](https://github.com/NodeSecure/js-x-ray/commit/9f4e420128f36fd9cd409a3a02bcd0653fe59257) Thanks [@7amed3li](https://github.com/7amed3li)! - Add sensitivity option to AstAnalyser for configurable warning detection

  Introduces a new sensitivity option in AstAnalyserOptions that allows users to control the strictness of warning detection:

  - conservative (default): Maintains current strict behavior to minimize false positives. Suitable for scanning ecosystem libraries.
  - aggressive: Detects all child_process usage for maximum visibility in local project scanning.

  This change implements the sensitivity option for the isUnsafeCommand probe. Additional probes (isSerializeEnv, data-exfiltration) can be updated in future releases.

- [#480](https://github.com/NodeSecure/js-x-ray/pull/480) [`d9e0481`](https://github.com/NodeSecure/js-x-ray/commit/d9e0481502a853d69f27262594509002f33366e1) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(js-x-ray): add sql-injection probe

- [#467](https://github.com/NodeSecure/js-x-ray/pull/467) [`8948caa`](https://github.com/NodeSecure/js-x-ray/commit/8948caad67efd6080ae43b150d8a406a8a56ec6c) Thanks [@7amed3li](https://github.com/7amed3li)! - feat(isSerializeEnv): add named handler for direct process.env access detection

  Introduces a named handler pattern in the `isSerializeEnv` probe to detect direct `process.env` access when running in **aggressive** sensitivity mode.

  **Changes:**

  - Added `validateProcessEnv` validator to detect `process.env` MemberExpression nodes
  - Added `processEnvHandler` named handler that triggers only in aggressive mode
  - Converted probe export to use `NamedMainHandlers` pattern with `default` and `process.env` handlers
  - Existing `JSON.stringify(process.env)` detection remains unchanged (backward compatible)

  **Behavior:**

  - **Conservative mode (default)**: Only flags `process.env` when used with `JSON.stringify`
  - **Aggressive mode**: Additionally flags any direct `process.env` access

  Relates to #367

- [#454](https://github.com/NodeSecure/js-x-ray/pull/454) [`bad3093`](https://github.com/NodeSecure/js-x-ray/commit/bad3093a550a6f19321f260559112327b99685a9) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(js-x-ray): isUnsafeCommand transform TemplateLiteral to Literal

- [#464](https://github.com/NodeSecure/js-x-ray/pull/464) [`18fc25a`](https://github.com/NodeSecure/js-x-ray/commit/18fc25a540119b02e07407cd42d0d59eee1bafb9) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(js-x-ray): collectable set can add metadata

- [#479](https://github.com/NodeSecure/js-x-ray/pull/479) [`8848684`](https://github.com/NodeSecure/js-x-ray/commit/8848684332fdcd6bdce9f16886fc2b21270efc14) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(js-x-ray): implement log-usage probe

- [#471](https://github.com/NodeSecure/js-x-ray/pull/471) [`e288c04`](https://github.com/NodeSecure/js-x-ray/commit/e288c045fe24f58b4344350a23d9b2d2b7f1b824) Thanks [@clemgbld](https://github.com/clemgbld)! - feat: generate data-exfiltration warning on import when the sensitivity is aggressive

- [#463](https://github.com/NodeSecure/js-x-ray/pull/463) [`e621d91`](https://github.com/NodeSecure/js-x-ray/commit/e621d9173b8b5cd5653e3e13b33ace1e70be99c1) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(js-x-ray): do not detect file: as shady link

- [#469](https://github.com/NodeSecure/js-x-ray/pull/469) [`c4fad05`](https://github.com/NodeSecure/js-x-ray/commit/c4fad058293a398245b4e6ff3db2fbcbb7561d40) Thanks [@fraxken](https://github.com/fraxken)! - Introduce new VirtualIdentifier to split inlined require() with chained MemberExpr/CallExpr

- [#478](https://github.com/NodeSecure/js-x-ray/pull/478) [`029031c`](https://github.com/NodeSecure/js-x-ray/commit/029031cc747596af933a65ec1aa8d36e87c26f1e) Thanks [@clemgbld](https://github.com/clemgbld)! - refactor(js-x-ray): type the type of CollectableSet

### Patch Changes

- [#482](https://github.com/NodeSecure/js-x-ray/pull/482) [`9b51811`](https://github.com/NodeSecure/js-x-ray/commit/9b5181119280ae0f206bbc764af2b902928b9fe5) Thanks [@clemgbld](https://github.com/clemgbld)! - fix(js-x-ray): fix 32 bit ip addresses false positive

- Updated dependencies [[`e288c04`](https://github.com/NodeSecure/js-x-ray/commit/e288c045fe24f58b4344350a23d9b2d2b7f1b824)]:
  - @nodesecure/tracer@3.1.0

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
