const { networkInterfaces } = require("os");

const stringify = JSON.stringify;

stringify(networkInterfaces());
