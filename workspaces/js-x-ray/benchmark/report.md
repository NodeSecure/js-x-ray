# Benchmark Report

- **Timestamp:** 2026-09-27T02:22:10.470Z
- **Runtime:** node
- **CPU:** AMD EPYC 7763 64-Core Processor (~3.03 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 235.19 µs | 1.36 ms | 266.50 µs | 295.04 µs | 369.56 µs | 824.29 µs | 1.21 ms | 348.45 µs | 1995 | 270.07 KB | — |
| Small File (npm-audit.js - 1.46KB) | 598.32 µs | 1.90 ms | 658.29 µs | 706.01 µs | 944.69 µs | 1.59 ms | 1.85 ms | 829.06 µs | 840 | 406.30 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.84 ms | 5.20 ms | 1.93 ms | 2.05 ms | 2.53 ms | 3.97 ms | 4.17 ms | 2.30 ms | 299 | 761.68 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.47 ms | 4.26 ms | 1.55 ms | 1.66 ms | 2.07 ms | 3.65 ms | 4.25 ms | 1.85 ms | 371 | 725.03 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.72 ms | 4.42 ms | 1.81 ms | 1.94 ms | 2.39 ms | 3.91 ms | 4.32 ms | 2.20 ms | 312 | 954.05 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.11 ms | 3.32 ms | 1.16 ms | 1.23 ms | 1.54 ms | 2.44 ms | 2.72 ms | 1.38 ms | 501 | 773.25 KB | — |
| Small File (smith.js - 9.28KB) | 1.10 ms | 3.35 ms | 1.18 ms | 1.24 ms | 1.54 ms | 2.52 ms | 3.26 ms | 1.40 ms | 497 | 771.45 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.31 ms | 5.72 ms | 2.39 ms | 2.48 ms | 2.93 ms | 4.96 ms | 5.07 ms | 2.75 ms | 250 | 1.36 MB | — |
| Large File (obfuscate.js - 89.57KB) | 86.26 ms | 97.09 ms | 86.99 ms | 88.57 ms | 90.10 ms | 96.97 ms | 96.97 ms | 90.17 ms | 12 | 30.80 MB | 14.62 ms |
| jscrush.js | 267.46 µs | 1.46 ms | 303.91 µs | 337.57 µs | 399.06 µs | 860.33 µs | 1.28 ms | 384.30 µs | 1808 | 269.39 KB | — |
| obfuscate.js | 49.52 ms | 65.02 ms | 51.03 ms | 53.43 ms | 56.55 ms | 62.17 ms | 62.17 ms | 55.07 ms | 9 | 20.59 MB | — |
