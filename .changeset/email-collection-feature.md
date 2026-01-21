---
"@nodesecure/js-x-ray": minor
---

feat(isLiteral): add email collection using CollectableSet API

Implemented email detection and collection in the isLiteral probe. The probe now identifies email addresses in string literals using the same regex pattern as the CLI and collects them via the CollectableSet API.

- Added email regex constant matching CLI implementation
- Email addresses are now collected when CollectableSet("email") is provided
- Added comprehensive test cases covering valid/invalid formats and edge cases
