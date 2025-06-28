import fs from 'fs';

const renameSync = fs.renameSync;

renameSync('oldfile.txt', 'newfile.txt');
