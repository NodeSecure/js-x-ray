import fs from 'fs';

const readSync = fs.readSync;

readSync(1,new Buffer.from("str"), 10, 2);