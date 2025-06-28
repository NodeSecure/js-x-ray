import fs from 'fs';

const unlinkSync = fs.unlinkSync;

unlinkSync('./someFile.txt');
