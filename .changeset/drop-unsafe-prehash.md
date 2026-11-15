---
"@nodesecure/js-x-ray": major
---

refactor(js-x-ray)!: remove the crypto.unsafe-prehash optional warning, neither bcryptjs nor bcrypt (>= 5.0.0) truncates its input at a null byte
