const { pbkdf2Sync } = require("crypto");

pbkdf2Sync('mypassword', salt, 210000, 64, 'sha512');
