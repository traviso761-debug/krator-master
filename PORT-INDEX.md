# Krator: port index

*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; each build's tags are in its `PORT.md`.*

KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; `[G native]` is not ported. "split" counts the fragments whose note says they mix data with drawing or host code. Exporter, probe and assert say what the port can test against today.

| Build | Frags | KB | [G data] | [G shader] | [G native] | [web] | [draw] | split | exporter | probe | assert |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`core`](core/PORT.md) | 115 | 1230 | 776 | 101 | 52 | 163 | 137 | 6 | atmos, biome |  |  |
| [`settlements/dalab`](settlements/dalab/PORT.md) | 63 | 735 | 159 | 40 | 10 | 30 | 496 | 9 |  | yes | yes |
| [`settlements/dhelv`](settlements/dhelv/PORT.md) | 18 | 230 | 72 | 0 | 0 | 152 | 6 | 2 | atmos | yes | yes |
| [`settlements/girder`](settlements/girder/PORT.md) | 38 | 611 | 133 | 7 | 82 | 46 | 343 | 14 | atmos | yes | yes |
| [`settlements/highlands`](settlements/highlands/PORT.md) | 69 | 946 | 202 | 6 | 13 | 70 | 655 | 5 |  | yes | yes |
| [`settlements/hook`](settlements/hook/PORT.md) | 2 | 7 | 7 | 0 | 0 | 0 | 0 | 0 |  |  | yes |
| [`settlements/isle-demo`](settlements/isle-demo/PORT.md) | 26 | 298 | 229 | 0 | 0 | 60 | 9 | 1 |  |  | yes |
| [`settlements/iziz`](settlements/iziz/PORT.md) | 123 | 1582 | 485 | 24 | 54 | 129 | 890 | 8 | fixtures, atmos | yes | yes |
| [`settlements/jimjam`](settlements/jimjam/PORT.md) | 37 | 429 | 14 | 23 | 10 | 26 | 356 | 5 |  | yes | yes |
| [`settlements/locus`](settlements/locus/PORT.md) | 66 | 972 | 101 | 5 | 16 | 165 | 685 | 9 | atmos | yes | yes |
| [`settlements/longsong`](settlements/longsong/PORT.md) | 30 | 528 | 162 | 0 | 0 | 97 | 268 | 1 | biome, atmos | yes | yes |
| [`settlements/mavs-refuge`](settlements/mavs-refuge/PORT.md) | 36 | 721 | 62 | 0 | 15 | 325 | 319 | 2 |  | yes | yes |
| [`settlements/mungo`](settlements/mungo/PORT.md) | 21 | 217 | 117 | 0 | 5 | 60 | 35 | 4 | atmos | yes | yes |
| [`settlements/noahs-regret`](settlements/noahs-regret/PORT.md) | 35 | 281 | 36 | 13 | 10 | 66 | 157 | 4 | atmos | yes | yes |
| [`settlements/pinnacle-rock`](settlements/pinnacle-rock/PORT.md) | 30 | 329 | 152 | 0 | 0 | 24 | 153 | 1 | biome, atmos | yes | yes |
| [`settlements/port`](settlements/port/PORT.md) | 115 | 771 | 49 | 4 | 0 | 33 | 685 | 4 | atmos | yes | yes |
| [`settlements/reedlake`](settlements/reedlake/PORT.md) | 43 | 361 | 63 | 33 | 0 | 19 | 247 | 4 | atmos | yes | yes |
| [`settlements/screamers`](settlements/screamers/PORT.md) | 80 | 580 | 32 | 19 | 27 | 34 | 468 | 6 |  | yes | yes |
| [`settlements/shade`](settlements/shade/PORT.md) | 31 | 324 | 86 | 15 | 14 | 65 | 144 | 3 |  | yes | yes |
| [`settlements/verge`](settlements/verge/PORT.md) | 19 | 280 | 108 | 12 | 6 | 105 | 49 | 1 | biome | yes | yes |
| [`settlements/voth`](settlements/voth/PORT.md) | 111 | 2981 | 1190 | 0 | 106 | 469 | 1216 | 38 | own | yes | yes |
| [`settlements/xanadu`](settlements/xanadu/PORT.md) | 69 | 955 | 474 | 19 | 10 | 62 | 391 | 6 | atmos | yes | yes |
| [`settlements/ys`](settlements/ys/PORT.md) | 145 | 2035 | 361 | 59 | 105 | 110 | 1400 | 8 | atmos | yes | yes |
| [`settlements/yuni`](settlements/yuni/PORT.md) | 62 | 1073 | 129 | 13 | 16 | 157 | 758 | 11 | fixtures | yes | yes |
| [`kits/ancients`](kits/ancients/PORT.md) | 232 | 2715 | 288 | 39 | 176 | 32 | 2180 | 12 |  | yes | yes |
| [`kits/ancients-interiors`](kits/ancients-interiors/PORT.md) | 11 | 110 | 98 | 0 | 0 | 12 | 0 | 0 |  |  | yes |
| [`kits/ash-nomads`](kits/ash-nomads/PORT.md) | 25 | 171 | 33 | 6 | 10 | 24 | 97 | 2 | atmos | yes | yes |
| [`kits/beast-riders`](kits/beast-riders/PORT.md) | 18 | 444 | 15 | 0 | 0 | 11 | 418 | 3 |  |  | yes |
| [`kits/catalog`](kits/catalog/PORT.md) | 47 | 2176 | 42 | 0 | 10 | 59 | 2065 | 3 |  |  | yes |
| [`kits/crops`](kits/crops/PORT.md) | 7 | 47 | 41 | 0 | 0 | 7 | 0 | 0 |  | yes | yes |
| [`kits/desert-nomads`](kits/desert-nomads/PORT.md) | 26 | 165 | 36 | 6 | 10 | 24 | 89 | 2 | atmos | yes | yes |
| [`kits/eternian`](kits/eternian/PORT.md) | 44 | 284 | 31 | 6 | 10 | 24 | 213 | 4 | atmos | yes | yes |
| [`kits/fauna`](kits/fauna/PORT.md) | 7 | 33 | 0 | 0 | 10 | 23 | 0 | 0 |  |  | yes |
| [`kits/interiors`](kits/interiors/PORT.md) | 24 | 246 | 122 | 0 | 10 | 77 | 37 | 1 |  |  | yes |
| [`kits/islanders`](kits/islanders/PORT.md) | 39 | 416 | 28 | 6 | 10 | 24 | 348 | 3 | atmos | yes | yes |
| [`kits/lizardmen`](kits/lizardmen/PORT.md) | 29 | 212 | 16 | 6 | 10 | 24 | 155 | 3 | atmos | yes | yes |
| [`kits/mechs`](kits/mechs/PORT.md) | 7 | 38 | 0 | 0 | 10 | 28 | 0 | 0 |  |  | yes |
| [`kits/motor-vehicles`](kits/motor-vehicles/PORT.md) | 15 | 156 | 0 | 10 | 10 | 20 | 116 | 6 |  |  | yes |
| [`kits/post-apoc`](kits/post-apoc/PORT.md) | 27 | 392 | 2 | 8 | 0 | 48 | 334 | 1 |  | yes | yes |
| [`kits/pylon`](kits/pylon/PORT.md) | 12 | 103 | 59 | 0 | 0 | 0 | 44 | 0 |  |  | yes |
| [`kits/resources`](kits/resources/PORT.md) | 7 | 27 | 12 | 0 | 0 | 1 | 14 | 0 | atmos |  | yes |
| [`kits/ringsea`](kits/ringsea/PORT.md) | 48 | 283 | 1 | 6 | 0 | 48 | 227 | 1 | atmos | yes | yes |
| [`kits/scyvoi`](kits/scyvoi/PORT.md) | 27 | 188 | 11 | 6 | 10 | 24 | 137 | 2 | atmos | yes | yes |
| [`kits/talia`](kits/talia/PORT.md) | 12 | 206 | 196 | 0 | 0 | 0 | 10 | 0 |  |  | yes |
| [`kits/zeijani`](kits/zeijani/PORT.md) | 32 | 264 | 10 | 33 | 10 | 62 | 149 | 3 | atmos | yes | yes |
| [`biomes/crater-drylands`](biomes/crater-drylands/PORT.md) | 13 | 187 | 27 | 20 | 13 | 43 | 84 | 3 | biome | yes | yes |
| [`biomes/eastabyss`](biomes/eastabyss/PORT.md) | 14 | 201 | 3 | 0 | 14 | 28 | 156 | 5 | biome | yes | yes |
| [`biomes/ebadlands`](biomes/ebadlands/PORT.md) | 14 | 210 | 28 | 0 | 14 | 58 | 109 | 2 | biome | yes | yes |
| [`biomes/ehighlands`](biomes/ehighlands/PORT.md) | 12 | 143 | 13 | 18 | 16 | 32 | 63 | 2 | biome | yes | yes |
| [`biomes/geyser`](biomes/geyser/PORT.md) | 17 | 166 | 38 | 35 | 14 | 35 | 44 | 2 | biome, atmos | yes | yes |
| [`biomes/guilin`](biomes/guilin/PORT.md) | 13 | 112 | 40 | 0 | 0 | 12 | 60 | 3 | biome, atmos | yes | yes |
| [`biomes/hyperjungle`](biomes/hyperjungle/PORT.md) | 15 | 152 | 3 | 0 | 12 | 16 | 120 | 6 | biome | yes | yes |
| [`biomes/korona`](biomes/korona/PORT.md) | 12 | 120 | 16 | 0 | 0 | 16 | 89 | 3 | biome, atmos | yes | yes |
| [`biomes/necanyons`](biomes/necanyons/PORT.md) | 14 | 108 | 35 | 0 | 0 | 10 | 63 | 3 | biome, atmos | yes | yes |
| [`biomes/nhighlands`](biomes/nhighlands/PORT.md) | 14 | 245 | 0 | 0 | 34 | 36 | 175 | 6 | biome | yes | yes |
| [`biomes/nwbay`](biomes/nwbay/PORT.md) | 16 | 276 | 3 | 0 | 10 | 65 | 198 | 7 | biome | yes | yes |
| [`biomes/nwlowlands`](biomes/nwlowlands/PORT.md) | 13 | 179 | 2 | 0 | 13 | 33 | 131 | 5 | biome | yes | yes |
| [`biomes/oidong`](biomes/oidong/PORT.md) | 11 | 181 | 1 | 0 | 12 | 13 | 155 | 2 | biome, atmos | yes | yes |
| [`biomes/rift`](biomes/rift/PORT.md) | 13 | 211 | 2 | 0 | 16 | 29 | 164 | 5 | biome | yes | yes |
| [`biomes/ringisles`](biomes/ringisles/PORT.md) | 19 | 189 | 64 | 14 | 14 | 39 | 57 | 2 | biome, atmos | yes | yes |
| [`biomes/sedesert`](biomes/sedesert/PORT.md) | 15 | 211 | 1 | 0 | 14 | 62 | 135 | 6 | biome, atmos | yes | yes |
| [`biomes/shighlands`](biomes/shighlands/PORT.md) | 12 | 154 | 14 | 0 | 13 | 31 | 97 | 2 | biome, atmos | yes | yes |
| [`biomes/swbay`](biomes/swbay/PORT.md) | 15 | 192 | 2 | 0 | 10 | 34 | 145 | 6 | biome | yes | yes |
| [`biomes/swlowlands`](biomes/swlowlands/PORT.md) | 13 | 204 | 2 | 0 | 13 | 34 | 155 | 5 | biome | yes | yes |
| [`biomes/throne`](biomes/throne/PORT.md) | 14 | 302 | 53 | 22 | 15 | 37 | 176 | 2 | biome, atmos | yes | yes |
| [`biomes/xanadu`](biomes/xanadu/PORT.md) | 15 | 218 | 2 | 0 | 12 | 31 | 172 | 5 | biome | yes | yes |
| [`openworld/isle-demo`](openworld/isle-demo/PORT.md) | 10 | 91 | 26 | 10 | 0 | 55 | 0 | 0 |  |  | yes |
| [`openworld/little-demo`](openworld/little-demo/PORT.md) | 19 | 167 | 56 | 0 | 9 | 96 | 6 | 2 |  | yes | yes |
| [`core/charactermodels`](core/charactermodels/PORT.md) | 7 | 243 | 22 | 0 | 0 | 101 | 120 | 0 |  |  | yes |
| **all** | 2410 | 31614 | 6694 (21%) | 646 (2%) | 1110 (4%) | 3988 (13%) | 19177 (61%) | 282 | | | |

## Host-shell copies

The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. "versions" is the number of byte-distinct copies: the drift to reconcile.

| Family | Builds | Versions | KB total |
|---|---|---|---|
| `host-stage` | 24 | 24 | 437 |
| `host-build` | 24 | 24 | 34 |
| `sky` | 23 | 5 | 445 |
| `camera` | 19 | 15 | 133 |
| `host-sky` | 19 | 17 | 268 |
| `probe` | 18 | 16 | 80 |
| `start` | 18 | 18 | 68 |
| `stats` | 11 | 1 | 13 |
| `host-tower` | 9 | 9 | 47 |
| `pathviz` | 6 | 5 | 39 |
| `daynight` | 5 | 4 | 72 |
| `inspect` | 5 | 5 | 30 |
| `hover` | 5 | 5 | 18 |
| `polygon` | 4 | 4 | 19 |
| `walk` | 2 | 2 | 24 |
| `sheetui` | 2 | 1 | 8 |
| `host-camera` | 1 | 1 | 12 |
| `host-polytool` | 1 | 1 | 6 |
| `host-probe` | 1 | 1 | 4 |
| `underview` | 1 | 1 | 3 |
| `polytool` | 1 | 1 | 3 |
