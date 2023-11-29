# Suspicious literal

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| suspicious-literal | `Warning` | `sast_warnings.suspicious_literal` | ❌ | 

## Introduction

Thats one of the most interesting JS-X-Ray warning. We designed it with the idea of detecting long strings of characters that are very common in malicious obfuscated/encrypted codes like in [smith-and-wesson-skimmer](https://badjs.org/posts/smith-and-wesson-skimmer/).

The basic idea is to say that any string longer than 45 characters with no space is very suspicious... Then we establish a suspicion score that will be incremented according to several criteria:

- if the string contains **space** in the first **45** characters then we set the score to `zero`, else we set the score to `one`.
- if the string has more than **200 characters** then we add `1` to the score.
- we add one to the score for each **750 characters**. So a length of __1600__ will add `two` to the score.
- we add `two` point to the score if the string contains more than **70 unique characters**.

So it's possible for a string with more than 45 characters to come out with a score of zero if:
- there is space in the first 45 characters of the string.
- less than 70 unique characters.

The implementation is done in the [@nodesecure/sec-literal](https://github.com/NodeSecure/sec-literal/blob/main/src/utils.js) package and look like this:
```js
function stringCharDiversity(str, charsToExclude = []) {
  const data = new Set(str);
  charsToExclude.forEach((char) => data.delete(char));

  return data.size;
}

// ---
const kMaxSafeStringLen = 45;
const kMaxSafeStringCharDiversity = 70;
const kMinUnsafeStringLenThreshold = 200;
const kScoreStringLengthThreshold = 750;

function stringSuspicionScore(str) {
  const strLen = stringWidth(str);
  if (strLen < kMaxSafeStringLen) {
    return 0;
  }

  const includeSpace = str.includes(" ");
  const includeSpaceAtStart = includeSpace ?
    str.slice(0, kMaxSafeStringLen).includes(" ") :
    false;

  let suspectScore = includeSpaceAtStart ? 0 : 1;
  if (strLen > kMinUnsafeStringLenThreshold) {
    suspectScore += Math.ceil(
      strLen / kScoreStringLengthThreshold
    );
  }

  return stringCharDiversity(str) >= kMaxSafeStringCharDiversity ?
    suspectScore + 2 : suspectScore;
}
```

> [!IMPORTANT]
> The warning is generated only if the sum of all scores exceeds **three**.
