const { cpus } = require("os");

const stringify = JSON.stringify;

stringify(cpus());
