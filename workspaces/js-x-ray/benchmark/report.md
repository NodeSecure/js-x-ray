# Benchmark Report

- **Timestamp:** 2026-08-02T01:44:35.290Z
- **Runtime:** node
- **CPU:** AMD EPYC 7763 64-Core Processor (~3.03 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 245.14 µs | 1.37 ms | 274.43 µs | 306.42 µs | 384.44 µs | 792.08 µs | 1.24 ms | 359.94 µs | 1932 | 270.40 KB | — |
| Small File (npm-audit.js - 1.46KB) | 631.13 µs | 1.88 ms | 694.54 µs | 742.78 µs | 1.01 ms | 1.56 ms | 1.69 ms | 862.36 µs | 808 | 474.56 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.91 ms | 4.87 ms | 2.00 ms | 2.14 ms | 2.54 ms | 4.38 ms | 4.57 ms | 2.35 ms | 293 | 751.58 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.56 ms | 5.34 ms | 1.70 ms | 2.00 ms | 2.14 ms | 3.61 ms | 5.02 ms | 2.04 ms | 338 | 750.08 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.87 ms | 4.88 ms | 2.08 ms | 2.37 ms | 2.70 ms | 4.08 ms | 4.41 ms | 2.50 ms | 275 | 906.32 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.15 ms | 4.13 ms | 1.23 ms | 1.30 ms | 1.57 ms | 2.64 ms | 3.15 ms | 1.45 ms | 477 | 768.78 KB | — |
| Small File (smith.js - 9.28KB) | 1.14 ms | 3.34 ms | 1.23 ms | 1.29 ms | 1.55 ms | 2.44 ms | 3.20 ms | 1.42 ms | 489 | 764.01 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.36 ms | 6.00 ms | 2.49 ms | 2.68 ms | 3.03 ms | 5.30 ms | 5.80 ms | 2.91 ms | 235 | 1.40 MB | — |
| Large File (obfuscate.js - 89.57KB) | 87.00 ms | 91.23 ms | 88.72 ms | 89.59 ms | 90.27 ms | 90.57 ms | 90.57 ms | 89.48 ms | 9 | 31.73 MB | 14.19 ms |
| jscrush.js | 276.31 µs | 1.71 ms | 315.22 µs | 347.03 µs | 435.27 µs | 842.56 µs | 1.29 ms | 402.01 µs | 1731 | 270.68 KB | — |
| obfuscate.js | 51.07 ms | 62.19 ms | 52.89 ms | 55.56 ms | 56.75 ms | 59.65 ms | 59.65 ms | 55.76 ms | 9 | 20.72 MB | — |
