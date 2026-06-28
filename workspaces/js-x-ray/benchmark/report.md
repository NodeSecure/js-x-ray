# Benchmark Report

- **Timestamp:** 2026-06-28T02:27:39.163Z
- **Runtime:** node
- **CPU:** AMD EPYC 9V74 80-Core Processor (~2.73 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 185.98 µs | 2.69 ms | 219.81 µs | 259.54 µs | 395.69 µs | 761.66 µs | 1.94 ms | 317.67 µs | 2186 | 257.94 KB | — |
| Small File (npm-audit.js - 1.46KB) | 501.71 µs | 3.34 ms | 588.24 µs | 697.28 µs | 952.26 µs | 1.88 ms | 2.98 ms | 789.32 µs | 878 | 420.77 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.53 ms | 6.79 ms | 1.72 ms | 2.04 ms | 2.34 ms | 3.84 ms | 5.33 ms | 2.14 ms | 321 | 698.25 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.38 ms | 5.95 ms | 1.49 ms | 1.78 ms | 2.13 ms | 4.16 ms | 4.33 ms | 1.90 ms | 362 | 737.84 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.49 ms | 6.48 ms | 1.59 ms | 1.90 ms | 2.00 ms | 3.81 ms | 5.23 ms | 1.94 ms | 355 | 902.31 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.09 ms | 2.73 ms | 1.18 ms | 1.26 ms | 1.40 ms | 2.18 ms | 2.67 ms | 1.33 ms | 521 | 763.65 KB | — |
| Small File (smith.js - 9.28KB) | 1.07 ms | 2.66 ms | 1.15 ms | 1.23 ms | 1.38 ms | 2.06 ms | 2.61 ms | 1.30 ms | 534 | 756.54 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.22 ms | 5.78 ms | 2.31 ms | 2.65 ms | 2.74 ms | 4.55 ms | 5.29 ms | 2.67 ms | 258 | 1.33 MB | — |
| Large File (obfuscate.js - 89.57KB) | 74.44 ms | 80.98 ms | 76.12 ms | 77.60 ms | 78.50 ms | 78.61 ms | 78.61 ms | 77.52 ms | 10 | 32.03 MB | 14.22 ms |
| jscrush.js | 209.78 µs | 1.11 ms | 245.84 µs | 284.23 µs | 385.83 µs | 627.84 µs | 1.05 ms | 326.32 µs | 2138 | 268.44 KB | — |
| obfuscate.js | 42.62 ms | 57.02 ms | 44.27 ms | 47.60 ms | 48.19 ms | 50.09 ms | 50.09 ms | 47.64 ms | 11 | 20.30 MB | — |
