import fs from 'fs';

const writeSync = fs.writeSync;

writeSync('test.txt', 'Hello World!', 'utf8');
