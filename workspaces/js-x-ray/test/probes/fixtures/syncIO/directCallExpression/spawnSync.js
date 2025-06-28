const { spawnSync } = require("child_process");

spawnSync("ls",["-la", "/home"], {encoding: "utf-8"});
