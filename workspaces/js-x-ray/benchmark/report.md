# Benchmark Report

- **Timestamp:** 2026-10-18T01:59:13.861Z
- **Runtime:** node
- **CPU:** AMD EPYC 7763 64-Core Processor (~3.07 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 242.77 µs | 1.45 ms | 281.63 µs | 317.19 µs | 433.41 µs | 810.47 µs | 1.20 ms | 372.91 µs | 1862 | 273.35 KB | — |
| Small File (npm-audit.js - 1.46KB) | 619.48 µs | 2.66 ms | 675.55 µs | 724.38 µs | 1.02 ms | 1.61 ms | 1.76 ms | 855.33 µs | 814 | 416.69 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.89 ms | 5.97 ms | 2.02 ms | 2.18 ms | 2.66 ms | 4.32 ms | 5.56 ms | 2.43 ms | 282 | 748.52 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.53 ms | 4.97 ms | 1.67 ms | 2.05 ms | 2.19 ms | 4.53 ms | 4.97 ms | 2.07 ms | 333 | 768.24 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.70 ms | 6.03 ms | 1.79 ms | 1.94 ms | 2.40 ms | 4.30 ms | 4.72 ms | 2.17 ms | 316 | 911.67 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.11 ms | 3.40 ms | 1.18 ms | 1.23 ms | 1.52 ms | 2.75 ms | 3.39 ms | 1.40 ms | 495 | 772.34 KB | — |
| Small File (smith.js - 9.28KB) | 1.10 ms | 3.56 ms | 1.17 ms | 1.21 ms | 1.39 ms | 2.35 ms | 3.31 ms | 1.34 ms | 518 | 767.08 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.35 ms | 6.57 ms | 2.43 ms | 2.53 ms | 3.09 ms | 5.06 ms | 6.44 ms | 2.87 ms | 239 | 1.36 MB | — |
| Large File (obfuscate.js - 89.57KB) | 83.79 ms | 100.60 ms | 88.89 ms | 92.05 ms | 94.90 ms | 100.22 ms | 100.22 ms | 92.52 ms | 12 | 31.53 MB | 15.00 ms |
| jscrush.js | 279.27 µs | 1.43 ms | 320.42 µs | 358.72 µs | 494.17 µs | 899.61 µs | 1.34 ms | 419.60 µs | 1653 | 275.66 KB | — |
| obfuscate.js | 50.27 ms | 62.32 ms | 52.24 ms | 53.68 ms | 56.91 ms | 58.08 ms | 58.08 ms | 54.65 ms | 9 | 20.49 MB | — |
