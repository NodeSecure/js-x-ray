# Benchmark Report

- **Timestamp:** 2026-07-19T01:29:03.968Z
- **Runtime:** node
- **CPU:** Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz (~3.34 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 195.23 µs | 1.22 ms | 225.47 µs | 252.37 µs | 338.17 µs | 746.12 µs | 1.06 ms | 299.13 µs | 2326 | 261.21 KB | — |
| Small File (npm-audit.js - 1.46KB) | 524.91 µs | 2.32 ms | 582.82 µs | 631.82 µs | 857.88 µs | 1.31 ms | 1.63 ms | 722.61 µs | 963 | 515.93 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.54 ms | 3.71 ms | 1.64 ms | 1.71 ms | 2.08 ms | 3.29 ms | 3.55 ms | 1.92 ms | 360 | 685.10 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.29 ms | 4.21 ms | 1.40 ms | 1.48 ms | 1.78 ms | 3.19 ms | 4.13 ms | 1.67 ms | 413 | 708.37 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.47 ms | 4.85 ms | 1.61 ms | 1.93 ms | 2.08 ms | 3.87 ms | 4.25 ms | 1.95 ms | 352 | 885.82 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.06 ms | 3.87 ms | 1.16 ms | 1.28 ms | 1.42 ms | 2.11 ms | 2.79 ms | 1.34 ms | 518 | 753.01 KB | — |
| Small File (smith.js - 9.28KB) | 1.01 ms | 4.01 ms | 1.11 ms | 1.44 ms | 1.66 ms | 2.89 ms | 3.76 ms | 1.47 ms | 470 | 759.19 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.17 ms | 7.21 ms | 2.56 ms | 2.71 ms | 3.03 ms | 5.02 ms | 5.85 ms | 2.89 ms | 236 | 1.33 MB | — |
| Large File (obfuscate.js - 89.57KB) | 79.13 ms | 94.53 ms | 82.46 ms | 86.55 ms | 91.93 ms | 94.41 ms | 94.41 ms | 87.54 ms | 12 | 31.53 MB | 19.61 ms |
| jscrush.js | 219.56 µs | 2.22 ms | 254.04 µs | 293.19 µs | 407.37 µs | 989.00 µs | 2.04 ms | 354.05 µs | 1957 | 262.08 KB | — |
| obfuscate.js | 42.48 ms | 51.76 ms | 44.33 ms | 46.20 ms | 46.85 ms | 51.75 ms | 51.75 ms | 46.60 ms | 11 | 20.05 MB | — |
