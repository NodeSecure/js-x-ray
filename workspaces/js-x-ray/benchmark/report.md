# Benchmark Report

- **Timestamp:** 2026-06-22T19:58:11.748Z
- **Runtime:** node
- **CPU:** unknown (~3.08 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.06KB) | 235.54 µs | 931.33 µs | 248.63 µs | 259.33 µs | 273.92 µs | 477.83 µs | 814.42 µs | 270.78 µs | 2586 | 270.78 KB | — |
| Small File (npm-audit.js - 1.51KB) | 600.63 µs | 1.57 ms | 631.00 µs | 644.04 µs | 660.63 µs | 1.03 ms | 1.13 ms | 661.85 µs | 1056 | 429.21 KB | — |
| Small File (forbes-skimmer.js - 2.20KB) | 1.50 ms | 3.49 ms | 1.53 ms | 1.55 ms | 1.60 ms | 2.82 ms | 3.12 ms | 1.61 ms | 430 | 666.61 KB | — |
| Small File (rate-map.js - 2.30KB) | 1.24 ms | 3.03 ms | 1.28 ms | 1.30 ms | 1.35 ms | 2.51 ms | 2.83 ms | 1.37 ms | 508 | 702.45 KB | — |
| Small File (event-stream.js - 3.84KB) | 1.74 ms | 3.23 ms | 1.78 ms | 1.81 ms | 1.86 ms | 2.44 ms | 2.89 ms | 1.85 ms | 374 | 878.08 KB | — |
| Small File (modrrnize.js - 9.31KB) | 1.05 ms | 2.34 ms | 1.08 ms | 1.10 ms | 1.14 ms | 1.82 ms | 2.14 ms | 1.15 ms | 607 | 757.93 KB | — |
| Small File (smith.js - 9.31KB) | 1.06 ms | 2.40 ms | 1.08 ms | 1.09 ms | 1.12 ms | 1.71 ms | 2.23 ms | 1.13 ms | 616 | 744.71 KB | — |
| Medium File (kopiluwak.js - 15.53KB) | 2.39 ms | 5.21 ms | 2.42 ms | 2.43 ms | 2.50 ms | 4.53 ms | 5.09 ms | 2.54 ms | 271 | 1.34 MB | — |
| Large File (obfuscate.js - 89.57KB) | 77.03 ms | 83.01 ms | 77.54 ms | 78.61 ms | 80.19 ms | 82.61 ms | 82.61 ms | 79.44 ms | 11 | 31.31 MB | 7.84 ms |
| jscrush.js | 248.00 µs | 931.00 µs | 263.17 µs | 275.21 µs | 290.88 µs | 527.92 µs | 890.13 µs | 288.19 µs | 2432 | 267.47 KB | — |
| obfuscate.js | 52.78 ms | 81.45 ms | 53.29 ms | 56.26 ms | 60.27 ms | 66.76 ms | 66.76 ms | 59.41 ms | 12 | 20.47 MB | — |
