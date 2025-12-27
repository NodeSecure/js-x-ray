// Import Internal Dependencies
import { Deobfuscate } from "./deobfuscate.ts";
import {
  PipelineRunner,
  type Pipeline
} from "./Runner.class.ts";

export const Pipelines = Object.freeze({
  deobfuscate: Deobfuscate
}) satisfies Record<string, new() => Pipeline>;

export { PipelineRunner };
export type { Pipeline };

