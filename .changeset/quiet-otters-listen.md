---
"@nodesecure/js-x-ray": minor
---

feat(tracer): resolve identifiers assigned an object literal, so `log-usage` detects `pino()`/`winston.createLogger()` config passed via a variable instead of only inline
