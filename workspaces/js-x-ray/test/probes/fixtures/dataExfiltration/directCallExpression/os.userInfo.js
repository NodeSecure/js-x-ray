const { userInfo } = require("os");

const stringify = JSON.stringify;

stringify(userInfo());
