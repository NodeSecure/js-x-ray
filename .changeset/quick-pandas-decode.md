---
"@nodesecure/js-x-ray": patch
---

decode `Buffer.from(payload, "base64")` in require specifiers, so `require(Buffer.from("aHR0cA==", "base64").toString())` records `http` like the `hex` and `atob` forms already do
