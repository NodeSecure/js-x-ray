# Benchmark Report

- **Timestamp:** 2026-08-09T00:52:04.506Z
- **Runtime:** node
- **CPU:** AMD EPYC 7763 64-Core Processor (~3.07 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 249.81 µs | 1.90 ms | 290.00 µs | 347.02 µs | 522.94 µs | 895.67 µs | 1.78 ms | 414.24 µs | 1677 | 269.65 KB | — |
| Small File (npm-audit.js - 1.46KB) | 613.83 µs | 3.62 ms | 706.08 µs | 816.85 µs | 1.17 ms | 1.92 ms | 3.06 ms | 951.09 µs | 730 | 431.54 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.88 ms | 4.71 ms | 2.01 ms | 2.14 ms | 2.55 ms | 3.98 ms | 4.28 ms | 2.35 ms | 294 | 744.37 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.54 ms | 5.11 ms | 1.65 ms | 1.75 ms | 2.12 ms | 4.11 ms | 4.56 ms | 1.98 ms | 347 | 769.04 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.78 ms | 4.28 ms | 1.98 ms | 2.29 ms | 2.45 ms | 3.59 ms | 4.03 ms | 2.30 ms | 299 | 903.80 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.07 ms | 4.17 ms | 1.16 ms | 1.22 ms | 1.48 ms | 2.45 ms | 3.71 ms | 1.36 ms | 508 | 771.49 KB | — |
| Small File (smith.js - 9.28KB) | 1.10 ms | 3.55 ms | 1.18 ms | 1.24 ms | 1.49 ms | 2.35 ms | 3.34 ms | 1.37 ms | 505 | 759.68 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.33 ms | 7.12 ms | 2.43 ms | 2.62 ms | 2.90 ms | 4.99 ms | 5.49 ms | 2.86 ms | 240 | 1.37 MB | — |
| Large File (obfuscate.js - 89.57KB) | 80.99 ms | 96.28 ms | 88.60 ms | 90.46 ms | 94.84 ms | 95.10 ms | 95.10 ms | 91.03 ms | 12 | 31.29 MB | 15.04 ms |
| jscrush.js | 276.28 µs | 1.27 ms | 312.56 µs | 340.50 µs | 410.07 µs | 852.40 µs | 1.15 ms | 394.42 µs | 1766 | 274.07 KB | — |
| obfuscate.js | 46.89 ms | 84.91 ms | 51.94 ms | 53.94 ms | 62.65 ms | 68.68 ms | 68.68 ms | 58.84 ms | 12 | 20.50 MB | — |
