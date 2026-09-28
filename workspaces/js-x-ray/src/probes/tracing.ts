// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.ts";
import type {
  SourceTraced,
  TracedIdentifierReport,
  VariableTracer
} from "../VariableTracer.ts";
import { CALL_EXPRESSION_DATA } from "../contants.ts";

export type TraceAllOptions = Omit<SourceTraced, "moduleName">;

/**
 * A member expression whose first segment is the module name it belongs to:
 * "fs.readFileSync", "crypto.createHash.update.digest".
 */
export type ModuleScopedIdentifier = `${string}.${string}`;

function withTracingDefaults({
  followConsecutiveAssignment = true,
  ...options
}: TraceAllOptions): TraceAllOptions {
  return { ...options, followConsecutiveAssignment };
}

/**
 * For global identifiers like Math.random which are never behind an imported module.
 */
export function traceAll(
  tracer: VariableTracer,
  identifiers: Iterable<string>,
  options: TraceAllOptions = {}
): void {
  const tracedOptions = withTracingDefaults(options);

  for (const identifierOrMemberExpr of identifiers) {
    tracer.trace(identifierOrMemberExpr, { ...tracedOptions, moduleName: null });
  }
}

/**
 * For identifiers gated behind the module they start with: "fs.readFileSync"
 */
export function traceAllFromModule(
  tracer: VariableTracer,
  identifiers: Iterable<ModuleScopedIdentifier>,
  options: TraceAllOptions = {}
): Set<string> {
  const tracedOptions = withTracingDefaults(options);
  const modules = new Set<string>();

  for (const identifierOrMemberExpr of identifiers) {
    const moduleName = identifierOrMemberExpr.split(".")[0];
    modules.add(moduleName);

    tracer.trace(identifierOrMemberExpr, { ...tracedOptions, moduleName });
  }

  return modules;
}

export function hasImportedModules(
  ctx: ProbeContext,
  ...moduleNames: string[]
): boolean {
  const { importedModules } = ctx.sourceFile.tracer;

  return moduleNames.every((moduleName) => importedModules.has(moduleName));
}

/**
 * Report of the CallExpression being walked, injected in the probe context by ProbeRunner.
 */
export function getTracedCall(
  ctx: ProbeContext
): TracedIdentifierReport | null {
  return ctx.context?.[CALL_EXPRESSION_DATA] ?? null;
}

/**
 * Match the CallExpression being walked against a set of traced names
 * shaped as a probe validateNode return value.
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
