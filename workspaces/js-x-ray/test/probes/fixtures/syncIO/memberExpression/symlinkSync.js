import fs from 'fs';

const symlinkSync = fs.symlinkSync;

symlinkSync('target.txt', 'symlink.txt');
