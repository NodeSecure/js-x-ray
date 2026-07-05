# Benchmark Report

- **Timestamp:** 2026-07-05T01:58:29.562Z
- **Runtime:** node
- **CPU:** AMD EPYC 7763 64-Core Processor (~3.09 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 222.91 µs | 1.36 ms | 252.79 µs | 291.32 µs | 398.75 µs | 767.37 µs | 1.04 ms | 341.27 µs | 2034 | 265.95 KB | — |
| Small File (npm-audit.js - 1.46KB) | 572.73 µs | 2.54 ms | 629.98 µs | 664.99 µs | 900.48 µs | 1.46 ms | 2.07 ms | 783.62 µs | 887 | 469.03 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.77 ms | 4.43 ms | 1.87 ms | 2.04 ms | 2.37 ms | 3.68 ms | 4.16 ms | 2.21 ms | 312 | 695.85 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.45 ms | 4.09 ms | 1.53 ms | 1.64 ms | 1.96 ms | 3.49 ms | 4.07 ms | 1.82 ms | 380 | 711.12 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.61 ms | 4.25 ms | 1.81 ms | 2.18 ms | 2.45 ms | 3.93 ms | 4.17 ms | 2.24 ms | 307 | 898.74 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.10 ms | 4.91 ms | 1.19 ms | 1.25 ms | 1.45 ms | 2.30 ms | 3.09 ms | 1.36 ms | 509 | 757.41 KB | — |
| Small File (smith.js - 9.28KB) | 1.08 ms | 4.75 ms | 1.14 ms | 1.22 ms | 1.42 ms | 2.34 ms | 3.56 ms | 1.33 ms | 519 | 748.49 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.24 ms | 5.27 ms | 2.37 ms | 2.67 ms | 2.80 ms | 4.73 ms | 5.20 ms | 2.74 ms | 250 | 1.39 MB | — |
| Large File (obfuscate.js - 89.57KB) | 78.26 ms | 87.33 ms | 79.57 ms | 82.80 ms | 83.72 ms | 84.97 ms | 84.97 ms | 82.44 ms | 10 | 31.13 MB | 14.12 ms |
| jscrush.js | 253.67 µs | 1.12 ms | 288.18 µs | 322.76 µs | 384.67 µs | 813.77 µs | 1.02 ms | 366.16 µs | 1901 | 268.08 KB | — |
| obfuscate.js | 44.77 ms | 62.55 ms | 46.55 ms | 49.51 ms | 52.15 ms | 55.79 ms | 55.79 ms | 50.87 ms | 10 | 20.23 MB | — |
