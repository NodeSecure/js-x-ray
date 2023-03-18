// Import Node.js Dependencies
import fs from "node:fs/promises";

async function* findTestFiles(url) {
  for await (const dirent of await fs.opendir(url)) {
    if (dirent.name === "node_modules" || dirent.name.startsWith(".")) {
      continue;
    }

    if (dirent.isDirectory()) {
      yield* findTestFiles(new URL(`${dirent.name}/`, url));
    }
    else if (dirent.name.endsWith(".spec.js")) {
      yield new URL(dirent.name, url);
    }
  }
}

for await (const file of findTestFiles(new URL("../", import.meta.url))) {
  await import(file);
}
