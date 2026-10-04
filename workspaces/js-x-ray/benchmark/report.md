# Benchmark Report

- **Timestamp:** 2026-10-04T03:17:19.203Z
- **Runtime:** node
- **CPU:** INTEL(R) XEON(R) PLATINUM 8573C (~2.84 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 183.97 µs | 1.54 ms | 215.89 µs | 254.07 µs | 377.26 µs | 738.82 µs | 1.20 ms | 305.33 µs | 2282 | 268.33 KB | — |
| Small File (npm-audit.js - 1.46KB) | 494.06 µs | 1.96 ms | 589.33 µs | 670.53 µs | 864.60 µs | 1.44 ms | 1.94 ms | 747.43 µs | 932 | 420.45 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.53 ms | 4.13 ms | 1.67 ms | 1.81 ms | 2.17 ms | 3.32 ms | 4.07 ms | 1.97 ms | 351 | 752.74 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.34 ms | 3.97 ms | 1.48 ms | 1.62 ms | 1.98 ms | 3.40 ms | 3.79 ms | 1.80 ms | 384 | 725.59 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.52 ms | 4.07 ms | 1.63 ms | 1.75 ms | 2.10 ms | 3.80 ms | 4.04 ms | 1.95 ms | 355 | 887.84 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.05 ms | 3.19 ms | 1.15 ms | 1.23 ms | 1.49 ms | 2.19 ms | 2.95 ms | 1.35 ms | 514 | 795.97 KB | — |
| Small File (smith.js - 9.28KB) | 1.05 ms | 2.91 ms | 1.15 ms | 1.22 ms | 1.51 ms | 2.52 ms | 2.91 ms | 1.35 ms | 513 | 777.99 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.27 ms | 5.82 ms | 2.40 ms | 2.57 ms | 2.93 ms | 4.33 ms | 5.42 ms | 2.75 ms | 249 | 1.37 MB | — |
| Large File (obfuscate.js - 89.57KB) | 79.31 ms | 86.90 ms | 82.44 ms | 84.18 ms | 85.34 ms | 85.83 ms | 85.83 ms | 83.57 ms | 9 | 32.50 MB | 15.58 ms |
| jscrush.js | 189.21 µs | 1.21 ms | 223.63 µs | 256.85 µs | 351.87 µs | 781.23 µs | 1.15 ms | 308.57 µs | 2263 | 257.17 KB | — |
| obfuscate.js | 45.37 ms | 57.58 ms | 46.72 ms | 47.39 ms | 50.36 ms | 52.31 ms | 52.31 ms | 49.26 ms | 10 | 20.74 MB | — |
