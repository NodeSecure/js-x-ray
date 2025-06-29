---
"@nodesecure/js-x-ray": minor
---

feat(probes): add serialize-environment warning detection

Add new probe to detect potential environment variable exfiltration through `JSON.stringify(process.env)`.
