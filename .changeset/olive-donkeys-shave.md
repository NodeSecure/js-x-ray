---
"@nodesecure/js-x-ray": patch
---

match quoted and computed string keys in findPropertyMatch, so `{ "cost": 1 }` and `{ ["cost"]: 1 }` are no longer skipped