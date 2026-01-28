
// Import Node.js Dependencies
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

// Import Third-party Dependencies
import { run, bench, group } from "mitata";

// Import Internal Dependencies
import { AstAnalyser } from "../src/index.ts";

// Constants
const EXAMPLES_DIR = resolve(import.meta.dirname, "../examples");

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
  const smallFixture = sortedFixtures[0];
  const mediumFixture = sortedFixtures[Math.floor(sortedFixtures.length / 2)];
  const largeFixture = sortedFixtures[sortedFixtures.length - 1];

  if (smallFixture) {
    bench(`Small File (${formatFileSize(smallFixture)})`, () => {
      analyser.analyse(smallFixture.content);
    });
  }

  if (mediumFixture) {
    bench(`Medium File (${formatFileSize(mediumFixture)})`, () => {
      analyser.analyse(mediumFixture.content);
    });
  }

  if (largeFixture) {
    bench(`Large File (${formatFileSize(largeFixture)})`, () => {
      analyser.analyse(largeFixture.content);
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

await run({
  colors: true
});
