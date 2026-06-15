# Benchmark Report

- **Timestamp:** 2026-06-15T06:06:23.368Z
- **Runtime:** node
- **CPU:** unknown (~3.07 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.06KB) | 235.29 µs | 892.54 µs | 246.79 µs | 258.21 µs | 272.00 µs | 439.33 µs | 783.29 µs | 268.01 µs | 2614 | 268.12 KB | — |
| Small File (npm-audit.js - 1.51KB) | 590.71 µs | 1.56 ms | 623.33 µs | 637.04 µs | 659.08 µs | 996.00 µs | 1.17 ms | 657.26 µs | 1064 | 422.81 KB | — |
| Small File (forbes-skimmer.js - 2.20KB) | 1.50 ms | 3.27 ms | 1.54 ms | 1.58 ms | 1.65 ms | 2.76 ms | 3.07 ms | 1.65 ms | 421 | 665.33 KB | — |
| Small File (rate-map.js - 2.30KB) | 1.24 ms | 3.09 ms | 1.27 ms | 1.30 ms | 1.38 ms | 2.49 ms | 2.82 ms | 1.37 ms | 506 | 680.78 KB | — |
| Small File (event-stream.js - 3.84KB) | 1.73 ms | 3.18 ms | 1.79 ms | 1.81 ms | 1.87 ms | 2.67 ms | 2.96 ms | 1.87 ms | 370 | 908.36 KB | — |
| Small File (modrrnize.js - 9.31KB) | 1.10 ms | 2.41 ms | 1.12 ms | 1.14 ms | 1.18 ms | 1.80 ms | 1.97 ms | 1.18 ms | 590 | 762.51 KB | — |
| Small File (smith.js - 9.31KB) | 1.09 ms | 2.27 ms | 1.11 ms | 1.13 ms | 1.16 ms | 1.69 ms | 1.98 ms | 1.17 ms | 597 | 757.55 KB | — |
| Medium File (kopiluwak.js - 15.53KB) | 2.47 ms | 4.90 ms | 2.50 ms | 2.52 ms | 2.61 ms | 4.45 ms | 4.73 ms | 2.64 ms | 261 | 1.33 MB | — |
| Large File (obfuscate.js - 89.57KB) | 76.39 ms | 81.88 ms | 77.87 ms | 79.03 ms | 79.43 ms | 81.31 ms | 81.31 ms | 79.17 ms | 11 | 31.31 MB | 7.52 ms |
| jscrush.js | 245.50 µs | 935.54 µs | 260.88 µs | 273.42 µs | 288.92 µs | 541.63 µs | 871.63 µs | 286.46 µs | 2446 | 269.37 KB | — |
| obfuscate.js | 52.32 ms | 58.20 ms | 53.39 ms | 53.92 ms | 54.56 ms | 55.39 ms | 55.39 ms | 54.31 ms | 9 | 20.75 MB | — |
