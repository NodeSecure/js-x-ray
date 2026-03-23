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
  "debug@4.4.3",
  "chokidar@5.0.0",
  "glob@13.0.6",
  "regexp-tree@0.1.27",
  "pino-std-serializers@7.1.0"
];

await using tmpDir = await fs.mkdtempDisposable(
  path.join(os.tmpdir(), "nodesecure-")
);

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
