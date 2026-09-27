// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext, ProbeMainContext } from "../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";
import { generateWarning } from "../warnings.ts";

// CONSTANTS
const kSyncIOIdentifierOrMemberExps = new Set([
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
]);

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const data = ctx.context?.[CALL_EXPRESSION_DATA];
  const identifierOrMemberExpr = data?.identifierOrMemberExpr;

  if (
    identifierOrMemberExpr === undefined
    || !kSyncIOIdentifierOrMemberExps.has(identifierOrMemberExpr)
  ) {
    return [false];
  }

  return [true, identifierOrMemberExpr];
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
  ctx: ProbeMainContext
) {
  const [, methodName] = (ctx.data as string).split(".");

  const warning = generateWarning("synchronous-io", {
    value: methodName,
    location: node.loc
  });
  ctx.sourceFile.warnings.push(warning);
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
