# Benchmark Report

- **Timestamp:** 2026-06-15T05:54:25.799Z
- **Runtime:** node
- **CPU:** unknown (~3.06 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.06KB) | 232.29 µs | 971.25 µs | 243.96 µs | 256.13 µs | 270.63 µs | 466.13 µs | 819.46 µs | 267.25 µs | 2620 | 267.10 KB | — |
| Small File (npm-audit.js - 1.51KB) | 590.13 µs | 1.60 ms | 623.58 µs | 638.04 µs | 655.79 µs | 1.02 ms | 1.20 ms | 655.34 µs | 1067 | 431.64 KB | — |
| Small File (forbes-skimmer.js - 2.20KB) | 1.48 ms | 3.29 ms | 1.51 ms | 1.53 ms | 1.57 ms | 2.70 ms | 3.04 ms | 1.59 ms | 436 | 668.69 KB | — |
| Small File (rate-map.js - 2.30KB) | 1.25 ms | 3.00 ms | 1.29 ms | 1.32 ms | 1.38 ms | 2.60 ms | 2.82 ms | 1.39 ms | 500 | 703.62 KB | — |
| Small File (event-stream.js - 3.84KB) | 1.74 ms | 5.40 ms | 1.83 ms | 1.92 ms | 2.10 ms | 3.53 ms | 5.16 ms | 2.03 ms | 338 | 890.83 KB | — |
| Small File (modrrnize.js - 9.31KB) | 1.12 ms | 2.53 ms | 1.15 ms | 1.17 ms | 1.23 ms | 1.91 ms | 2.03 ms | 1.23 ms | 567 | 765.39 KB | — |
| Small File (smith.js - 9.31KB) | 1.12 ms | 2.30 ms | 1.14 ms | 1.15 ms | 1.18 ms | 1.81 ms | 2.00 ms | 1.20 ms | 582 | 754.31 KB | — |
| Medium File (kopiluwak.js - 15.53KB) | 2.42 ms | 4.41 ms | 2.46 ms | 2.48 ms | 2.54 ms | 4.01 ms | 4.26 ms | 2.57 ms | 268 | 1.32 MB | — |
| Large File (obfuscate.js - 89.57KB) | 78.24 ms | 82.88 ms | 78.69 ms | 80.04 ms | 80.59 ms | 82.18 ms | 82.18 ms | 80.20 ms | 11 | 31.14 MB | 8.16 ms |
| jscrush.js | 245.50 µs | 961.00 µs | 266.04 µs | 283.42 µs | 309.67 µs | 553.13 µs | 834.25 µs | 303.60 µs | 2307 | 267.52 KB | — |
| obfuscate.js | 52.80 ms | 86.92 ms | 54.56 ms | 55.85 ms | 65.92 ms | 68.37 ms | 68.37 ms | 60.82 ms | 12 | 20.67 MB | — |
