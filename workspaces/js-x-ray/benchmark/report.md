# Benchmark Report

- **Timestamp:** 2026-09-20T02:12:26.643Z
- **Runtime:** node
- **CPU:** AMD EPYC 7763 64-Core Processor (~3.07 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 239.50 µs | 1.12 ms | 266.18 µs | 295.30 µs | 360.21 µs | 808.08 µs | 998.42 µs | 345.10 µs | 2015 | 270.49 KB | — |
| Small File (npm-audit.js - 1.46KB) | 612.26 µs | 2.31 ms | 659.80 µs | 703.65 µs | 920.94 µs | 1.60 ms | 1.87 ms | 828.41 µs | 839 | 444.83 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.86 ms | 5.87 ms | 2.10 ms | 2.54 ms | 3.04 ms | 4.90 ms | 5.51 ms | 2.68 ms | 256 | 751.37 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.53 ms | 4.29 ms | 1.63 ms | 1.74 ms | 2.14 ms | 3.71 ms | 4.13 ms | 1.97 ms | 347 | 758.65 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.72 ms | 4.14 ms | 1.83 ms | 2.17 ms | 2.40 ms | 3.75 ms | 4.04 ms | 2.23 ms | 308 | 925.25 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.12 ms | 3.17 ms | 1.21 ms | 1.30 ms | 1.57 ms | 2.22 ms | 2.76 ms | 1.42 ms | 490 | 769.11 KB | — |
| Small File (smith.js - 9.28KB) | 1.10 ms | 3.87 ms | 1.16 ms | 1.21 ms | 1.44 ms | 2.63 ms | 3.44 ms | 1.36 ms | 509 | 771.85 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.33 ms | 7.21 ms | 2.45 ms | 2.68 ms | 3.04 ms | 5.44 ms | 5.58 ms | 2.92 ms | 235 | 1.40 MB | — |
| Large File (obfuscate.js - 89.57KB) | 87.40 ms | 92.50 ms | 88.91 ms | 91.02 ms | 91.66 ms | 91.82 ms | 91.82 ms | 90.28 ms | 9 | 31.38 MB | 13.82 ms |
| jscrush.js | 273.04 µs | 1.46 ms | 307.73 µs | 341.30 µs | 440.44 µs | 915.57 µs | 1.30 ms | 402.49 µs | 1731 | 269.96 KB | — |
| obfuscate.js | 47.01 ms | 88.02 ms | 50.34 ms | 57.38 ms | 64.35 ms | 68.06 ms | 68.06 ms | 59.28 ms | 12 | 20.98 MB | — |
