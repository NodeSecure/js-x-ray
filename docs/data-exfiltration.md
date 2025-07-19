# Data exfiltration 

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| data-exfiltration | `Warning` | `sast_warnings.data_exfiltration` | ❌ | 

## Introduction

Data exfiltration is the unauthorized transfer of sensitive data from a computer or network to an external location. This can occur through malicious code, insider threats, or compromised systems.

## Example

```js
import os from "os";

JSON.stringify(os.userInfo());
```