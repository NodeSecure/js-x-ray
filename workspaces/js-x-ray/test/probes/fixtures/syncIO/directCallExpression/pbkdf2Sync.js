const { pbkdf2Sync } = require("crypto");

pbkdf2Sync('mypassword', 'mysalt', 100000, 64, 'sha512');
