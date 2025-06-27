const { execFileSync } = require("child_process");

execFileSync('node', ['--version'], { encoding: 'utf8' });
