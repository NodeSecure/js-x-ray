// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import { getVariableDeclarationIdentifiers } from "./getVariableDeclarationIdentifiers.ts";

export function getParamNames(
  params: ESTree.Node[]
): string[] {
  const names: string[] = [];

  for (const param of params) {
    for (const { assignmentId } of getVariableDeclarationIdentifiers(param)) {
      names.push(assignmentId.name);
    }
  }

  return names;
}
