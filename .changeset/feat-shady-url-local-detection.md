---
"@nodesecure/js-x-ray": minor
---

Added detection for local IP addresses and `localhost` in URLs. These are now flagged with the existing `shady-link` warning but with `Information` severity level instead of `Warning`.
