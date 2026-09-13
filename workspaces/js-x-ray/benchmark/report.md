# Benchmark Report

- **Timestamp:** 2026-09-13T01:55:04.035Z
- **Runtime:** node
- **CPU:** AMD EPYC 9V74 80-Core Processor (~3.52 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 153.53 µs | 1.23 ms | 177.23 µs | 199.61 µs | 289.76 µs | 537.11 µs | 944.87 µs | 239.96 µs | 2902 | 257.08 KB | — |
| Small File (npm-audit.js - 1.46KB) | 404.85 µs | 1.89 ms | 451.01 µs | 482.82 µs | 610.58 µs | 1.09 ms | 1.66 ms | 554.62 µs | 1256 | 407.38 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.21 ms | 2.87 ms | 1.26 ms | 1.34 ms | 1.64 ms | 2.43 ms | 2.64 ms | 1.49 ms | 466 | 718.73 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.08 ms | 4.23 ms | 1.14 ms | 1.20 ms | 1.48 ms | 2.64 ms | 3.55 ms | 1.35 ms | 514 | 705.85 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.20 ms | 2.96 ms | 1.28 ms | 1.42 ms | 1.64 ms | 2.54 ms | 2.89 ms | 1.51 ms | 459 | 882.49 KB | — |
| Small File (modrrnize.js - 9.28KB) | 789.83 µs | 3.17 ms | 855.81 µs | 906.63 µs | 1.12 ms | 1.64 ms | 2.53 ms | 1.00 ms | 694 | 754.25 KB | — |
| Small File (smith.js - 9.28KB) | 803.86 µs | 2.36 ms | 871.55 µs | 967.79 µs | 1.14 ms | 1.65 ms | 2.28 ms | 1.02 ms | 679 | 752.81 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 1.70 ms | 3.85 ms | 1.77 ms | 1.89 ms | 2.12 ms | 3.32 ms | 3.67 ms | 2.01 ms | 344 | 1.33 MB | — |
| Large File (obfuscate.js - 89.57KB) | 60.98 ms | 68.04 ms | 64.06 ms | 66.30 ms | 67.10 ms | 67.70 ms | 67.70 ms | 65.70 ms | 12 | 31.66 MB | 13.16 ms |
| jscrush.js | 169.06 µs | 976.91 µs | 193.69 µs | 215.53 µs | 295.31 µs | 540.80 µs | 773.15 µs | 253.24 µs | 2756 | 255.69 KB | — |
| obfuscate.js | 37.76 ms | 47.75 ms | 39.31 ms | 40.96 ms | 41.50 ms | 45.49 ms | 45.49 ms | 40.99 ms | 13 | 20.21 MB | — |
