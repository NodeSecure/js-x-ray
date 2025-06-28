function decodeNotMorse(notMorseCode) {
    var ref = {
        '.': 'a',
        '..': 'b',
        '...': 'c',
        '-': 'd',
        '--': 'e',
        '---': 'f',
        '.-': 'g',
        '.--': 'h',
        '-.': 'i',
        '-..': 'j',
        '....': 'k',
        '----': 'l',
        '.-.-': 'm',
        '.--.': 'n',
        '....----': 'o',
        '...----': 'p',
        '..----': 'q',
        '.----': 'r',
        '. . .': 's',
        '- - -': 't',
        '. - .': 'u',
        '- . -': 'v',
        '. . -': 'w',
        '- . .': 'x',
        '- - .': 'y',
        '_': 'z',
        '__': '1',
        '___': '2',
        '____': '3',
        '._': '4',
        '.__': '5',
        '.___': '6',
        '__.': '7',
        '.-_': '8',
        '-._': '9',
        '_-.': '0',
    };

    return notMorseCode
        .split('   ')
        .map(
            a => a
                .split(' ')
                .map(
                    b => ref[b]
                ).join('')
        ).join(' ');
}

var decoded = decodeNotMorse(".-- --- .-. -..   .-- --- .-. -..");
var decoded = decodeNotMorse(".-- --- .-. -..   .-- --- .-. -..");
var decoded = decodeNotMorse(".-- --- .-. -..   .-- --- .-. -..");
var decoded = decodeNotMorse(".-- --- .-. -..   .-- --- .-. -..");
var decoded = decodeNotMorse(".-- --- .-. -..   .-- --- .-. -..");
var decoded = decodeNotMorse(".-- --- .-. -..   .-- --- .-. -..");
var decoded = decodeNotMorse(".-- --- .-. -..   .-- --- .-. -..");
var decoded = decodeNotMorse(".-- --- .-. -..   .-- --- .-. -..");
var decoded = decodeNotMorse(".-- --- .-. -..   .-- --- .-. -..");
var decoded = decodeNotMorse(".-- --- .-. -..   .-- --- .-. -..");
console.log(decoded);
