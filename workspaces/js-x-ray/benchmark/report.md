# Benchmark Report

- **Timestamp:** 2026-06-22T02:23:51.314Z
- **Runtime:** node
- **CPU:** unknown (~3.08 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.06KB) | 233.75 µs | 982.46 µs | 245.75 µs | 256.54 µs | 270.92 µs | 452.83 µs | 783.04 µs | 266.75 µs | 2626 | 267.11 KB | — |
| Small File (npm-audit.js - 1.51KB) | 596.29 µs | 1.79 ms | 627.13 µs | 641.83 µs | 661.71 µs | 1.03 ms | 1.21 ms | 660.61 µs | 1058 | 425.93 KB | — |
| Small File (forbes-skimmer.js - 2.20KB) | 1.49 ms | 3.35 ms | 1.51 ms | 1.53 ms | 1.59 ms | 2.84 ms | 3.31 ms | 1.60 ms | 435 | 666.79 KB | — |
| Small File (rate-map.js - 2.30KB) | 1.23 ms | 3.00 ms | 1.26 ms | 1.29 ms | 1.33 ms | 2.57 ms | 2.80 ms | 1.35 ms | 515 | 699.17 KB | — |
| Small File (event-stream.js - 3.84KB) | 1.71 ms | 2.97 ms | 1.75 ms | 1.78 ms | 1.82 ms | 2.66 ms | 2.82 ms | 1.83 ms | 379 | 871.74 KB | — |
| Small File (modrrnize.js - 9.31KB) | 1.06 ms | 3.20 ms | 1.09 ms | 1.12 ms | 1.16 ms | 1.91 ms | 2.94 ms | 1.17 ms | 596 | 760.30 KB | — |
| Small File (smith.js - 9.31KB) | 1.06 ms | 2.26 ms | 1.08 ms | 1.10 ms | 1.13 ms | 1.72 ms | 1.98 ms | 1.14 ms | 612 | 746.19 KB | — |
| Medium File (kopiluwak.js - 15.53KB) | 2.35 ms | 4.94 ms | 2.39 ms | 2.40 ms | 2.47 ms | 4.66 ms | 4.83 ms | 2.50 ms | 275 | 1.34 MB | — |
| Large File (obfuscate.js - 89.57KB) | 76.62 ms | 81.81 ms | 78.61 ms | 79.12 ms | 79.92 ms | 81.72 ms | 81.72 ms | 79.41 ms | 11 | 31.29 MB | 8.02 ms |
| jscrush.js | 245.08 µs | 961.79 µs | 263.33 µs | 276.67 µs | 296.29 µs | 515.92 µs | 886.63 µs | 291.39 µs | 2404 | 265.04 KB | — |
| obfuscate.js | 52.21 ms | 58.26 ms | 53.70 ms | 54.13 ms | 54.80 ms | 56.46 ms | 56.46 ms | 54.45 ms | 9 | 20.51 MB | — |
