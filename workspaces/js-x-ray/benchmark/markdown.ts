const KB = 1_024;
const MB = 1_024 ** 2;
const GB = 1_024 ** 3;

export interface BenchmarkReport {
  timestamp: string;
  runtime: string;
  cpu: { name: string; freq: number; };
  benchmarks: Array<{
    name: string;
    stats: {
      min: number;
      max: number;
      p25: number;
      p50: number;
      p75: number;
      p99: number;
      p999: number;
      avg: number;
      ticks: number;
      heap?: { avg: number; };
      gc?: { avg: number; };
    };
  }>;
}

/**
 * mitata reports timings in nanoseconds. Picks the most readable unit.
 */
export function formatDuration(nanoseconds: number): string {
  if (nanoseconds < 1_000) {
    return `${nanoseconds.toFixed(2)} ns`;
  }
  if (nanoseconds < 1_000_000) {
    return `${(nanoseconds / 1_000).toFixed(2)} µs`;
  }
  if (nanoseconds < 1_000_000_000) {
    return `${(nanoseconds / 1_000_000).toFixed(2)} ms`;
  }

  return `${(nanoseconds / 1_000_000_000).toFixed(2)} s`;
}

/**
 * heap stats are reported in bytes.
 */
export function formatBytes(bytes: number): string {
  if (bytes < KB) {
    return `${bytes.toFixed(0)} B`;
  }
  if (bytes < MB) {
    return `${(bytes / KB).toFixed(2)} KB`;
  }
  if (bytes < GB) {
    return `${(bytes / MB).toFixed(2)} MB`;
  }

  return `${(bytes / GB).toFixed(2)} GB`;
}

export function toMarkdown(report: BenchmarkReport): string {
  const header = [
    "Benchmark", "min", "max", "p25", "p50", "p75", "p99", "p999", "avg", "samples", "heap (avg)", "gc (avg)"
  ];

  const lines = [
    "# Benchmark Report",
    "",
    `- **Timestamp:** ${report.timestamp}`,
    `- **Runtime:** ${report.runtime}`,
    `- **CPU:** ${report.cpu.name} (~${report.cpu.freq.toFixed(2)} GHz)`,
    "",
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`
  ];

  for (const { name, stats } of report.benchmarks) {
    const row = [
      name,
      formatDuration(stats.min),
      formatDuration(stats.max),
      formatDuration(stats.p25),
      formatDuration(stats.p50),
      formatDuration(stats.p75),
      formatDuration(stats.p99),
      formatDuration(stats.p999),
      formatDuration(stats.avg),
      String(stats.ticks),
      stats.heap ? formatBytes(stats.heap.avg) : "—",
      stats.gc ? formatDuration(stats.gc.avg) : "—"
    ];

    lines.push(`| ${row.join(" | ")} |`);
  }

  return lines.join("\n") + "\n";
}
