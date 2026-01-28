
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface Fixture {
  name: string;
  content: string;
  size: number;
}

const __dirname = typeof import.meta.dirname === "string" 
  ? import.meta.dirname 
  : fileURLToPath(new URL(".", import.meta.url));

const EXAMPLES_DIR = resolve(__dirname, "../examples");

export function loadFixtures(): Fixture[] {
  const files = readdirSync(EXAMPLES_DIR);
  
  return files
    .filter(file => file.endsWith(".js"))
    .map(file => {
      const path = join(EXAMPLES_DIR, file);
      const content = readFileSync(path, "utf-8");
      
      return {
        name: file,
        content,
        size: content.length
      };
    })
    .sort((a, b) => a.size - b.size);
}
