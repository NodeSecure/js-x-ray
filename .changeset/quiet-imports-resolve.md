---
"@nodesecure/js-x-ray": patch
---

resolve dynamic `import()` specifiers written as a template literal with no expression, so ``import(`lodash`)`` records the dependency and ``import(`data:text/javascript,...`)`` reports `unsafe-import` like its string literal form
