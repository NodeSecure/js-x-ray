// Import Third-party Dependencies
import type { ESTree } from "meriyah";

export interface Pipeline {
  name: string;

  walk(
    body: ESTree.Program["body"]
  ): ESTree.Program["body"];
}

export class PipelineRunner {
  #pipelines: Pipeline[];

  constructor(
    pipelines: Pipeline[]
  ) {
    this.#pipelines = removeDuplicatedPipelines(pipelines);
  }

  reduce(
    initialBody: ESTree.Program["body"]
  ): ESTree.Program["body"] {
    return this.#pipelines.reduce(
      (body, pipeline) => pipeline.walk(body),
      initialBody
    );
  }
}

function removeDuplicatedPipelines(
  pipelines: Pipeline[]
): Pipeline[] {
  const seen = new Set<string>();

  return pipelines.filter((pipeline) => {
    if (seen.has(pipeline.name)) {
      return false;
    }
    seen.add(pipeline.name);

    return true;
  });
}
