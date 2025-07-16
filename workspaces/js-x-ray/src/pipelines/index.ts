// Import Internal Dependencies
import { Deobfuscate } from "./deobfuscate.js";
import {
  PipelineRunner,
  type Pipeline
} from "./Runner.class.js";

export const Pipelines = Object.freeze({
  deobfuscate: Deobfuscate
}) satisfies Record<string, new() => Pipeline>;

export { PipelineRunner };
export type { Pipeline };
