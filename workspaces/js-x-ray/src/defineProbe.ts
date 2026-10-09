// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { Probe, ProbeContextDef } from "./ProbeRunner.ts";

export type ProbeNodeType = ESTree.Node["type"];
export type NodeOfType<K extends ProbeNodeType = ProbeNodeType> = Extract<ESTree.Node, { type: K; }>;

/**
 * Declare a probe while inferring its node types from `nodeTypes`.
 *  @remark
 * `validateNode` receives the matching ESTree node instead of the whole union.
 */
export function defineProbe<
  const K extends ProbeNodeType = ProbeNodeType,
  T extends ProbeContextDef = ProbeContextDef
>(probe: Probe<T, K>): Probe<T> {
  return probe as unknown as Probe<T>;
}
