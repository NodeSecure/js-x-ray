// Import Node.js Dependencies
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";

// Import Third-party Dependencies
import pacote from "pacote";
import {
  ManifestManager,
  type LocatedManifestManager
} from "@nodesecure/mama";

// Import Internal Dependencies
import {
  AstAnalyser,
  EntryFilesAnalyser,
  DefaultCollectableSet,
  type ReportOnEntryFile
} from "../src/index.ts";

// CONSTANTS
const kNpmToken = typeof process.env.NODE_SECURE_TOKEN === "string" ?
  { token: process.env.NODE_SECURE_TOKEN } :
  {};
const kPackageSpecs = [
  "typescript@5.9.3",
  "vis-network@10.0.2",
  "vis-data@8.0.3",
  "glob@13.0.6",
  "@nodesecure/js-x-ray@14.1.0",
  "pino-pretty@13.1.3",
  "@typescript-eslint/typescript-estree@8.57.0",
  "semver@7.7.4",
  "highlight.js@11.11.1",
  "markdown-it@14.1.1",
  "@lit/reactive-element@2.1.2",
  "puppeteer-core@24.37.2",
  "undici@7.24.4"
];

await using tmpDir = await fs.mkdtempDisposable(
  path.join(os.tmpdir(), "nodesecure-")
);

console.time("total");
for (const spec of kPackageSpecs) {
  const mama = await extractAndResolve(
    tmpDir.path,
    spec
  );
  if (!ManifestManager.isLocated(mama)) {
    continue;
  }

  console.time(spec);
  const report = await iterateEntries(
    mama
  );
  console.timeEnd(spec);
  console.log(`number of files: ${report.length}`);
}
console.timeEnd("total");

async function iterateEntries(
  manifest: LocatedManifestManager
): Promise<ReportOnEntryFile[]> {
  const { location } = manifest;
  const entries = Array.from(manifest.getEntryFiles());

  const astAnalyzer = new AstAnalyser({
    collectables: [
      new DefaultCollectableSet("dependency")
    ]
  });

  const efa = new EntryFilesAnalyser({
    astAnalyzer,
    rootPath: location,
    ignoreENOENT: true
  });

  const absoluteEntryFiles = entries.map(
    (filePath) => path.join(location, filePath)
  );

  const report: ReportOnEntryFile[] = [];
  for await (const fileReport of efa.analyse(absoluteEntryFiles)) {
    report.push(fileReport);
  }

  return report;
}

async function extractAndResolve(
  location: string,
  spec: string
): Promise<ManifestManager> {
  const tarballLocation = path.join(
    location,
    spec.replaceAll("/", "_")
  );

  await pacote.extract(
    spec,
    tarballLocation,
    {
      ...kNpmToken,
      cache: `${os.homedir()}/.npm`
    }
  );

  return ManifestManager.fromPackageJSON(
    tarballLocation
  );
}
