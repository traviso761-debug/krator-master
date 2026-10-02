# Krator: port index

*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; each build's tags are in its `PORT.md`.*

KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; `[G native]` is not ported. "split" counts the fragments whose note says they mix data with drawing or host code. Exporter, probe and assert say what the port can test against today.

| Build | Frags | KB | [G data] | [G shader] | [G native] | [web] | [draw] | split | exporter | probe | assert |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`core`](core/PORT.md) | 32 | 254 | 106 | 36 | 47 | 1 | 65 | 5 | yes |  |  |
| [`settlements/dalab`](settlements/dalab/PORT.md) | 59 | 714 | 149 | 40 | 10 | 50 | 466 | 9 |  | yes | yes |
| [`settlements/girder`](settlements/girder/PORT.md) | 29 | 559 | 42 | 0 | 14 | 318 | 185 | 6 |  | yes | yes |
| [`settlements/highlands`](settlements/highlands/PORT.md) | 74 | 1078 | 221 | 19 | 13 | 77 | 748 | 7 |  | yes | yes |
| [`settlements/iziz`](settlements/iziz/PORT.md) | 81 | 784 | 156 | 23 | 42 | 89 | 473 | 5 |  | yes | yes |
| [`settlements/jimjam`](settlements/jimjam/PORT.md) | 34 | 417 | 7 | 20 | 10 | 34 | 347 | 5 |  | yes | yes |
| [`settlements/locus`](settlements/locus/PORT.md) | 67 | 1024 | 118 | 13 | 16 | 148 | 729 | 13 |  | yes | yes |
| [`settlements/mavs-refuge`](settlements/mavs-refuge/PORT.md) | 29 | 631 | 56 | 0 | 14 | 263 | 298 | 5 |  | yes | yes |
| [`settlements/port`](settlements/port/PORT.md) | 112 | 760 | 42 | 0 | 0 | 32 | 686 | 4 |  | yes | yes |
| [`settlements/reedlake`](settlements/reedlake/PORT.md) | 36 | 327 | 53 | 33 | 0 | 26 | 215 | 4 |  | yes | yes |
| [`settlements/screamers`](settlements/screamers/PORT.md) | 76 | 569 | 19 | 19 | 27 | 44 | 460 | 6 |  | yes | yes |
| [`settlements/shade`](settlements/shade/PORT.md) | 28 | 319 | 77 | 15 | 13 | 71 | 142 | 3 |  | yes | yes |
| [`settlements/voth`](settlements/voth/PORT.md) | 63 | 1792 | 164 | 0 | 6 | 378 | 1245 | 15 |  | yes | yes |
| [`settlements/xanadu`](settlements/xanadu/PORT.md) | 64 | 886 | 437 | 19 | 10 | 56 | 365 | 6 |  | yes | yes |
| [`settlements/yuni`](settlements/yuni/PORT.md) | 47 | 1022 | 105 | 13 | 16 | 140 | 748 | 11 | yes | yes | yes |
| [`kits/ancients`](kits/ancients/PORT.md) | 199 | 2473 | 239 | 34 | 174 | 27 | 1999 | 5 |  | yes | yes |
| [`kits/catalog`](kits/catalog/PORT.md) | 37 | 1329 | 11 | 0 | 10 | 55 | 1254 | 3 |  |  | yes |
| [`kits/interiors`](kits/interiors/PORT.md) | 23 | 230 | 120 | 0 | 10 | 63 | 37 | 1 |  |  | yes |
| [`kits/post-apoc`](kits/post-apoc/PORT.md) | 26 | 390 | 1 | 8 | 0 | 54 | 327 | 2 |  | yes | yes |
| [`kits/ringsea`](kits/ringsea/PORT.md) | 37 | 230 | 0 | 6 | 0 | 49 | 174 | 1 |  | yes | yes |
| [`biomes/eastabyss`](biomes/eastabyss/PORT.md) | 13 | 175 | 17 | 0 | 14 | 34 | 110 | 2 |  | yes | yes |
| [`biomes/hyperjungle`](biomes/hyperjungle/PORT.md) | 15 | 135 | 2 | 0 | 12 | 21 | 100 | 2 |  | yes | yes |
| [`biomes/nhighlands`](biomes/nhighlands/PORT.md) | 16 | 222 | 19 | 0 | 34 | 49 | 121 | 3 |  | yes | yes |
| [`biomes/nwlowlands`](biomes/nwlowlands/PORT.md) | 13 | 174 | 17 | 0 | 13 | 38 | 106 | 2 |  | yes | yes |
| [`biomes/rift`](biomes/rift/PORT.md) | 13 | 204 | 25 | 0 | 16 | 33 | 131 | 2 |  | yes | yes |
| [`biomes/sedesert`](biomes/sedesert/PORT.md) | 15 | 173 | 20 | 0 | 13 | 55 | 83 | 2 |  | yes | yes |
| [`biomes/swbay`](biomes/swbay/PORT.md) | 15 | 181 | 15 | 0 | 10 | 41 | 114 | 2 |  | yes | yes |
| [`biomes/swlowlands`](biomes/swlowlands/PORT.md) | 13 | 196 | 25 | 0 | 13 | 38 | 119 | 2 |  | yes | yes |
| [`biomes/xanadu`](biomes/xanadu/PORT.md) | 15 | 206 | 1 | 0 | 12 | 33 | 160 | 2 |  | yes | yes |
| **all** | 1281 | 17454 | 2263 (13%) | 298 (2%) | 568 (3%) | 2318 (13%) | 12007 (69%) | 135 | | | |

## Host-shell copies

The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. "versions" is the number of byte-distinct copies: the drift to reconcile.

| Family | Builds | Versions | KB total |
|---|---|---|---|
| `camera` | 16 | 12 | 172 |
| `probe` | 15 | 12 | 49 |
| `sky` | 11 | 5 | 330 |
| `stats` | 10 | 1 | 12 |
| `host-stage` | 10 | 10 | 185 |
| `host-sky` | 10 | 9 | 151 |
| `host-build` | 10 | 10 | 11 |
| `host-camera` | 10 | 10 | 83 |
| `host-probe` | 10 | 10 | 58 |
| `host-tower` | 8 | 8 | 38 |
| `pathviz` | 6 | 5 | 40 |
| `daynight` | 5 | 4 | 72 |
| `inspect` | 5 | 5 | 30 |
| `start` | 4 | 2 | 1 |
| `sheetui` | 2 | 1 | 8 |
| `polytool` | 2 | 2 | 10 |
| `hover` | 2 | 2 | 9 |
| `walk` | 1 | 1 | 19 |
| `underview` | 1 | 1 | 3 |
| `polygon` | 1 | 1 | 5 |
| `host-polytool` | 1 | 1 | 6 |
