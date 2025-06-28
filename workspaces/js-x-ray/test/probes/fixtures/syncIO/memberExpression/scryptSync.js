import crypto from 'crypto';

const scryptSync = crypto.scryptSync;

scryptSync('mypassword', 'mysalt', 64);
