
// Import Node.js Dependencies
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

// Import Third-party Dependencies
import { run, bench, group } from "mitata";

// Import Internal Dependencies
import { AstAnalyser } from "../src/index.ts";

// Constants
const EXAMPLES_DIR = resolve(import.meta.dirname, "../examples");

const KILOBYTE = 1024;
const SMALL_THRESHOLD = 10 * KILOBYTE;
const LARGE_THRESHOLD = 50 * KILOBYTE;

interface Fixture {
  name: string;
  content: string;
  size: number;
}

function loadFixtures(): Fixture[] {
  const files = readdirSync(EXAMPLES_DIR);

  return files.map((file) => {
    const path = join(EXAMPLES_DIR, file);
    const content = readFileSync(path, "utf-8");

    return {
      name: file,
      content,
      size: content.length
    };
  });
}

const fixtures = loadFixtures();
const analyser = new AstAnalyser();

function formatFileSize(fixture: Fixture): string {
  return `${fixture.name} - ${(fixture.size / 1024).toFixed(2)}KB`;
}

group("AstAnalyser.analyse()", () => {
  const sortedFixtures = [...fixtures].sort((a, b) => a.size - b.size);

  const smallFixtures = sortedFixtures.filter((f) => f.size < SMALL_THRESHOLD);
  const mediumFixtures = sortedFixtures.filter((f) => f.size >= SMALL_THRESHOLD && f.size < LARGE_THRESHOLD);
  const largeFixtures = sortedFixtures.filter((f) => f.size >= LARGE_THRESHOLD);

  for (const fixture of smallFixtures) {
    bench(`Small File (${formatFileSize(fixture)})`, () => {
      analyser.analyse(fixture.content);
    });
  }

  for (const fixture of mediumFixtures) {
    bench(`Medium File (${formatFileSize(fixture)})`, () => {
      analyser.analyse(fixture.content);
    });
  }

  for (const fixture of largeFixtures) {
    bench(`Large File (${formatFileSize(fixture)})`, () => {
      analyser.analyse(fixture.content);
    })
      // Large files might need GC between runs to be stable
      .gc("inner");
  }
});

group("Obfuscated Code Analysis", () => {
  const obfuscated = fixtures.filter((f) => f.name.includes("obfuscate") || f.name.includes("jscrush"));

  for (const fixture of obfuscated) {
    bench(`${fixture.name}`, () => {
      analyser.analyse(fixture.content);
    });
  }
});

await run();
