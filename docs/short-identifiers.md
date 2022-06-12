# Short identifiers

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| short-identifiers | `Warning` | `sast_warnings.short_identifiers` | ❌ | 

## Introduction

The SAST store in memory all Identifiers id so we are able later to sum the length of all ids. We are looking at several ESTree Node in the tree:
- VariableDeclarator: `var boo;`
- AssignmentExpression: `(boo = 5)`
- FunctionDeclaration: `function boo() {}`
- Property of ObjectExpression: `{ boo: 5 }`

However, we do not take into consideration the properties of Objects for this warning. The warning is generated only if:

- The file is not already declared as **Minified**.
- There is more than **five** identifiers.
- The sum of all identifiers name length is below `1.5`.

## Example

```json
{
  "kind": "short-identifiers",
  "location": [[0,0], [0,0]],
  "value": 1.5,
  "file": "lib\\compile-env.js"
}
```
