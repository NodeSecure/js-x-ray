// Import Node.js Dependencies
import { writeFileSync } from "node:fs";

// Import Internal Dependencies
import { benchmark } from "./bench.ts";
import { toMarkdown } from "./markdown.ts";

const kReportURL = new URL("report.json", import.meta.url);
const kReportMarkdownURL = new URL("report.md", import.meta.url);

const results = await benchmark();

const relevantResults = {
  timestamp: new Date().toISOString(),
  runtime: results.context.runtime,
  cpu: results.context.cpu,
  benchmarks: results.benchmarks.map(({ runs }) => {
    return {
      ...runs.flatMap((trial) => {
        if (!trial.stats) {
          return [];
        }

        const { samples, debug, ...rest } = trial.stats;

        return {
          ...trial,
          stats: rest
        };
      })[0]
    };
  })
};

writeFileSync(kReportURL, JSON.stringify(relevantResults, null, 2));

// Human-readable snapshot as a Markdown table.
writeFileSync(kReportMarkdownURL, toMarkdown(relevantResults));
