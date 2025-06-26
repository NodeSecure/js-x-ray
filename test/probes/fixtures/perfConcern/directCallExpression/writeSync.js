const { writeSync } = require("fs");

writeSync('test.txt', 'Hello World!', 'utf8');
