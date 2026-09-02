# Benchmark Report

- **Timestamp:** 2026-08-30T02:15:11.127Z
- **Runtime:** node
- **CPU:** AMD EPYC 7763 64-Core Processor (~3.06 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 239.51 µs | 1.32 ms | 266.37 µs | 297.00 µs | 368.36 µs | 780.14 µs | 1.24 ms | 350.74 µs | 1982 | 271.53 KB | — |
| Small File (npm-audit.js - 1.46KB) | 605.33 µs | 2.15 ms | 665.29 µs | 697.53 µs | 800.11 µs | 1.60 ms | 1.88 ms | 796.93 µs | 873 | 461.71 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.84 ms | 6.16 ms | 1.93 ms | 2.03 ms | 2.48 ms | 4.20 ms | 5.87 ms | 2.30 ms | 298 | 745.40 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.55 ms | 5.99 ms | 1.66 ms | 2.00 ms | 2.11 ms | 3.56 ms | 3.75 ms | 2.02 ms | 340 | 715.99 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.70 ms | 6.18 ms | 1.85 ms | 2.17 ms | 2.33 ms | 3.93 ms | 5.10 ms | 2.23 ms | 308 | 945.86 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.14 ms | 3.99 ms | 1.21 ms | 1.28 ms | 1.54 ms | 2.43 ms | 3.31 ms | 1.40 ms | 494 | 761.60 KB | — |
| Small File (smith.js - 9.28KB) | 1.14 ms | 3.22 ms | 1.21 ms | 1.27 ms | 1.54 ms | 2.38 ms | 2.86 ms | 1.41 ms | 490 | 773.66 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.32 ms | 6.10 ms | 2.42 ms | 2.53 ms | 2.94 ms | 5.14 ms | 5.45 ms | 2.79 ms | 246 | 1.36 MB | — |
| Large File (obfuscate.js - 89.57KB) | 84.56 ms | 92.78 ms | 87.68 ms | 88.86 ms | 90.96 ms | 91.49 ms | 91.49 ms | 88.84 ms | 9 | 31.40 MB | 14.18 ms |
| jscrush.js | 268.50 µs | 2.24 ms | 306.37 µs | 337.66 µs | 403.09 µs | 857.14 µs | 1.47 ms | 387.44 µs | 1790 | 277.22 KB | — |
| obfuscate.js | 49.00 ms | 69.85 ms | 50.69 ms | 51.76 ms | 54.54 ms | 57.19 ms | 57.19 ms | 54.34 ms | 9 | 20.93 MB | — |
