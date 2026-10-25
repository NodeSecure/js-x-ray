# Benchmark Report

- **Timestamp:** 2026-10-25T02:10:31.454Z
- **Runtime:** node
- **CPU:** Intel(R) Xeon(R) 6973P-C (~3.93 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 132.82 µs | 1.24 ms | 156.26 µs | 212.10 µs | 263.94 µs | 572.71 µs | 883.86 µs | 224.72 µs | 3097 | 256.56 KB | — |
| Small File (npm-audit.js - 1.46KB) | 332.63 µs | 2.70 ms | 458.76 µs | 538.38 µs | 640.48 µs | 1.44 ms | 2.05 ms | 579.18 µs | 1201 | 420.52 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.16 ms | 4.79 ms | 1.32 ms | 1.55 ms | 1.68 ms | 3.57 ms | 4.56 ms | 1.61 ms | 430 | 731.28 KB | — |
| Small File (rate-map.js - 2.21KB) | 940.92 µs | 4.50 ms | 1.12 ms | 1.37 ms | 1.46 ms | 3.53 ms | 4.38 ms | 1.40 ms | 496 | 718.14 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.14 ms | 2.89 ms | 1.22 ms | 1.28 ms | 1.50 ms | 2.65 ms | 2.86 ms | 1.40 ms | 497 | 873.69 KB | — |
| Small File (modrrnize.js - 9.28KB) | 756.87 µs | 2.53 ms | 864.64 µs | 963.27 µs | 1.12 ms | 1.79 ms | 2.06 ms | 1.03 ms | 676 | 759.48 KB | — |
| Small File (smith.js - 9.28KB) | 766.64 µs | 2.67 ms | 873.54 µs | 927.05 µs | 1.10 ms | 1.74 ms | 2.24 ms | 1.00 ms | 695 | 781.24 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 1.65 ms | 4.47 ms | 1.71 ms | 1.80 ms | 2.07 ms | 3.22 ms | 4.25 ms | 1.96 ms | 352 | 1.33 MB | — |
| Large File (obfuscate.js - 89.57KB) | 57.72 ms | 64.54 ms | 58.51 ms | 60.66 ms | 61.51 ms | 64.50 ms | 64.50 ms | 60.48 ms | 13 | 32.14 MB | 13.49 ms |
| jscrush.js | 138.31 µs | 978.07 µs | 160.39 µs | 188.51 µs | 257.51 µs | 538.08 µs | 840.69 µs | 218.51 µs | 3199 | 249.67 KB | — |
| obfuscate.js | 28.66 ms | 38.21 ms | 31.49 ms | 33.06 ms | 35.38 ms | 37.48 ms | 37.48 ms | 33.30 ms | 17 | 19.64 MB | — |
