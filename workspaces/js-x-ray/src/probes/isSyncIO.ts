// Import Third-party Dependencies
import { getCallExpressionIdentifier } from "@nodesecure/estree-ast-utils";
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.js";
import { generateWarning } from "../warnings.js";

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
  node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const { tracer } = ctx.sourceFile;
  const id = getCallExpressionIdentifier(
    node,
    {
      externalIdentifierLookup: (name) => tracer.literalIdentifiers.get(name) ?? null
    }
  );
  if (
    id === null ||
    !kTracedNodeCoreModules.some((moduleName) => tracer.importedModules.has(moduleName))
  ) {
    return [false];
  }

  const data = tracer.getDataFromIdentifier(id);

  return [
    data !== null &&
    data.identifierOrMemberExpr.endsWith("Sync")
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
  breakOnMatch: false
};
