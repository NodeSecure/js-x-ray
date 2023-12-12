# Sec-literal
[![version](https://img.shields.io/github/package-json/v/NodeSecure/js-x-ray?filename=workspaces%2Fsec-literal%2Fpackage.json&style=for-the-badge)](https://www.npmjs.com/package/@nodesecure/sec-literal)
[![maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/NodeSecure/js-x-ray/blob/master/workspaces/sec-literal/graphs/commit-activity)
[![OpenSSF
Scorecard](https://api.securityscorecards.dev/projects/github.com/NodeSecure/js-x-ray/badge?style=for-the-badge)](https://api.securityscorecards.dev/projects/github.com/NodeSecure/js-x-ray)
[![mit](https://img.shields.io/github/license/NodeSecure/js-x-ray?style=for-the-badge)](https://github.com/NodeSecure/js-x-ray/blob/master/workspaces/sec-literal/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/NodeSecure/js-x-ray/sec-literal.yml?style=for-the-badge)](https://github.com/NodeSecure/js-x-ray/actions?query=workflow%3A%22sec+literal+CI%22)

This package is a security utilities library created to analyze [ESTree Literal](https://github.com/estree/estree/blob/master/es5.md#literal) and JavaScript string primitive. This project was originally created to simplify and better test the functionalities required for the SAST Scanner [JS-X-Ray](https://github.com/fraxken/js-x-ray).

## Features

- Detect Hexadecimal, Base64, Hexa and Unicode sequences.
- Detect patterns (prefix, suffix) on groups of identifiers.
- Detect suspicious string and return advanced metrics on it (char diversity etc).

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/sec-literal
# or
$ yarn add @nodesecure/sec-literal
```

## API

## Hex

### isHex(anyValue): boolean
Detect if the given string is an Hexadecimal value

### isSafe(anyValue): boolean
Detect if the given string is a safe Hexadecimal value. The goal of this method is to eliminate false-positive.

```js
Hex.isSafe("1234"); // true
Hex.isSafe("abcdef"); // true
```

## Literal

### isLiteral(anyValue): boolean
### toValue(anyValue): string
### toRaw(anyValue): string
### defaultAnalysis(literalValue)

## Utils

### isSvg(strValue): boolean

### isSvgPath(strValue): boolean
Detect if a given string is a svg path or not.

### stringCharDiversity(str): number
Get the number of unique chars in a given string

### stringSuspicionScore(str): number
Analyze a given string an give it a suspicion score (higher than 1 or 2 mean that the string is highly suspect).

## Patterns

### commonStringPrefix(leftStr, rightStr): string | null
### commonStringSuffix(leftStr, rightStr): string | null
### commonHexadecimalPrefix(identifiersArray: string[])

## License
MIT
