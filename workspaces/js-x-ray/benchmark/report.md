# Benchmark Report

- **Timestamp:** 2026-10-11T02:44:45.872Z
- **Runtime:** node
- **CPU:** AMD EPYC 7763 64-Core Processor (~3.08 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 243.63 µs | 1.66 ms | 275.62 µs | 310.95 µs | 406.58 µs | 771.19 µs | 1.31 ms | 362.19 µs | 1917 | 280.61 KB | — |
| Small File (npm-audit.js - 1.46KB) | 612.60 µs | 2.60 ms | 669.41 µs | 709.92 µs | 1.07 ms | 1.54 ms | 1.96 ms | 855.08 µs | 814 | 417.66 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.86 ms | 4.75 ms | 1.97 ms | 2.14 ms | 2.55 ms | 4.26 ms | 4.33 ms | 2.36 ms | 292 | 743.09 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.51 ms | 5.03 ms | 1.73 ms | 2.09 ms | 2.29 ms | 3.99 ms | 4.95 ms | 2.16 ms | 319 | 760.08 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.68 ms | 5.40 ms | 1.81 ms | 2.12 ms | 2.36 ms | 4.43 ms | 5.12 ms | 2.24 ms | 307 | 925.88 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.12 ms | 3.29 ms | 1.17 ms | 1.21 ms | 1.40 ms | 2.46 ms | 3.25 ms | 1.34 ms | 517 | 763.94 KB | — |
| Small File (smith.js - 9.28KB) | 1.11 ms | 4.46 ms | 1.19 ms | 1.27 ms | 1.57 ms | 2.56 ms | 3.58 ms | 1.41 ms | 490 | 770.39 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.30 ms | 6.45 ms | 2.40 ms | 2.61 ms | 2.97 ms | 5.16 ms | 5.51 ms | 2.86 ms | 240 | 1.40 MB | — |
| Large File (obfuscate.js - 89.57KB) | 86.78 ms | 94.74 ms | 88.85 ms | 89.58 ms | 90.96 ms | 93.43 ms | 93.43 ms | 90.26 ms | 9 | 31.60 MB | 14.06 ms |
| jscrush.js | 268.23 µs | 1.51 ms | 311.10 µs | 348.40 µs | 464.65 µs | 960.44 µs | 1.30 ms | 409.15 µs | 1701 | 272.12 KB | — |
| obfuscate.js | 49.53 ms | 65.59 ms | 52.71 ms | 55.12 ms | 56.35 ms | 57.66 ms | 57.66 ms | 55.25 ms | 9 | 20.96 MB | — |
