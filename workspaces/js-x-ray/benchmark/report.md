# Benchmark Report

- **Timestamp:** 2026-11-08T03:10:55.013Z
- **Runtime:** node
- **CPU:** Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz (~3.34 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 219.83 µs | 1.31 ms | 253.82 µs | 287.47 µs | 399.87 µs | 808.05 µs | 1.08 ms | 341.16 µs | 2040 | 274.54 KB | — |
| Small File (npm-audit.js - 1.46KB) | 564.28 µs | 2.35 ms | 632.92 µs | 671.91 µs | 757.75 µs | 1.49 ms | 1.66 ms | 755.92 µs | 921 | 425.41 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.54 ms | 5.00 ms | 1.64 ms | 2.05 ms | 2.14 ms | 3.86 ms | 4.93 ms | 2.02 ms | 341 | 741.85 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.43 ms | 4.62 ms | 1.55 ms | 1.73 ms | 2.01 ms | 3.59 ms | 4.25 ms | 1.89 ms | 365 | 780.31 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.64 ms | 4.15 ms | 1.74 ms | 1.95 ms | 2.23 ms | 3.48 ms | 3.76 ms | 2.06 ms | 335 | 898.21 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.09 ms | 3.18 ms | 1.17 ms | 1.27 ms | 1.53 ms | 2.36 ms | 3.00 ms | 1.38 ms | 502 | 771.65 KB | — |
| Small File (smith.js - 9.28KB) | 1.07 ms | 2.97 ms | 1.14 ms | 1.21 ms | 1.43 ms | 2.35 ms | 2.97 ms | 1.33 ms | 524 | 763.63 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.32 ms | 6.01 ms | 2.39 ms | 2.64 ms | 2.89 ms | 4.64 ms | 5.73 ms | 2.82 ms | 244 | 1.35 MB | — |
| Large File (obfuscate.js - 89.57KB) | 81.53 ms | 87.53 ms | 84.94 ms | 85.69 ms | 86.79 ms | 87.48 ms | 87.48 ms | 85.26 ms | 9 | 31.59 MB | 16.67 ms |
| jscrush.js | 240.11 µs | 1.33 ms | 282.07 µs | 317.66 µs | 412.74 µs | 848.21 µs | 1.22 ms | 367.42 µs | 1897 | 272.89 KB | — |
| obfuscate.js | 50.42 ms | 63.66 ms | 51.15 ms | 52.73 ms | 57.62 ms | 60.62 ms | 60.62 ms | 54.99 ms | 9 | 20.38 MB | — |
