# SQL Injection

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| sql-injection | `Warning` | `sast_warnings.sql_injection` | ❌ | 

## Introduction

Detect potential **SQL injection** vulnerabilities in JavaScript code. This warning is triggered when template literals containing SQL queries are directly passed to function calls without proper parameterization or escaping.

The probe specifically looks for SQL queries that contain template string interpolation (`${variable}`) which can lead to SQL injection attacks when the interpolated values come from untrusted user input.
