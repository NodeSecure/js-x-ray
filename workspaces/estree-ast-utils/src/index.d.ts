// Import Internal Dependencies
import { VariableTracer } from "./utils/VariableTracer";

export { VariableTracer };

export function arrayExpressionToString(
  node: any, options?: { tracer?: VariableTracer }
): IterableIterator<string>;

export function concatBinaryExpression(
  node: any, options?: { tracer?: VariableTracer, stopOnUnsupportedNode?: boolean }
): IterableIterator<string>;

export function getCallExpressionArguments(
  node: any, options?: { tracer?: VariableTracer }
): string[] | null;

export function getCallExpressionIdentifier(
  node: any
): string | null;

export function getMemberExpressionIdentifier(
  node: any, options?: { tracer?: VariableTracer }
): IterableIterator<string>;

export function getVariableDeclarationIdentifiers(
  node: any, options?: { prefix?: string | null }
): IterableIterator<{ name: string; assignmentId: any }>;
