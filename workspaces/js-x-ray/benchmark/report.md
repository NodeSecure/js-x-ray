# Benchmark Report

- **Timestamp:** 2026-07-26T01:45:17.718Z
- **Runtime:** node
- **CPU:** AMD EPYC 7763 64-Core Processor (~3.05 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 231.88 µs | 1.18 ms | 266.31 µs | 298.19 µs | 420.77 µs | 741.17 µs | 1.05 ms | 351.41 µs | 1978 | 263.94 KB | — |
| Small File (npm-audit.js - 1.46KB) | 603.96 µs | 2.02 ms | 655.90 µs | 708.54 µs | 1.01 ms | 1.50 ms | 1.91 ms | 829.23 µs | 839 | 452.19 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.78 ms | 4.03 ms | 1.87 ms | 1.95 ms | 2.32 ms | 3.53 ms | 3.99 ms | 2.16 ms | 319 | 694.57 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.48 ms | 4.11 ms | 1.60 ms | 1.79 ms | 2.01 ms | 3.51 ms | 4.06 ms | 1.90 ms | 364 | 715.91 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.66 ms | 4.11 ms | 1.77 ms | 2.07 ms | 2.22 ms | 3.83 ms | 4.05 ms | 2.09 ms | 328 | 900.84 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.10 ms | 3.12 ms | 1.17 ms | 1.23 ms | 1.45 ms | 2.31 ms | 3.06 ms | 1.34 ms | 519 | 757.19 KB | — |
| Small File (smith.js - 9.28KB) | 1.10 ms | 3.09 ms | 1.17 ms | 1.23 ms | 1.44 ms | 2.30 ms | 2.96 ms | 1.33 ms | 519 | 751.26 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.28 ms | 5.96 ms | 2.37 ms | 2.67 ms | 2.79 ms | 5.03 ms | 5.19 ms | 2.72 ms | 252 | 1.33 MB | — |
| Large File (obfuscate.js - 89.57KB) | 77.22 ms | 89.04 ms | 82.35 ms | 86.43 ms | 87.79 ms | 88.10 ms | 88.10 ms | 84.88 ms | 9 | 31.05 MB | 14.26 ms |
| jscrush.js | 261.36 µs | 1.33 ms | 295.93 µs | 324.19 µs | 395.13 µs | 752.65 µs | 1.16 ms | 373.82 µs | 1862 | 269.20 KB | — |
| obfuscate.js | 44.45 ms | 63.43 ms | 45.07 ms | 47.02 ms | 50.24 ms | 59.21 ms | 59.21 ms | 50.57 ms | 10 | 20.20 MB | — |
