const { getServers } = require("dns");

const stringify = JSON.stringify;

stringify(getServers());
