import fs from 'fs';

const linkSync = fs.linkSync;

linkSync('./source.txt', './destination.txt');
