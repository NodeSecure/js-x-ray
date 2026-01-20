---
"@nodesecure/js-x-ray": minor
---

Support multiple named main handlers in probes (resolves #460)

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
