const { scryptSync } = require("crypto");

scryptSync('mypassword', 'mysalt', 64);
