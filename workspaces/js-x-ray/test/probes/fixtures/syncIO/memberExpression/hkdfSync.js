import crypto from 'crypto';

const hkdfSync = crypto.hkdfSync;

hkdfSync('sha512', 'key', 'salt', 'info', 64);

