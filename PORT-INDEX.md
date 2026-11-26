# Krator: port index

*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; each build's tags are in its `PORT.md`.*

KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; `[G native]` is not ported. "split" counts the fragments whose note says they mix data with drawing or host code. Exporter, probe and assert say what the port can test against today.

| Build | Frags | KB | [G data] | [G shader] | [G native] | [web] | [draw] | split | exporter | probe | assert |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`core`](core/PORT.md) | 348 | 4717 | 2239 | 516 | 116 | 1107 | 739 | 32 | atmos, biome |  |  |
| [`settlements/dalab`](settlements/dalab/PORT.md) | 55 | 560 | 123 | 27 | 10 | 30 | 371 | 7 | atmos | yes | yes |
| [`settlements/dhelv`](settlements/dhelv/PORT.md) | 18 | 230 | 72 | 0 | 0 | 152 | 6 | 2 | atmos | yes | yes |
| [`settlements/girder`](settlements/girder/PORT.md) | 39 | 635 | 135 | 7 | 91 | 47 | 356 | 14 | atmos | yes | yes |
| [`settlements/highlands`](settlements/highlands/PORT.md) | 42 | 320 | 46 | 6 | 13 | 73 | 182 | 3 |  | yes | yes |
| [`settlements/hook`](settlements/hook/PORT.md) | 2 | 7 | 7 | 0 | 0 | 0 | 0 | 0 |  |  | yes |
| [`settlements/isle-demo`](settlements/isle-demo/PORT.md) | 39 | 626 | 532 | 0 | 0 | 84 | 9 | 2 |  |  | yes |
| [`settlements/iziz`](settlements/iziz/PORT.md) | 94 | 1022 | 217 | 6 | 45 | 129 | 626 | 6 | fixtures, atmos | yes | yes |
| [`settlements/jimjam`](settlements/jimjam/PORT.md) | 37 | 429 | 14 | 23 | 10 | 26 | 357 | 5 | atmos | yes | yes |
| [`settlements/locus`](settlements/locus/PORT.md) | 41 | 472 | 101 | 5 | 18 | 170 | 177 | 7 | atmos | yes | yes |
| [`settlements/longsong`](settlements/longsong/PORT.md) | 30 | 531 | 162 | 0 | 0 | 98 | 270 | 1 | biome, atmos | yes | yes |
| [`settlements/mavs-refuge`](settlements/mavs-refuge/PORT.md) | 38 | 741 | 62 | 0 | 16 | 332 | 331 | 3 |  | yes | yes |
| [`settlements/mungo`](settlements/mungo/PORT.md) | 21 | 217 | 117 | 0 | 5 | 60 | 35 | 4 | atmos | yes | yes |
| [`settlements/noahs-regret`](settlements/noahs-regret/PORT.md) | 34 | 251 | 36 | 13 | 0 | 67 | 135 | 4 | atmos | yes | yes |
| [`settlements/pinnacle-rock`](settlements/pinnacle-rock/PORT.md) | 30 | 329 | 152 | 0 | 0 | 24 | 153 | 1 | biome, atmos | yes | yes |
| [`settlements/reedlake`](settlements/reedlake/PORT.md) | 43 | 364 | 63 | 33 | 0 | 19 | 249 | 4 | atmos | yes | yes |
| [`settlements/screamers`](settlements/screamers/PORT.md) | 81 | 581 | 32 | 19 | 27 | 34 | 469 | 6 |  | yes | yes |
| [`settlements/shade`](settlements/shade/PORT.md) | 19 | 164 | 51 | 0 | 0 | 65 | 48 | 1 | atmos | yes | yes |
| [`settlements/span`](settlements/span/PORT.md) | 9 | 108 | 74 | 0 | 0 | 15 | 19 | 0 | atmos |  | yes |
| [`settlements/verge`](settlements/verge/PORT.md) | 20 | 285 | 108 | 12 | 6 | 110 | 49 | 1 | biome | yes | yes |
| [`settlements/voth`](settlements/voth/PORT.md) | 111 | 2982 | 1191 | 0 | 106 | 469 | 1216 | 38 | own | yes | yes |
| [`settlements/xanadu`](settlements/xanadu/PORT.md) | 48 | 661 | 296 | 19 | 10 | 66 | 270 | 5 | atmos | yes | yes |
| [`settlements/ys`](settlements/ys/PORT.md) | 82 | 1194 | 257 | 18 | 96 | 106 | 717 | 2 | atmos | yes | yes |
| [`settlements/yuni`](settlements/yuni/PORT.md) | 54 | 870 | 130 | 13 | 18 | 170 | 539 | 11 | fixtures | yes | yes |
| [`kits/ancient-transit`](kits/ancient-transit/PORT.md) | 23 | 268 | 122 | 0 | 0 | 36 | 110 | 1 | biome, atmos |  | yes |
| [`kits/ancients`](kits/ancients/PORT.md) | 257 | 3025 | 361 | 39 | 176 | 48 | 2401 | 13 |  | yes | yes |
| [`kits/ancients-interiors`](kits/ancients-interiors/PORT.md) | 13 | 123 | 107 | 0 | 0 | 16 | 0 | 0 |  |  | yes |
| [`kits/ash-nomads`](kits/ash-nomads/PORT.md) | 14 | 99 | 34 | 0 | 0 | 1 | 64 | 0 | atmos |  | yes |
| [`kits/beast-riders`](kits/beast-riders/PORT.md) | 18 | 448 | 15 | 0 | 0 | 13 | 420 | 3 |  |  | yes |
| [`kits/catalog`](kits/catalog/PORT.md) | 45 | 2174 | 31 | 0 | 0 | 25 | 2118 | 3 | atmos |  | yes |
| [`kits/construction`](kits/construction/PORT.md) | 5 | 35 | 0 | 0 | 0 | 20 | 15 | 0 | atmos | yes | yes |
| [`kits/crops`](kits/crops/PORT.md) | 7 | 67 | 60 | 0 | 0 | 7 | 0 | 0 |  | yes | yes |
| [`kits/desert-nomads`](kits/desert-nomads/PORT.md) | 15 | 93 | 36 | 0 | 0 | 1 | 56 | 0 | atmos |  | yes |
| [`kits/eastern-abyssal`](kits/eastern-abyssal/PORT.md) | 10 | 182 | 0 | 0 | 0 | 0 | 182 | 1 |  |  | yes |
| [`kits/eternian`](kits/eternian/PORT.md) | 32 | 224 | 31 | 0 | 0 | 1 | 192 | 1 | atmos |  | yes |
| [`kits/extraplanar`](kits/extraplanar/PORT.md) | 8 | 18 | 0 | 0 | 1 | 17 | 0 | 0 | atmos |  | yes |
| [`kits/fauna`](kits/fauna/PORT.md) | 5 | 24 | 0 | 0 | 0 | 24 | 0 | 0 | atmos |  | yes |
| [`kits/highlands`](kits/highlands/PORT.md) | 34 | 660 | 164 | 0 | 0 | 0 | 496 | 2 |  |  | yes |
| [`kits/interiors`](kits/interiors/PORT.md) | 22 | 246 | 126 | 0 | 0 | 79 | 41 | 1 | atmos |  | yes |
| [`kits/islanders`](kits/islanders/PORT.md) | 28 | 353 | 28 | 0 | 0 | 1 | 324 | 1 | atmos |  | yes |
| [`kits/iziz-vernacular`](kits/iziz-vernacular/PORT.md) | 26 | 395 | 257 | 2 | 0 | 15 | 121 | 1 | fixtures | yes | yes |
| [`kits/lizardmen`](kits/lizardmen/PORT.md) | 17 | 138 | 17 | 0 | 0 | 1 | 120 | 1 | atmos |  | yes |
| [`kits/locus`](kits/locus/PORT.md) | 8 | 112 | 0 | 0 | 0 | 0 | 112 | 1 |  |  | yes |
| [`kits/mechs`](kits/mechs/PORT.md) | 5 | 28 | 0 | 0 | 0 | 28 | 0 | 0 | atmos |  | yes |
| [`kits/metropolis`](kits/metropolis/PORT.md) | 36 | 585 | 250 | 4 | 0 | 46 | 286 | 3 | biome, atmos | yes | yes |
| [`kits/motor-vehicles`](kits/motor-vehicles/PORT.md) | 14 | 249 | 0 | 10 | 0 | 23 | 216 | 6 | atmos |  | yes |
| [`kits/port`](kits/port/PORT.md) | 116 | 774 | 49 | 4 | 0 | 35 | 686 | 4 | atmos | yes | yes |
| [`kits/post-apoc`](kits/post-apoc/PORT.md) | 29 | 402 | 2 | 8 | 0 | 37 | 354 | 2 |  | yes | yes |
| [`kits/pylon`](kits/pylon/PORT.md) | 14 | 120 | 65 | 0 | 0 | 0 | 55 | 0 |  |  | yes |
| [`kits/resources`](kits/resources/PORT.md) | 9 | 62 | 32 | 0 | 0 | 9 | 22 | 0 | atmos |  | yes |
| [`kits/ringsea`](kits/ringsea/PORT.md) | 48 | 283 | 1 | 6 | 0 | 48 | 227 | 1 | atmos | yes | yes |
| [`kits/scyvoi`](kits/scyvoi/PORT.md) | 15 | 117 | 11 | 0 | 0 | 1 | 105 | 0 | atmos |  | yes |
| [`kits/talia`](kits/talia/PORT.md) | 12 | 223 | 211 | 0 | 0 | 0 | 12 | 0 |  |  | yes |
| [`kits/tents`](kits/tents/PORT.md) | 13 | 71 | 21 | 0 | 0 | 10 | 40 | 1 | atmos | yes | yes |
| [`kits/xanadu`](kits/xanadu/PORT.md) | 35 | 474 | 244 | 0 | 0 | 36 | 194 | 1 |  |  | yes |
| [`kits/yeti`](kits/yeti/PORT.md) | 31 | 183 | 30 | 0 | 0 | 8 | 145 | 3 | atmos |  | yes |
| [`kits/yuni`](kits/yuni/PORT.md) | 17 | 254 | 1 | 0 | 0 | 19 | 235 | 0 |  |  | yes |
| [`kits/zeijani`](kits/zeijani/PORT.md) | 31 | 257 | 10 | 33 | 0 | 64 | 150 | 3 | atmos | yes | yes |
| [`biomes/abyssal-savannah`](biomes/abyssal-savannah/PORT.md) | 31 | 189 | 43 | 0 | 4 | 59 | 83 | 7 | biome, atmos | yes | yes |
| [`biomes/ancientsvalley`](biomes/ancientsvalley/PORT.md) | 31 | 359 | 86 | 0 | 4 | 209 | 61 | 3 | biome, atmos | yes | yes |
| [`biomes/catch`](biomes/catch/PORT.md) | 21 | 102 | 1 | 0 | 0 | 53 | 48 | 4 | biome, atmos | yes | yes |
| [`biomes/copperglacier`](biomes/copperglacier/PORT.md) | 15 | 83 | 12 | 8 | 1 | 28 | 34 | 0 | biome, atmos |  | yes |
| [`biomes/crater-drylands`](biomes/crater-drylands/PORT.md) | 16 | 191 | 25 | 21 | 2 | 53 | 90 | 3 | biome, atmos | yes | yes |
| [`biomes/cut`](biomes/cut/PORT.md) | 19 | 125 | 14 | 0 | 2 | 50 | 59 | 4 | biome, atmos | yes | yes |
| [`biomes/dambasins`](biomes/dambasins/PORT.md) | 25 | 118 | 33 | 0 | 2 | 24 | 60 | 4 | atmos | yes | yes |
| [`biomes/eastabyss`](biomes/eastabyss/PORT.md) | 18 | 229 | 7 | 11 | 2 | 41 | 168 | 5 | biome, atmos | yes | yes |
| [`biomes/ebadlands`](biomes/ebadlands/PORT.md) | 19 | 252 | 61 | 0 | 2 | 72 | 117 | 1 | biome, atmos | yes | yes |
| [`biomes/ehighlands`](biomes/ehighlands/PORT.md) | 20 | 197 | 43 | 21 | 6 | 28 | 99 | 2 | biome, atmos | yes | yes |
| [`biomes/farside`](biomes/farside/PORT.md) | 18 | 132 | 1 | 0 | 0 | 41 | 90 | 5 | biome, atmos | yes | yes |
| [`biomes/firebliss`](biomes/firebliss/PORT.md) | 18 | 113 | 23 | 11 | 2 | 40 | 36 | 1 | biome, atmos |  | yes |
| [`biomes/geyser`](biomes/geyser/PORT.md) | 20 | 181 | 41 | 38 | 4 | 46 | 52 | 2 | biome, atmos | yes | yes |
| [`biomes/godshearth`](biomes/godshearth/PORT.md) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | biome, atmos |  | yes |
| [`biomes/godstep`](biomes/godstep/PORT.md) | 22 | 96 | 20 | 0 | 6 | 45 | 25 | 5 | biome, atmos | yes | yes |
| [`biomes/godthrone`](biomes/godthrone/PORT.md) | 22 | 132 | 18 | 0 | 7 | 53 | 53 | 5 | biome, atmos | yes | yes |
| [`biomes/greatchasm`](biomes/greatchasm/PORT.md) | 16 | 92 | 13 | 0 | 2 | 43 | 35 | 1 | biome, atmos | yes | yes |
| [`biomes/greenstep`](biomes/greenstep/PORT.md) | 16 | 102 | 19 | 0 | 2 | 39 | 42 | 2 | biome, atmos | yes | yes |
| [`biomes/guilin`](biomes/guilin/PORT.md) | 14 | 113 | 40 | 0 | 2 | 11 | 60 | 3 | biome, atmos | yes | yes |
| [`biomes/hearths`](biomes/hearths/PORT.md) | 3 | 26 | 26 | 0 | 0 | 0 | 0 | 0 | biome, atmos |  | yes |
| [`biomes/highrift`](biomes/highrift/PORT.md) | 17 | 93 | 13 | 11 | 2 | 29 | 39 | 1 | biome, atmos |  | yes |
| [`biomes/hyperjungle`](biomes/hyperjungle/PORT.md) | 22 | 233 | 7 | 0 | 14 | 28 | 184 | 6 | biome, atmos | yes | yes |
| [`biomes/k-guilin`](biomes/k-guilin/PORT.md) | 17 | 152 | 47 | 0 | 0 | 24 | 81 | 3 | biome, atmos | yes | yes |
| [`biomes/korona`](biomes/korona/PORT.md) | 16 | 163 | 17 | 0 | 1 | 31 | 114 | 3 | biome, atmos | yes | yes |
| [`biomes/necanyons`](biomes/necanyons/PORT.md) | 18 | 155 | 38 | 0 | 2 | 21 | 94 | 3 | biome, atmos | yes | yes |
| [`biomes/neouterwall`](biomes/neouterwall/PORT.md) | 14 | 113 | 24 | 0 | 4 | 36 | 49 | 2 | biome, atmos | yes | yes |
| [`biomes/nhighlands`](biomes/nhighlands/PORT.md) | 19 | 269 | 3 | 0 | 15 | 46 | 205 | 6 | biome, atmos | yes | yes |
| [`biomes/nsemiarid`](biomes/nsemiarid/PORT.md) | 18 | 252 | 33 | 16 | 2 | 58 | 143 | 2 | biome, atmos | yes | yes |
| [`biomes/nwbay`](biomes/nwbay/PORT.md) | 20 | 328 | 8 | 0 | 2 | 89 | 228 | 7 | biome, atmos | yes | yes |
| [`biomes/nwlowlands`](biomes/nwlowlands/PORT.md) | 20 | 221 | 9 | 0 | 2 | 45 | 164 | 7 | biome, atmos | yes | yes |
| [`biomes/nwouterwall`](biomes/nwouterwall/PORT.md) | 15 | 139 | 23 | 0 | 0 | 35 | 80 | 3 | biome, atmos | yes | yes |
| [`biomes/oidong`](biomes/oidong/PORT.md) | 15 | 229 | 4 | 0 | 14 | 23 | 188 | 1 | biome, atmos | yes | yes |
| [`biomes/outlands`](biomes/outlands/PORT.md) | 15 | 82 | 7 | 0 | 1 | 37 | 37 | 3 | biome, atmos |  | yes |
| [`biomes/rift`](biomes/rift/PORT.md) | 19 | 241 | 12 | 21 | 2 | 13 | 192 | 5 | biome, atmos | yes | yes |
| [`biomes/riftrim`](biomes/riftrim/PORT.md) | 16 | 151 | 20 | 0 | 2 | 55 | 74 | 1 | biome, atmos | yes | yes |
| [`biomes/ringisles`](biomes/ringisles/PORT.md) | 23 | 203 | 71 | 18 | 2 | 47 | 65 | 2 | biome, atmos | yes | yes |
| [`biomes/scablands`](biomes/scablands/PORT.md) | 6 | 57 | 28 | 0 | 0 | 16 | 13 | 0 |  |  | yes |
| [`biomes/sedesert`](biomes/sedesert/PORT.md) | 17 | 246 | 9 | 0 | 2 | 76 | 159 | 6 | biome, atmos | yes | yes |
| [`biomes/shighlands`](biomes/shighlands/PORT.md) | 14 | 171 | 15 | 0 | 2 | 47 | 107 | 1 | biome, atmos | yes | yes |
| [`biomes/swbay`](biomes/swbay/PORT.md) | 18 | 223 | 5 | 0 | 5 | 45 | 169 | 6 | biome, atmos | yes | yes |
| [`biomes/swhighlands`](biomes/swhighlands/PORT.md) | 20 | 206 | 0 | 0 | 1 | 67 | 137 | 8 | biome, atmos | yes | yes |
| [`biomes/swlowlands`](biomes/swlowlands/PORT.md) | 18 | 247 | 5 | 3 | 2 | 55 | 183 | 5 | biome, atmos | yes | yes |
| [`biomes/throne`](biomes/throne/PORT.md) | 22 | 328 | 57 | 22 | 3 | 52 | 193 | 2 | biome, atmos | yes | yes |
| [`biomes/twins`](biomes/twins/PORT.md) | 18 | 98 | 8 | 0 | 6 | 36 | 47 | 5 | biome, atmos | yes | yes |
| [`biomes/wouterwall`](biomes/wouterwall/PORT.md) | 16 | 119 | 33 | 0 | 0 | 35 | 51 | 3 | biome, atmos | yes | yes |
| [`biomes/xanadu`](biomes/xanadu/PORT.md) | 22 | 261 | 27 | 0 | 2 | 28 | 204 | 5 | biome, atmos | yes | yes |
| [`openworld/isle-demo`](openworld/isle-demo/PORT.md) | 18 | 200 | 91 | 10 | 0 | 93 | 7 | 1 |  |  | yes |
| [`openworld/iziz-cluster`](openworld/iziz-cluster/PORT.md) | 4 | 10 | 10 | 0 | 0 | 0 | 0 | 0 |  |  | yes |
| [`openworld/pinnacle`](openworld/pinnacle/PORT.md) | 4 | 7 | 7 | 0 | 0 | 0 | 0 | 0 |  |  | yes |
| [`openworld/xanadu-oidong-highrift`](openworld/xanadu-oidong-highrift/PORT.md) | 5 | 11 | 11 | 0 | 0 | 0 | 0 | 0 |  |  | yes |
| [`core/charactermodels`](core/charactermodels/PORT.md) | 7 | 418 | 24 | 0 | 0 | 172 | 222 | 0 |  |  | yes |
| **all** | 3204 | 39522 | 9726 (25%) | 1034 (3%) | 900 (2%) | 6399 (16%) | 21463 (54%) | 366 | | | |

## Host-shell copies

The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. "versions" is the number of byte-distinct copies: the drift to reconcile.

| Family | Builds | Versions | KB total |
|---|---|---|---|
| `host-sky` | 56 | 54 | 141 |
| `host-stage` | 52 | 52 | 834 |
| `host-build` | 44 | 44 | 193 |
| `camera` | 19 | 15 | 137 |
| `start` | 18 | 18 | 75 |
| `probe` | 17 | 15 | 78 |
| `stats` | 10 | 1 | 12 |
| `sky` | 9 | 5 | 312 |
| `host-tower` | 9 | 9 | 49 |
| `pathviz` | 6 | 5 | 39 |
| `daynight` | 5 | 4 | 72 |
| `inspect` | 5 | 5 | 30 |
| `hover` | 5 | 5 | 18 |
| `polygon` | 4 | 4 | 19 |
| `walk` | 2 | 2 | 32 |
| `sheetui` | 2 | 1 | 8 |
| `host-camera` | 1 | 1 | 12 |
| `host-polytool` | 1 | 1 | 6 |
| `host-probe` | 1 | 1 | 7 |
| `underview` | 1 | 1 | 3 |
| `polytool` | 1 | 1 | 3 |
