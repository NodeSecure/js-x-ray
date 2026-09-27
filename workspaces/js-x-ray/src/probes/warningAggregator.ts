// Import Third-party Dependencies
import type { ESTree } from "meriyah";

// Import Internal Dependencies
import type { ProbeContext } from "../ProbeRunner.ts";
import {
  rootLocation,
  toArrayLocation,
  type SourceArrayLocation
} from "../utils/toArrayLocation.ts";
import { generateWarning, type WarningName } from "../warnings.ts";

/**
 * Probe context shape for probes reporting one warning per analysed file
 * rather than one warning per node.
 */
export type AggregatedLocations = Record<string, SourceArrayLocation[]>;

export function collectLocation(
  ctx: ProbeContext<AggregatedLocations>,
  value: string,
  location: ESTree.SourceLocation | null | undefined
): void {
  const locations = ctx.context!;
  const arrayLocation = toArrayLocation(location ?? rootLocation());
  const collected = locations[value];

  if (collected) {
    collected.push(arrayLocation);
  }
  else {
    locations[value] = [arrayLocation];
  }
}

export interface PushAggregatedWarningOptions {
  formatValue?: (value: string) => string;
}

/**
 * Emit a single warning gathering every collected value and location.
 */
export function pushAggregatedWarning(
  ctx: ProbeContext<AggregatedLocations>,
  kind: WarningName,
  options: PushAggregatedWarningOptions = {}
): void {
  const { sourceFile, context: locations } = ctx;
  const { formatValue } = options;

  if (!locations) {
    return;
  }

  const values = Object.keys(locations);
  if (values.length === 0) {
    return;
  }

  const warning = generateWarning(kind, {
    value: (formatValue ? values.map(formatValue) : values).join(", ")
  });

  sourceFile.warnings.push({
    ...warning,
    location: Object.values(locations).flat()
  });
}
