import crypto from 'crypto';

const pbkdf2Sync = crypto.pbkdf2Sync;

pbkdf2Sync('mypassword', salt, 210000, 64, 'sha512');
