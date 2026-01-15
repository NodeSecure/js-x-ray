---
"@nodesecure/js-x-ray": minor
---

Add sensitivity option to AstAnalyser for configurable warning detection

Introduces a new sensitivity option in AstAnalyserOptions that allows users to control the strictness of warning detection:
- conservative (default): Maintains current strict behavior to minimize false positives. Suitable for scanning ecosystem libraries.
- aggressive: Detects all child_process usage for maximum visibility in local project scanning.

This change implements the sensitivity option for the isUnsafeCommand probe. Additional probes (isSerializeEnv, data-exfiltration) can be updated in future releases.
