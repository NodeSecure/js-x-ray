import fs from 'fs';

const openSync = fs.openSync;

openSync('test.txt', 'r');
