// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.ts";
import type {
  SourceTraced,
  TracedIdentifierReport,
  VariableTracer
} from "../VariableTracer.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";

export interface TraceAllOptions extends Omit<SourceTraced, "moduleName"> {
  /**
   * Either a fixed module name shared by every identifier, or a callback
   * deriving it from the identifier itself (e.g. "fs.readFileSync" -> "fs").
   */
  moduleName?: string | ((identifierOrMemberExpr: string) => string);
}

/**
 * Trace a whole set of identifiers (or member expressions) at once.
 *
 * Unlike {@link VariableTracer.trace}, `followConsecutiveAssignment` defaults
 * to true because probes virtually always want to follow aliases.
 */
export function traceAll(
  tracer: VariableTracer,
  identifiers: Iterable<string>,
  options: TraceAllOptions = {}
): void {
  const {
    moduleName,
    followConsecutiveAssignment = true,
    ...tracedOptions
  } = options;

  for (const identifierOrMemberExpr of identifiers) {
    tracer.trace(identifierOrMemberExpr, {
      ...tracedOptions,
      followConsecutiveAssignment,
      moduleName: typeof moduleName === "function" ?
        moduleName(identifierOrMemberExpr) :
        moduleName
    });
  }
}

/**
 * Derive the module name from a traced member expression.
 *
 * @example
 * "child_process.execSync" // => "child_process"
 */
export function moduleNameOf(
  identifierOrMemberExpr: string
): string {
  return identifierOrMemberExpr.split(".")[0];
}

/**
 * Report of the CallExpression being walked, injected in the probe context by
 * ProbeRunner. Null when the current node is not a traced CallExpression.
 */
export function getTracedCall(
  ctx: ProbeContext
): TracedIdentifierReport | null {
  return ctx.context?.[CALL_EXPRESSION_DATA] ?? null;
}

/**
 * Whether every given module is actually imported by the analysed file.
 * Used by probes as a cheap guard before any deeper inspection.
 */
export function hasImportedModules(
  ctx: ProbeContext,
  ...moduleNames: string[]
): boolean {
  const { importedModules } = ctx.sourceFile.tracer;

  return moduleNames.every((moduleName) => importedModules.has(moduleName));
}

/**
 * Match the CallExpression being walked against a set of traced names,
 * shaped as a probe `validateNode` return value.
 */
export function matchTracedCall(
  ctx: ProbeContext,
  names: ReadonlySet<string>
): [boolean, string?] {
  const identifierOrMemberExpr = getTracedCall(ctx)?.identifierOrMemberExpr;

  return identifierOrMemberExpr !== undefined && names.has(identifierOrMemberExpr) ?
    [true, identifierOrMemberExpr] :
    [false];
}
