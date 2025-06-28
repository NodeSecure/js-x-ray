import child_process from "child_process";

const spawnSync = child_process.spawnSync;

spawnSync("ls",["-la", "/home"], {encoding: "utf-8"});
