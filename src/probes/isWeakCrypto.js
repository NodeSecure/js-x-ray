// CONSTANTS
const kWeakAlgorithms = new Set(["md5", "sha1", "ripemd160", "md4", "md2"]);

function validateNode(node) {
  const isCallExpression = node.type === "CallExpression";
  const isSimpleIdentifier = isCallExpression &&
    node.callee.type === "Identifier" &&
    node.callee.name === "createHash";
  const isMemberExpression = isCallExpression &&
    node.callee.type === "MemberExpression" &&
    node.callee.property.name === "createHash";

  return [isSimpleIdentifier || isMemberExpression];
}

function main(node, { analysis }) {
  const arg = node.arguments.at(0);
  const isCryptoImported = analysis.dependencies.has("crypto");

  if (
    kWeakAlgorithms.has(arg.value) &&
    isCryptoImported
  ) {
    analysis.addWarning("weak-crypto", arg.value, node.loc);
  }
}

export default {
  name: "isWeakCrypto",
  validateNode, main, breakOnMatch: false
};
