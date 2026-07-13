# Benchmark Report

- **Timestamp:** 2026-07-12T01:42:15.749Z
- **Runtime:** node
- **CPU:** INTEL(R) XEON(R) PLATINUM 8573C (~2.95 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 163.70 µs | 1.78 ms | 206.46 µs | 283.88 µs | 369.32 µs | 769.18 µs | 1.47 ms | 306.97 µs | 2269 | 258.87 KB | — |
| Small File (npm-audit.js - 1.46KB) | 477.41 µs | 2.42 ms | 600.47 µs | 734.70 µs | 875.57 µs | 1.34 ms | 2.28 ms | 765.23 µs | 910 | 416.51 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.45 ms | 4.31 ms | 1.57 ms | 1.86 ms | 2.04 ms | 3.68 ms | 4.25 ms | 1.92 ms | 360 | 690.71 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.18 ms | 4.98 ms | 1.38 ms | 1.67 ms | 1.79 ms | 4.26 ms | 4.72 ms | 1.74 ms | 396 | 736.03 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.39 ms | 4.21 ms | 1.51 ms | 1.65 ms | 1.90 ms | 3.19 ms | 3.90 ms | 1.78 ms | 387 | 895.62 KB | — |
| Small File (modrrnize.js - 9.28KB) | 984.78 µs | 2.94 ms | 1.09 ms | 1.26 ms | 1.31 ms | 1.92 ms | 2.69 ms | 1.26 ms | 550 | 751.63 KB | — |
| Small File (smith.js - 9.28KB) | 901.34 µs | 2.79 ms | 1.08 ms | 1.26 ms | 1.31 ms | 2.01 ms | 2.68 ms | 1.27 ms | 549 | 748.93 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.07 ms | 5.66 ms | 2.19 ms | 2.27 ms | 2.64 ms | 4.11 ms | 4.61 ms | 2.48 ms | 277 | 1.33 MB | — |
| Large File (obfuscate.js - 89.57KB) | 67.69 ms | 76.43 ms | 70.09 ms | 72.85 ms | 73.48 ms | 74.88 ms | 74.88 ms | 72.39 ms | 11 | 31.74 MB | 14.00 ms |
| jscrush.js | 170.10 µs | 1.14 ms | 208.20 µs | 242.88 µs | 324.38 µs | 648.50 µs | 975.52 µs | 283.06 µs | 2469 | 251.25 KB | — |
| obfuscate.js | 39.61 ms | 49.41 ms | 40.03 ms | 41.75 ms | 44.50 ms | 45.39 ms | 45.39 ms | 42.70 ms | 12 | 20.19 MB | — |
