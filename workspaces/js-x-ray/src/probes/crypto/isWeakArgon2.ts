// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../../ProbeRunner.ts";
import type { VariableTracer } from "../../VariableTracer.ts";
import { CALL_EXPRESSION_DATA } from "../../contants.ts";
import { isStringLiteral, isNumericLiteral, isIdentifier } from "../../estree/types.ts";
import { generateWarning } from "../../warnings.ts";

/**
 * OWASP recommended Argon2 parameter combinations.
 * Each entry is [minMemory (KiB), passes] — every row provides an equal level
 * of defense, trading CPU against RAM. Sorted by ascending passes.
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

const kTracedFunctions = ["crypto.argon2", "crypto.argon2Sync"];

interface Argon2Params {
  memory: number | null;
  passes: number | null;
  nonce: string | null;
}

/**
 * Identify which parameter drags the call below the OWASP recommendations,
 * or null when the combination is acceptable.
 */
function findWeakParam(
  algorithm: string,
  memory: number,
  passes: number
): "memory" | "passes" | null {
  const rows = algorithm === "argon2i" ? kOWASPRowsForArgon2i : kOWASPRows;

  // Rows are sorted by ascending passes, and the memory requirement drops as
  // passes grow. The last usable row is therefore the cheapest one available.
  const row = rows.findLast(([, minPasses]) => passes >= minPasses);
  if (row === undefined) {
    return "passes";
  }

  return memory < row[0] ? "memory" : null;
}

/**
 * Resolve the static name of a property key.
 * Returns null for a computed key built from a variable, since its value is
 * only known at runtime.
 */
function getPropertyName(
  prop: ESTree.Property
): string | null {
  if (!prop.computed && isIdentifier(prop.key)) {
    return prop.key.name;
  }

  return isStringLiteral(prop.key) ? prop.key.value : null;
}

/**
 * Read a string out of a node, following identifiers assigned a string literal.
 * TemplateLiteral assignments are ignored because the tracer stores them with
 * their interpolations replaced by placeholders.
 */
function resolveString(
  node: ESTree.Node | undefined,
  tracer: VariableTracer
): string | null {
  if (isStringLiteral(node)) {
    return node.value;
  }
  if (isIdentifier(node)) {
    const literal = tracer.literalIdentifiers.get(node.name);

    return literal?.type === "Literal" ? literal.value : null;
  }

  return null;
}

/**
 * Read a number out of a node, following identifiers assigned a numeric
 * literal. The tracer stores every literal as a string, hence the conversion.
 */
function resolveNumber(
  node: ESTree.Node | undefined,
  tracer: VariableTracer
): number | null {
  if (isNumericLiteral(node)) {
    return node.value;
  }
  if (isIdentifier(node)) {
    const literal = tracer.literalIdentifiers.get(node.name);
    if (literal?.type !== "Literal") {
      return null;
    }
    const value = Number(literal.value);

    return Number.isNaN(value) ? null : value;
  }

  return null;
}

function extractParams(
  properties: ESTree.ObjectExpression["properties"],
  tracer: VariableTracer
): Argon2Params {
  const params: Argon2Params = { memory: null, passes: null, nonce: null };

  for (const prop of properties) {
    if (prop.type !== "Property") {
      continue;
    }

    switch (getPropertyName(prop)) {
      case "memory":
        params.memory = resolveNumber(prop.value, tracer);
        break;
      case "passes":
        params.passes = resolveNumber(prop.value, tracer);
        break;
      case "nonce":
        params.nonce = resolveString(prop.value, tracer);
        break;
      default:
        break;
    }
  }

  return params;
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
    kTracedFunctions.includes(ctx.context![CALL_EXPRESSION_DATA]?.identifierOrMemberExpr)
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
  const { tracer } = sourceFile;

  const algorithm = resolveString(node.arguments.at(0), tracer);
  if (algorithm === null) {
    return;
  }

  if (algorithm === "argon2d") {
    sourceFile.warnings.push(
      generateWarning("crypto.weak-argon2", {
        value: `weak-algorithm: ${algorithm}`,
        location: node.loc
      })
    );
  }

  const options = node.arguments.at(1);
  if (options?.type !== "ObjectExpression") {
    return;
  }

  const { memory, passes, nonce } = extractParams(options.properties, tracer);

  if (memory !== null && passes !== null) {
    const weakParam = findWeakParam(algorithm, memory, passes);

    if (weakParam !== null) {
      sourceFile.warnings.push(
        generateWarning("crypto.weak-argon2", {
          value: `low-params: ${weakParam}`,
          location: node.loc
        })
      );
    }
  }

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
