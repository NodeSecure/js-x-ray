# Warnings

## Introduction
This document provides a more complete explanation of how certain warnings are currently implemented. Most of them are still at the experimentation stage and a lot of iteration will be necessary to make them accurate.

---

## obfuscated-code
This new warning has been integrated in the v2.0 release of the package. A complete Google Drive document has been written to describe all patterns of obfuscation tools and way of detecting them.

- [JSXRay - Patterns of obfuscated JavaScript code](https://docs.google.com/document/d/11ZrfW0bDQ-kd7Gr_Ixqyk8p3TGvxckmhFH3Z8dFoPhY/edit?usp=sharing)

For the moment no implementation has been completely frozen.

## unsafe-regex
JS-X-Ray use the npm package [safe-regex](https://github.com/davisjam/safe-regex) to checkup all Literal and RegEx Constructor.

## unsafe-assign
The analysis traces the assignment of several global variables considered to be dangerous. They can often be used for malicious purposes and hide information from tools like ours.

On Node.js we track the use of `require` and `process` (and particulary things like `process.mainModule.require`). With the example below the analysis will still be able to trace the use of require:

```js
const b = process;
const c = b.mainModule;
c.require("http");
```

## short-identifiers
The current analysis store in memory all Identifiers name. There are several sources:
- VariableDeclarator: `var boo;`
- AssignmentExpression: `boo = 5;`
- FunctionDeclaration: `function boo() {}`
- Property of ObjectExpression: `{ boo: 5 }`

However we do not take into account the properties of objects for this warning. The warning is generated only if:

- The file is not already declared as Minified.
- There is more than five identifiers.
- The sum of all identifiers name length is below 1.5.

## encoded-literal
The analysis checks all the Literals in the tree and search for encoded values. JS-X-Ray currently supports three types of detection:
- Hexadecimal sequence: `'\x72\x4b\x58\x6e\x75\x65\x38\x3d'`
- Unicode sequence: `\u03B1`
- Base64 encryption: `z0PgB0O=`

Hexadecimal and Unicode sequence are tested directly on the raw Literal provided by meriyah. For base64 detection we the npm package [is-base64](https://github.com/miguelmota/is-base64).

JavaScript implementation:
```js
const hasHexadecimalSequence = /\\x[a-fA-F0-9]{2}/g.exec(node.raw) !== null;
const hasUnicodeSequence = /\\u[a-fA-F0-9]{4}/g.exec(node.raw) !== null;
const isBase64 = isStringBase64(node.value, { allowEmpty: false });
```

## suspicious-literal
It's one of the most interesting warnings. I personally built it with the idea of detecting long strings of characters that are very common in malicious obfuscated/encrypted codes like in [smith-and-wesson-skimmer](https://badjs.org/posts/smith-and-wesson-skimmer/).

The basic idea is to say that any string longer than 45 characters with no space is very suspicious... Then we establish a suspicion score that will be incremented according to several criteria:

- if the string contains space in the first 45 characters then we set the score to zero, else we set the score to one.
- if the string has more than 200 characters then we add 1 to the score.
- we add one to the score for each 750 characters. So a length of 1600 will add two to the score.
- we add two point to the score if the string contains more than 70 unique characters.

So it's possible for a string with more than 45 characters to come out with a score of zero if:
- there is space in the first 45 characters of the string.
- less than 70 unique characters.

JavaScript implementation:
```js
function strCharDiversity(str) {
    return new Set([...str]).size;
}

function strSuspectScore(str) {
    if (str.length < 45) {
        return 0;
    }

    const includeSpace = str.includes(" ");
    const includeSpaceAtStart = includeSpace ? str.slice(0, 45).includes(" ") : false;
    let suspectScore = includeSpaceAtStart ? 0 : 1;
    if (str.length > 200) {
        suspectScore += Math.floor(str.length / 750);
    }

    return strCharDiversity(str) >= 70 ? suspectScore + 2 : suspectScore;
}
```

The warning is generated only if the sum of all scores exceeds three.
