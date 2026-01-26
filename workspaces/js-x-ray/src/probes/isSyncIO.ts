// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import { generateWarning } from "../warnings.ts";

// CONSTANTS
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

  const data = ctx.context?.[CALL_EXPRESSION_DATA];

  return [
    data?.identifierOrMemberExpr.endsWith("Sync")
  ];
}

function initialize(
  ctx: ProbeContext
) {
  kSyncIOIdentifierOrMemberExps.forEach((identifierOrMemberExp) => {
    const moduleName = identifierOrMemberExp.split(".")[0];

    ctx.sourceFile.tracer.trace(identifierOrMemberExp, {
      followConsecutiveAssignment: true,
      moduleName
    });
  });
}

function main(
  node: ESTree.CallExpression,
  ctx: ProbeContext
) {
  const warning = generateWarning("synchronous-io", {
    value: node.callee.name,
    location: node.loc
  });
  ctx.sourceFile.warnings.push(warning);
}

export default {
  name: "isSyncIO",
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};
