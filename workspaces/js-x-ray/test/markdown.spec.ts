// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Internal Dependencies
import { toMarkdown } from "../benchmark/markdown.ts";

describe("toMarkdown", () => {
  const baseReport = {
    timestamp: "2025-01-15T12:00:00.000Z",
    runtime: "node v24.0.0",
    cpu: { name: "Apple M1", freq: 3.20 }
  };

  test("should render the header section with metadata", () => {
    const md = toMarkdown({ ...baseReport, benchmarks: [] });

    assert.ok(md.startsWith("# Benchmark Report\n"));
    assert.ok(md.includes("- **Timestamp:** 2025-01-15T12:00:00.000Z"));
    assert.ok(md.includes("- **Runtime:** node v24.0.0"));
    assert.ok(md.includes("- **CPU:** Apple M1 (~3.20 GHz)"));
  });

  test("should render the table header and separator rows", () => {
    const md = toMarkdown({ ...baseReport, benchmarks: [] });
    const lines = md.split("\n");

    const headerLine = lines.find((l) => l.startsWith("| Benchmark"));
    assert.ok(headerLine);
    assert.ok(headerLine.includes("heap (avg)"));
    assert.ok(headerLine.includes("gc (avg)"));

    const separatorLine = lines.find((l) => l.startsWith("| ---"));
    assert.ok(separatorLine);
  });

  test("should use — fallback when heap and gc are absent", () => {
    const md = toMarkdown({
      ...baseReport,
      benchmarks: [{
        name: "test-bench",
        stats: {
          min: 100, max: 200, p25: 120, p50: 150,
          p75: 180, p99: 195, p999: 199, avg: 150,
          ticks: 1000
        }
      }]
    });

    const dataLine = md.split("\n").find((l) => l.includes("test-bench"));
    assert.ok(dataLine);

    const cells = dataLine.split("|").map((c) => c.trim()).filter(Boolean);
    // heap (avg) is column 11, gc (avg) is column 12
    assert.strictEqual(cells[10], "—");
    assert.strictEqual(cells[11], "—");
  });

  test("should render heap and gc values when present", () => {
    const md = toMarkdown({
      ...baseReport,
      benchmarks: [{
        name: "test-bench",
        stats: {
          min: 1_000_000, max: 2_000_000,
          p25: 1_200_000, p50: 1_500_000,
          p75: 1_800_000, p99: 1_950_000,
          p999: 1_990_000, avg: 1_500_000,
          ticks: 500,
          heap: { avg: 5_242_880 },
          gc: { avg: 50_000 }
        }
      }]
    });

    const dataLine = md.split("\n").find((l) => l.includes("test-bench"));
    assert.ok(dataLine);

    const cells = dataLine.split("|").map((c) => c.trim()).filter(Boolean);
    assert.strictEqual(cells[10], "5.00 MB");
    assert.strictEqual(cells[11], "50.00 µs");
  });

  test("should render multiple benchmark rows", () => {
    const stats = {
      min: 100, max: 200, p25: 120, p50: 150,
      p75: 180, p99: 195, p999: 199, avg: 150,
      ticks: 1000
    };

    const md = toMarkdown({
      ...baseReport,
      benchmarks: [
        { name: "bench-a", stats },
        { name: "bench-b", stats }
      ]
    });

    const lines = md.split("\n");
    assert.ok(lines.some((l) => l.includes("bench-a")));
    assert.ok(lines.some((l) => l.includes("bench-b")));
  });

  test("should end with a trailing newline", () => {
    const md = toMarkdown({ ...baseReport, benchmarks: [] });

    assert.ok(md.endsWith("\n"));
  });
});
