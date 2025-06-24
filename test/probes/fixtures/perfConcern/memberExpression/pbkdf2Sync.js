import crypto from 'crypto';

const pbkdf2Sync = crypto.pbkdf2Sync;

pbkdf2Sync('mypassword', 'mysalt', 100000, 64, 'sha512');
