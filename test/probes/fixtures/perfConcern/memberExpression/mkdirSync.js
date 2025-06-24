import fs from 'fs';

const mkdirSync = fs.mkdirSync;

mkdirSync('./test-dir', { recursive: true });
