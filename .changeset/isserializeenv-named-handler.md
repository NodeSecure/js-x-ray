---
"@nodesecure/js-x-ray": minor
---

feat(isSerializeEnv): add named handler for direct process.env access detection

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
