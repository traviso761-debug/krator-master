# Krator: port index

*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; each build's tags are in its `PORT.md`.*

KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; `[G native]` is not ported. "split" counts the fragments whose note says they mix data with drawing or host code. Exporter, probe and assert say what the port can test against today.

| Build | Frags | KB | [G data] | [G shader] | [G native] | [web] | [draw] | split | exporter | probe | assert |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`core`](core/PORT.md) | 40 | 289 | 118 | 42 | 52 | 12 | 65 | 3 | atmos, biome |  |  |
| [`settlements/dalab`](settlements/dalab/PORT.md) | 59 | 714 | 149 | 40 | 10 | 38 | 478 | 9 |  | yes | yes |
| [`settlements/girder`](settlements/girder/PORT.md) | 32 | 598 | 122 | 7 | 88 | 42 | 339 | 11 | atmos | yes | yes |
| [`settlements/highlands`](settlements/highlands/PORT.md) | 74 | 1078 | 221 | 19 | 13 | 77 | 748 | 7 |  | yes | yes |
| [`settlements/iziz`](settlements/iziz/PORT.md) | 81 | 785 | 156 | 23 | 42 | 47 | 517 | 6 | atmos | yes | yes |
| [`settlements/jimjam`](settlements/jimjam/PORT.md) | 34 | 417 | 7 | 20 | 10 | 34 | 347 | 5 |  | yes | yes |
| [`settlements/locus`](settlements/locus/PORT.md) | 67 | 1024 | 118 | 13 | 16 | 148 | 729 | 13 |  | yes | yes |
| [`settlements/mavs-refuge`](settlements/mavs-refuge/PORT.md) | 31 | 698 | 56 | 0 | 15 | 318 | 309 | 5 |  | yes | yes |
| [`settlements/port`](settlements/port/PORT.md) | 112 | 760 | 42 | 0 | 0 | 32 | 686 | 4 |  | yes | yes |
| [`settlements/reedlake`](settlements/reedlake/PORT.md) | 36 | 327 | 53 | 33 | 0 | 26 | 215 | 4 |  | yes | yes |
| [`settlements/screamers`](settlements/screamers/PORT.md) | 76 | 569 | 19 | 19 | 27 | 44 | 460 | 6 |  | yes | yes |
| [`settlements/shade`](settlements/shade/PORT.md) | 28 | 319 | 77 | 15 | 13 | 71 | 142 | 3 |  | yes | yes |
| [`settlements/voth`](settlements/voth/PORT.md) | 65 | 1794 | 407 | 0 | 106 | 107 | 1175 | 37 | atmos | yes | yes |
| [`settlements/xanadu`](settlements/xanadu/PORT.md) | 64 | 886 | 437 | 19 | 10 | 56 | 365 | 6 |  | yes | yes |
| [`settlements/ys`](settlements/ys/PORT.md) | 64 | 874 | 70 | 28 | 29 | 39 | 708 | 5 |  | yes | yes |
| [`settlements/yuni`](settlements/yuni/PORT.md) | 47 | 1022 | 105 | 13 | 16 | 140 | 748 | 11 | fixtures | yes | yes |
| [`kits/ancients`](kits/ancients/PORT.md) | 199 | 2473 | 239 | 34 | 174 | 27 | 1999 | 5 |  | yes | yes |
| [`kits/catalog`](kits/catalog/PORT.md) | 37 | 1329 | 11 | 0 | 10 | 55 | 1254 | 3 |  |  | yes |
| [`kits/interiors`](kits/interiors/PORT.md) | 23 | 230 | 120 | 0 | 10 | 63 | 37 | 1 |  |  | yes |
| [`kits/post-apoc`](kits/post-apoc/PORT.md) | 26 | 390 | 1 | 8 | 0 | 54 | 327 | 2 |  | yes | yes |
| [`kits/ringsea`](kits/ringsea/PORT.md) | 37 | 230 | 0 | 6 | 0 | 49 | 174 | 1 |  | yes | yes |
| [`biomes/eastabyss`](biomes/eastabyss/PORT.md) | 13 | 175 | 1 | 0 | 14 | 29 | 131 | 5 | biome | yes | yes |
| [`biomes/hyperjungle`](biomes/hyperjungle/PORT.md) | 15 | 137 | 2 | 0 | 12 | 16 | 107 | 6 | biome | yes | yes |
| [`biomes/nhighlands`](biomes/nhighlands/PORT.md) | 16 | 222 | 0 | 0 | 34 | 44 | 145 | 6 | biome | yes | yes |
| [`biomes/nwbay`](biomes/nwbay/PORT.md) | 15 | 224 | 1 | 0 | 10 | 59 | 154 | 6 | biome | yes | yes |
| [`biomes/nwlowlands`](biomes/nwlowlands/PORT.md) | 13 | 174 | 1 | 0 | 13 | 34 | 127 | 5 | biome | yes | yes |
| [`biomes/rift`](biomes/rift/PORT.md) | 13 | 204 | 1 | 0 | 16 | 29 | 159 | 5 | biome | yes | yes |
| [`biomes/sedesert`](biomes/sedesert/PORT.md) | 15 | 173 | 1 | 0 | 13 | 51 | 108 | 6 | biome | yes | yes |
| [`biomes/swbay`](biomes/swbay/PORT.md) | 15 | 181 | 1 | 0 | 10 | 37 | 133 | 6 | biome | yes | yes |
| [`biomes/swlowlands`](biomes/swlowlands/PORT.md) | 13 | 196 | 1 | 0 | 13 | 34 | 148 | 5 | biome | yes | yes |
| [`biomes/xanadu`](biomes/xanadu/PORT.md) | 15 | 206 | 1 | 0 | 12 | 33 | 160 | 5 | biome | yes | yes |
| **all** | 1373 | 18633 | 2539 (14%) | 339 (2%) | 786 (4%) | 1790 (10%) | 13180 (71%) | 202 | | | |

## Host-shell copies

The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. "versions" is the number of byte-distinct copies: the drift to reconcile.

| Family | Builds | Versions | KB total |
|---|---|---|---|
| `camera` | 17 | 13 | 188 |
| `probe` | 15 | 12 | 49 |
| `sky` | 12 | 5 | 340 |
| `stats` | 11 | 1 | 13 |
| `host-stage` | 11 | 11 | 228 |
| `host-sky` | 11 | 9 | 161 |
| `host-build` | 11 | 11 | 13 |
| `host-camera` | 11 | 11 | 92 |
| `host-probe` | 11 | 11 | 61 |
| `host-tower` | 9 | 9 | 42 |
| `pathviz` | 6 | 5 | 40 |
| `daynight` | 5 | 4 | 72 |
| `inspect` | 5 | 5 | 31 |
| `start` | 5 | 3 | 1 |
| `sheetui` | 2 | 1 | 8 |
| `polytool` | 2 | 2 | 10 |
| `hover` | 2 | 2 | 9 |
| `walk` | 1 | 1 | 19 |
| `underview` | 1 | 1 | 3 |
| `polygon` | 1 | 1 | 5 |
| `host-polytool` | 1 | 1 | 6 |
