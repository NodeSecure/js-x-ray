// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.ts";
import { getTracedCall, moduleNameOf, traceAll } from "./tracing.ts";

// CONSTANTS
const kTracedNodeCoreModules = ["fs", "crypto", "child_process", "zlib"];
const kSyncIOIdentifierOrMemberExps = [
  "crypto.pbkdf2Sync",
  "crypto.scryptSync",
  "crypto.generateKeyPairSync",
  "crypto.generateKeySync",
  "crypto.hkdfSync",
  "crypto.randomFillSync",
  "crypto.checkPrimeSync",
  "crypto.argon2Sync",
  "fs.readFileSync",
  "fs.writeFileSync",
  "fs.appendFileSync",
  "fs.readSync",
  "fs.writeSync",
  "fs.readdirSync",
  "fs.statSync",
  "fs.mkdirSync",
  "fs.renameSync",
  "fs.unlinkSync",
  "fs.symlinkSync",
  "fs.openSync",
  "fs.fstatSync",
  "fs.linkSync",
  "fs.realpathSync",
  "child_process.execSync",
  "child_process.spawnSync",
  "child_process.execFileSync",
  "zlib.deflateSync",
  "zlib.inflateSync",
  "zlib.gzipSync",
  "zlib.gunzipSync",
  "zlib.brotliCompressSync",
  "zlib.brotliDecompressSync"
];

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const { tracer } = ctx.sourceFile;

  if (
    !kTracedNodeCoreModules.some((moduleName) => tracer.importedModules.has(moduleName))
  ) {
    return [false];
  }

  return [
    getTracedCall(ctx)?.identifierOrMemberExpr.endsWith("Sync") ?? false
  ];
}

function initialize(
  ctx: ProbeContext
) {
  traceAll(ctx.sourceFile.tracer, kSyncIOIdentifierOrMemberExps, {
    moduleName: moduleNameOf
  });
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeContext
) {
  ctx.sourceFile.addWarning("synchronous-io", {
    value: node.callee.name,
    location: node.loc
  });
}

export default {
  name: "isSyncIO",
  nodeTypes: ["CallExpression"],
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};
