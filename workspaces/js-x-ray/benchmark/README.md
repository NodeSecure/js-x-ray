# Benchmarks

This utility helps measure and track the performance of `js-x-ray` using [mitata](https://github.com/evanwashere/mitata).

## Running Benchmarks

1. Ensure you are in the workspace directory:
   ```bash
   cd workspaces/js-x-ray
   ```

2. Run the benchmark script:
   ```bash
   npm run bench
   ```

## Structure

- **`index.ts`**: Main entry point that sets up and runs the benchmarks.
- **`fixtures.ts`**: Loads representative code samples from the `examples` directory.

## Current Baseline (Example)

| File Type | Size | Average Time |
|-----------|------|--------------|
| Small (jscrush.js) | ~1KB | ~4ms |
| Medium (event-stream.js) | ~4KB | ~24ms |
| Large (obfuscate.js) | ~90KB | ~865ms |

> Note: Large files are run with `gc("inner")` to ensure memory stability.
