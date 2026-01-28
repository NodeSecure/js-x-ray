# SQL Injection

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| sql-injection | `Warning` | `sast_warnings.sql_injection` | ❌ | 

## Introduction

Detects potential **SQL injection** vulnerabilities in JavaScript code. This warning is triggered when template literals containing SQL queries with interpolated expressions are passed to function calls without proper parameterization or escaping.

SQL injection is one of the most common and dangerous web application vulnerabilities. It occurs when untrusted user input is directly concatenated or interpolated into SQL queries, allowing attackers to manipulate the query logic and potentially access, modify, or delete unauthorized data.

The probe specifically looks for template literals with interpolation (`${variable}`) that match common SQL patterns, which can lead to SQL injection attacks when the interpolated values come from untrusted sources.

### Detected SQL Patterns

This probe detects template literals containing the following SQL statement patterns:

- **SELECT queries**: `SELECT ... FROM`
- **INSERT statements**: `INSERT INTO`
- **DELETE statements**: `DELETE FROM`
- **UPDATE statements**: `UPDATE ... SET`

The detection is case-insensitive and only triggers when template literals contain expressions (interpolations).

## Examples

```js
// Dangerous: User input directly interpolated into query
const userId = req.query.id; // User-controlled input
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);

// Multiple interpolations
const username = req.body.username;
const email = req.body.email;
const updateQuery = `UPDATE users SET email = ${email} WHERE username = ${username}`;
db.execute(updateQuery);

// INSERT with interpolation
const userInput = req.body.comment;
const insertQuery = `INSERT INTO comments (text) VALUES (${userInput})`;
db.query(insertQuery);

// DELETE with interpolation
const recordId = req.params.id;
const deleteQuery = `DELETE FROM records WHERE id = ${recordId}`;
db.run(deleteQuery);
```

## Resources

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [Node.js SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
