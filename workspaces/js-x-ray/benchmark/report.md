# Benchmark Report

- **Timestamp:** 2026-11-22T03:56:10.269Z
- **Runtime:** node
- **CPU:** AMD EPYC 9V74 80-Core Processor (~3.55 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 155.54 µs | 1.01 ms | 178.34 µs | 203.05 µs | 288.15 µs | 571.67 µs | 812.67 µs | 243.36 µs | 2865 | 261.86 KB | — |
| Small File (npm-audit.js - 1.46KB) | 415.87 µs | 1.99 ms | 469.84 µs | 502.18 µs | 706.27 µs | 1.39 ms | 1.84 ms | 605.28 µs | 1154 | 430.73 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.12 ms | 3.77 ms | 1.20 ms | 1.43 ms | 1.57 ms | 2.35 ms | 3.01 ms | 1.44 ms | 480 | 712.81 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.12 ms | 3.32 ms | 1.18 ms | 1.30 ms | 1.51 ms | 2.68 ms | 3.15 ms | 1.41 ms | 493 | 733.12 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.18 ms | 3.51 ms | 1.26 ms | 1.50 ms | 1.65 ms | 2.70 ms | 2.95 ms | 1.52 ms | 456 | 883.20 KB | — |
| Small File (modrrnize.js - 9.28KB) | 833.03 µs | 2.34 ms | 892.76 µs | 932.53 µs | 1.12 ms | 1.66 ms | 2.31 ms | 1.02 ms | 680 | 756.40 KB | — |
| Small File (smith.js - 9.28KB) | 851.54 µs | 2.76 ms | 918.35 µs | 980.73 µs | 1.17 ms | 1.97 ms | 2.34 ms | 1.06 ms | 655 | 757.31 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 1.73 ms | 4.32 ms | 1.83 ms | 2.11 ms | 2.30 ms | 3.43 ms | 4.26 ms | 2.15 ms | 322 | 1.33 MB | — |
| Large File (obfuscate.js - 89.57KB) | 62.93 ms | 68.47 ms | 66.28 ms | 66.87 ms | 67.68 ms | 68.39 ms | 68.39 ms | 66.81 ms | 12 | 31.27 MB | 13.45 ms |
| jscrush.js | 171.00 µs | 1.03 ms | 198.53 µs | 222.38 µs | 295.48 µs | 546.38 µs | 977.82 µs | 260.46 µs | 2679 | 265.50 KB | — |
| obfuscate.js | 36.06 ms | 48.59 ms | 38.35 ms | 39.65 ms | 42.51 ms | 45.46 ms | 45.46 ms | 40.78 ms | 13 | 19.97 MB | — |
