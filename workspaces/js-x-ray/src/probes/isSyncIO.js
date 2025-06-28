// Import Third-party Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";

// Constants
const kTracedNodeCoreModules = ["fs", "crypto", "child_process", "zlib"];
const kSyncIOIdentifierOrMemberExps = [
  "crypto.pbkdf2Sync",
  "crypto.scryptSync",
  "crypto.generateKeyPairSync",
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

function validateNode(node, { tracer }) {
  const id = getCallExpressionIdentifier(node, { tracer });
  if (id === null || !kTracedNodeCoreModules.some((moduleName) => tracer.importedModules.has(moduleName))) {
    return [false];
  }

  const data = tracer.getDataFromIdentifier(id);

  return [data !== null && data.identifierOrMemberExpr.endsWith("Sync")];
}

function initialize(sourceFile) {
  if (sourceFile) {
    kSyncIOIdentifierOrMemberExps.forEach((identifierOrMemberExp) => sourceFile.tracer.trace(identifierOrMemberExp, {
      followConsecutiveAssignment: true,
      moduleName: identifierOrMemberExp.split(".")[0]
    }));
  }
}

function main(node, { sourceFile }) {
  sourceFile.addWarning("synchronous-io", node.callee.name, node.loc);
}

export default {
  name: "isSyncIO",
  validateNode,
  main,
  initialize,
  breakOnMatch: false
};
