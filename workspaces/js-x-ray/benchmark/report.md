# Benchmark Report

- **Timestamp:** 2026-11-15T03:41:19.212Z
- **Runtime:** node
- **CPU:** Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz (~3.35 GHz)

| Benchmark | min | max | p25 | p50 | p75 | p99 | p999 | avg | samples | heap (avg) | gc (avg) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small File (jscrush.js - 1.03KB) | 218.06 µs | 1.18 ms | 257.66 µs | 296.62 µs | 421.79 µs | 777.71 µs | 1.15 ms | 350.52 µs | 1983 | 274.46 KB | — |
| Small File (npm-audit.js - 1.46KB) | 565.43 µs | 2.11 ms | 655.60 µs | 716.27 µs | 1.01 ms | 1.53 ms | 1.97 ms | 812.71 µs | 856 | 433.62 KB | — |
| Small File (forbes-skimmer.js - 2.15KB) | 1.54 ms | 5.29 ms | 1.62 ms | 1.76 ms | 2.13 ms | 3.56 ms | 4.76 ms | 1.97 ms | 351 | 738.48 KB | — |
| Small File (rate-map.js - 2.21KB) | 1.43 ms | 4.44 ms | 1.55 ms | 1.82 ms | 2.01 ms | 3.77 ms | 4.16 ms | 1.89 ms | 366 | 765.03 KB | — |
| Small File (event-stream.js - 3.76KB) | 1.59 ms | 4.82 ms | 1.75 ms | 2.09 ms | 2.21 ms | 3.73 ms | 4.55 ms | 2.10 ms | 329 | 889.34 KB | — |
| Small File (modrrnize.js - 9.28KB) | 1.08 ms | 2.92 ms | 1.18 ms | 1.25 ms | 1.51 ms | 2.30 ms | 2.67 ms | 1.35 ms | 512 | 770.70 KB | — |
| Small File (smith.js - 9.28KB) | 1.05 ms | 3.18 ms | 1.13 ms | 1.20 ms | 1.51 ms | 2.36 ms | 3.11 ms | 1.34 ms | 517 | 766.56 KB | — |
| Medium File (kopiluwak.js - 15.45KB) | 2.35 ms | 5.94 ms | 2.46 ms | 2.82 ms | 3.01 ms | 4.67 ms | 4.95 ms | 2.89 ms | 238 | 1.36 MB | — |
| Large File (obfuscate.js - 89.57KB) | 81.78 ms | 88.81 ms | 84.58 ms | 84.84 ms | 87.96 ms | 88.47 ms | 88.47 ms | 85.53 ms | 9 | 31.65 MB | 16.37 ms |
| jscrush.js | 240.91 µs | 1.38 ms | 282.38 µs | 317.79 µs | 431.52 µs | 837.10 µs | 1.25 ms | 373.81 µs | 1863 | 270.84 KB | — |
| obfuscate.js | 47.50 ms | 60.25 ms | 48.70 ms | 53.45 ms | 54.97 ms | 55.07 ms | 55.07 ms | 52.69 ms | 9 | 20.73 MB | — |
