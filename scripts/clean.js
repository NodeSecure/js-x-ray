/* eslint-disable no-undef */
// Import Node.js Dependencies
const  { glob, rm } = require("node:fs/promises");

async function clean() {
    try {
      const dirs = [];
      for await (const dir of glob('workspaces/**/dist', { 
        onlyDirectories: true,
      })) {
        dirs.push(dir);
      }
      for(const dir of dirs){
        await rm(dir, { recursive: true, force: true });
        console.log(`Removed directory ${dir}`);
      }
    } catch (err) {
      console.warn('Error removing dist directories:', err.message);
    }

    try {
      const files = [];
      for await (const file of glob('workspaces/**/tsconfig.tsbuildinfo')) {
        files.push(file);
      }
      for (const file of files) {
        await rm(file, { force: true });
        console.log(`Removed file ${file}`);
      }
    } catch (err) {
      console.warn('Error removing tsconfig.tsbuildinfo files:', err.message);
    }
    console.log('Clean completed');
}

clean();