// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../../ProbeRunner.ts";
import { CALL_EXPRESSION_DATA } from "../../contants.ts";
import { isStringLiteral, isNumericLiteral, isIdentifier } from "../../estree/types.ts";
import { generateWarning } from "../../warnings.ts";

/**
 * OWASP recommended Argon2 parameter combinations.
 * Each entry is [minMemory (KiB), passes] — every row provides an equal level
 * of defense, trading CPU against RAM.
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
 */
const kOWASPRows: [minMemory: number, passes: number][] = [
  [47104, 1],
  [19456, 2],
  [12288, 3],
  [9216, 4],
  [7168, 5]
];

/**
 * The two lowest-pass rows are flagged "(Do not use with Argon2i)" by OWASP.
 * Argon2i is data-independent and therefore weaker against time-memory
 * trade-off attacks, which additional passes mitigate.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9106.html#section-7.3
 */
const kOWASPRowsForArgon2i = kOWASPRows.filter(([, passes]) => passes >= 3);

// @see https://www.rfc-editor.org/rfc/rfc9106.html#section-3.1
const kMinNonceLength = 16;

const kTracedFunctions = new Set(["crypto.argon2", "crypto.argon2Sync"]);

function isWeakParams(
  algorithm: string,
  memory: number,
  passes: number
): boolean {
  const rows = algorithm === "argon2i" ? kOWASPRowsForArgon2i : kOWASPRows;

  return !rows.some(
    ([minMemory, minPasses]) => passes >= minPasses && memory >= minMemory
  );
}

function getPropertyName(
  prop: ESTree.Property
): string | null {
  if (!prop.computed && isIdentifier(prop.key)) {
    return prop.key.name;
  }

  return isStringLiteral(prop.key) ? prop.key.value : null;
}

function extractNumericParam(
  properties: ESTree.Property[],
  name: string
): number | null {
  for (const prop of properties) {
    if (getPropertyName(prop) === name && isNumericLiteral(prop.value)) {
      return prop.value.value;
    }
  }

  return null;
}

function extractStringParam(
  properties: ESTree.Property[],
  name: string
): string | null {
  for (const prop of properties) {
    if (getPropertyName(prop) === name && isStringLiteral(prop.value)) {
      return prop.value.value;
    }
  }

  return null;
}

function validateNode(
  _node: ESTree.Node,
  ctx: ProbeContext
): [boolean, any?] {
  const { tracer } = ctx.sourceFile;

  if (!tracer.importedModules.has("crypto")) {
    return [false];
  }

  return [
    kTracedFunctions.has(ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr)
  ];
}

function initialize(ctx: ProbeContext) {
  const { tracer } = ctx.sourceFile;

  for (const identifierOrMemberExpr of kTracedFunctions) {
    tracer.trace(identifierOrMemberExpr, {
      followConsecutiveAssignment: true,
      moduleName: "crypto"
    });
  }
}

function main(node: ESTree.CallExpression, ctx: ProbeContext) {
  const { sourceFile } = ctx;
  const algorithm = node.arguments.at(0);
  const options = node.arguments.at(1);

  if (!isStringLiteral(algorithm)) {
    return;
  }

  if (algorithm.value === "argon2d") {
    sourceFile.warnings.push(
      generateWarning("crypto.weak-argon2", {
        value: "weak-algorithm",
        location: node.loc
      })
    );
  }

  if (options?.type !== "ObjectExpression") {
    return;
  }

  const properties = options.properties.filter(
    (prop): prop is ESTree.Property => prop.type === "Property"
  );

  const memory = extractNumericParam(properties, "memory");
  const passes = extractNumericParam(properties, "passes");

  if (
    memory !== null &&
    passes !== null &&
    isWeakParams(algorithm.value, memory, passes)
  ) {
    sourceFile.warnings.push(
      generateWarning("crypto.weak-argon2", {
        value: "low-params",
        location: node.loc
      })
    );
  }

  const nonce = extractStringParam(properties, "nonce");
  if (nonce !== null) {
    sourceFile.warnings.push(
      generateWarning("crypto.weak-argon2", {
        value: nonce.length < kMinNonceLength ? "short-nonce" : "hardcoded-nonce",
        location: node.loc
      })
    );
  }
}

export default {
  name: "isWeakArgon2",
  nodeTypes: ["CallExpression"],
  validateNode,
  main,
  initialize,
  breakOnMatch: false,
  context: {}
};
