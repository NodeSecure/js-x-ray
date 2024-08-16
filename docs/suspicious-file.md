# Suspicious file

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| suspicious-file | `Critical` | `sast_warnings.suspicious_file` | ❌ | 

## Introduction

We tag a file as suspicious when there is more than **ten** `encoded-literal` warnings in it. The idea behind is to avoid generating to much of the same kind of warnings.

This warning may have to evolve in the near future to include new criterias.
