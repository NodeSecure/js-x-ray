# Obfuscated code

| Code | Severity | i18n | Experimental |
| --- | --- | --- | :-: |
| obfuscated-code | `Critical` | `sast_warnings.obfuscated_code` | ✔️ | 

## Introduction

An **experimental** warning capable of detecting obfuscation and sometimes the tool used. The scanner is capable to detect:

- [freejsobfuscator](http://www.freejsobfuscator.com/)
- [jjencode](https://utf-8.jp/public/jjencode.html)
- [jsfuck](http://www.jsfuck.com/)
- [obfuscator.io](https://obfuscator.io/)
- morse
- [trojan source](https://trojansource.codes/)

Example of obfuscated code is in the root `examples` directory.

### Technical note
A complete G.Drive document has been written to describe the patterns of obfuscation tools and some way of detecting them:

- [JSXRay - Patterns of obfuscated JavaScript code](https://docs.google.com/document/d/11ZrfW0bDQ-kd7Gr_Ixqyk8p3TGvxckmhFH3Z8dFoPhY/edit?usp=sharing)

> **Note** There is no frozen implementation and this is an early implementation

## Example

The following code uses Morse code to obfuscate its real intent. This was used in an attack and I find it quite funny so i implemented morse detection 😂.

```js
function decodeMorse(morseCode) {
  var ref = {
    '.-': 'a',
    '-...': 'b',
    '-.-.': 'c',
    '-..': 'd',
    '.': 'e',
    '..-.': 'f',
    '--.': 'g',
    '....': 'h',
    '..': 'i',
    '.---': 'j',
    '-.-': 'k',
    '.-..': 'l',
    '--': 'm',
    '-.': 'n',
    '---': 'o',
    '.--.': 'p',
    '--.-': 'q',
    '.-.': 'r',
    '...': 's',
    '-': 't',
    '..-': 'u',
    '...-': 'v',
    '.--': 'w',
    '-..-': 'x',
    '-.--': 'y',
    '--..': 'z',
    '.----': '1',
    '..---': '2',
    '...--': '3',
    '....-': '4',
    '.....': '5',
    '-....': '6',
    '--...': '7',
    '---..': '8',
    '----.': '9',
    '-----': '0',
  };

  return morseCode
    .split('   ')
    .map(a => a.split(' ').map(b => ref[b]).join(''))
    .join(' ');
}

var decoded = decodeMorse(".-- --- .-. -..   .-- --- .-. -..");
console.log(decoded);
```
