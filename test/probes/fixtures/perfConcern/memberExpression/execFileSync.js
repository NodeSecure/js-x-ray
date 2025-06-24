import child_process from "child_process";

const execFileSync = child_process.execFileSync;

execFileSync('node', ['--version'], { encoding: 'utf8' });