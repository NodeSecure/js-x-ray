---
"@nodesecure/js-x-ray": patch
---

resolve `require` specifiers written as a template literal with no expression, so ``require(`http`)`` records the dependency instead of reporting `unsafe-import`
