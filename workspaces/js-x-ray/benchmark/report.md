# Benchmark Report

- **Timestamp:** 2026-09-06T01:47:02.371Z
- **Runtime:** node
- **CPU:** AMD EPYC 7763 64-Core Processor (~3.03 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 235.67 µs | 1.27 ms | 267.50 µs | 298.79 µs | 378.35 µs | 816.12 µs | 1.15 ms | 347.98 µs | 1998 | 270.62 KB | — |
| Small File (npm-audit.js - 1.46KB) | 600.93 µs | 1.85 ms | 663.45 µs | 704.23 µs | 967.01 µs | 1.54 ms | 1.74 ms | 827.92 µs | 841 | 433.71 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.85 ms | 4.75 ms | 1.96 ms | 2.19 ms | 2.53 ms | 4.32 ms | 4.55 ms | 2.37 ms | 291 | 736.17 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.53 ms | 4.87 ms | 1.65 ms | 2.03 ms | 2.14 ms | 3.74 ms | 4.37 ms | 2.03 ms | 339 | 755.62 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.68 ms | 5.02 ms | 1.79 ms | 1.97 ms | 2.34 ms | 3.96 ms | 4.15 ms | 2.13 ms | 323 | 904.66 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.11 ms | 3.31 ms | 1.18 ms | 1.25 ms | 1.54 ms | 2.45 ms | 3.26 ms | 1.39 ms | 499 | 770.71 KB | — |
| Small File (smith.js - 9.28KB) | 1.09 ms | 3.23 ms | 1.17 ms | 1.26 ms | 1.52 ms | 2.35 ms | 2.99 ms | 1.38 ms | 503 | 769.98 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.30 ms | 5.92 ms | 2.37 ms | 2.52 ms | 2.89 ms | 4.53 ms | 5.30 ms | 2.72 ms | 253 | 1.34 MB | — |
| Large File (obfuscate.js - 89.57KB) | 85.24 ms | 92.15 ms | 86.52 ms | 87.94 ms | 90.36 ms | 91.94 ms | 91.94 ms | 88.47 ms | 9 | 31.31 MB | 14.48 ms |
| jscrush.js | 268.29 µs | 1.86 ms | 304.53 µs | 339.44 µs | 494.35 µs | 915.29 µs | 1.40 ms | 405.62 µs | 1714 | 270.25 KB | — |
| obfuscate.js | 47.60 ms | 70.95 ms | 50.17 ms | 51.03 ms | 53.03 ms | 55.24 ms | 55.24 ms | 53.16 ms | 9 | 20.64 MB | — |
