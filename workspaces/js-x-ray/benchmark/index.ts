
import { run, bench, group } from "mitata";
import { AstAnalyser } from "../src/index.ts";
import { loadFixtures } from "./fixtures.ts";

// Initialize
const fixtures = loadFixtures();
const analyser = new AstAnalyser();

// Benchmark Group: analyse() method
group("AstAnalyser.analyse()", () => {
  // 1. Benchmark setup for different file sizes
  const smallFixture = fixtures.find(f => f.name === "jquery.min.js") || fixtures[0]; // Fallback to smallest
  const mediumFixture = fixtures.find(f => f.name === "event-stream.js"); 
  const largeFixture = fixtures.find(f => f.name === "obfuscate.js");

  if (smallFixture) {
    bench(`Small File (${smallFixture.name} - ${(smallFixture.size / 1024).toFixed(2)}KB)`, () => {
      analyser.analyse(smallFixture.content);
    });
  }

  if (mediumFixture) {
    bench(`Medium File (${mediumFixture.name} - ${(mediumFixture.size / 1024).toFixed(2)}KB)`, () => {
      analyser.analyse(mediumFixture.content);
    });
  }

  if (largeFixture) {
    bench(`Large File (${largeFixture.name} - ${(largeFixture.size / 1024).toFixed(2)}KB)`, () => {
      analyser.analyse(largeFixture.content);
    }).gc("inner"); // Large files might need GC between runs to be stable
  }
});

// Benchmark Group: Obfuscated Code
group("Obfuscated Code Analysis", () => {
  const obfuscated = fixtures.filter(f => f.name.includes("obfuscate") || f.name.includes("jscrush"));
  
  for (const fixture of obfuscated) {
    bench(`${fixture.name}`, () => {
      analyser.analyse(fixture.content);
    });
  }
});

// Run benchmarks
await run({
  colors: true
});
