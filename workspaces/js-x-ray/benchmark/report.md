# Benchmark Report

- **Timestamp:** 2026-11-01T03:02:45.892Z
- **Runtime:** node
- **CPU:** AMD EPYC 7763 64-Core Processor (~3.09 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 245.94 µs | 1.29 ms | 278.86 µs | 317.75 µs | 428.01 µs | 823.73 µs | 1.15 ms | 369.85 µs | 1881 | 277.36 KB | — |
| Small File (npm-audit.js - 1.46KB) | 614.23 µs | 1.79 ms | 675.24 µs | 718.42 µs | 978.83 µs | 1.51 ms | 1.67 ms | 840.02 µs | 829 | 412.29 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.83 ms | 5.54 ms | 1.96 ms | 2.40 ms | 2.56 ms | 4.13 ms | 4.14 ms | 2.41 ms | 286 | 741.39 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.51 ms | 4.60 ms | 1.61 ms | 1.82 ms | 2.12 ms | 3.52 ms | 4.34 ms | 1.96 ms | 352 | 771.40 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.66 ms | 4.80 ms | 1.80 ms | 2.23 ms | 2.35 ms | 3.42 ms | 3.96 ms | 2.18 ms | 316 | 889.31 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.11 ms | 3.27 ms | 1.18 ms | 1.26 ms | 1.54 ms | 2.32 ms | 3.27 ms | 1.40 ms | 498 | 770.56 KB | — |
| Small File (smith.js - 9.28KB) | 1.09 ms | 2.73 ms | 1.15 ms | 1.24 ms | 1.53 ms | 2.15 ms | 2.62 ms | 1.36 ms | 510 | 761.35 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.31 ms | 6.09 ms | 2.41 ms | 2.83 ms | 2.94 ms | 4.74 ms | 5.80 ms | 2.87 ms | 240 | 1.36 MB | — |
| Large File (obfuscate.js - 89.57KB) | 86.60 ms | 91.89 ms | 88.16 ms | 88.65 ms | 91.18 ms | 91.54 ms | 91.54 ms | 89.24 ms | 9 | 31.22 MB | 14.71 ms |
| jscrush.js | 275.25 µs | 1.40 ms | 310.52 µs | 340.09 µs | 411.25 µs | 827.56 µs | 1.23 ms | 390.93 µs | 1781 | 273.26 KB | — |
| obfuscate.js | 48.18 ms | 64.74 ms | 51.54 ms | 53.15 ms | 56.48 ms | 63.61 ms | 63.61 ms | 54.76 ms | 9 | 20.75 MB | — |
