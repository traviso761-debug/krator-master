# Krator: the heaviest pages by triangles and draw calls (2026-11-10)

For a second-opinion optimisation plan. Numbers from the second integration pass (`claude/integration-2`, after the all-builds rebuild):

- **GPU verify** rows: `verify.py --assert` (`--all-views` on biomes and stations) on the RTX 5060 or the Arc 140T lane, 1280x800.
  "max" is the worst view the verify shot (draw calls and triangles drawn at that camera, after frustum culling and LOD).
- **GEOMETRY.md** rows: `tools/geometry_report.py` at the page's opening view in SwiftShader on 2026-11-03, for pages whose
  verify prints no per-view numbers (most building-kit sheets, Voth, Dhelv, Noah's Regret). Older code; rerun for current numbers.
- Scene triangles: everything in the scene (the verify's `showcase-triangle-budget`, or GEOMETRY.md's census). Instances: instanced copies.
- The page-level soft budgets the verifies check: biomes 700 draw calls, 17 M triangles drawn, 27 M scene triangles; cities 900 draw calls;
  the instance cap 250k per item unless the kit declares `{cap, capWhy}`. Pages over 16 MB are split into side files.
- Not measured here: the Ancient's Valley and its stations (another branch), Firebliss (taken back out), Longsong (not rebuilt).
- The architecture in one line: one self-contained three.js r128 page per build, built from `src/` fragments; flora through `core/biome`
  (`BIO.def`/`BIO.put` instanced items, `BIO.LOD` chunk merges at 1200 m, far impostors), terrain on `core/terrain`, buildings merged by
  material key (`core/engine`), furniture through the catalog batch (`core/furnish`). Read `README.md`, "CORE MODULES ARE NOT OPTIONAL".

## Biomes: by triangles drawn (top 25 pages)

| page | max draw calls | max triangles drawn (M) | scene triangles (M) | instances | source |
|---|---|---|---|---|---|
| `biomes/ringisles/dist/ringisles-high.html` | 811 | 27.00 | 26.0 | 1,769,436 | GPU verify, RTX, worst of 15 views |
| `biomes/ringisles/dist/ringisles.html` | 784 | 26.87 | 23.7 | 1,449,624 | GPU verify, RTX, worst of 21 views |
| `biomes/throne/dist/throne-cloud.html` | 74 | 24.97 | 23.8 | 1,649,626 | GPU verify, RTX, worst of 16 views |
| `biomes/crater-drylands/dist/crater-drylands-edge.html` | 64 | 22.23 | 19.5 | 1,721,875 | GPU verify, RTX, worst of 32 views |
| `biomes/throne/dist/throne-vents.html` | 216 | 21.32 | 19.6 | 362,507 | GPU verify, RTX, worst of 23 views |
| `biomes/throne/dist/throne.html` | 211 | 20.56 | 19.9 | 554,390 | GPU verify, RTX, worst of 27 views |
| `biomes/farside/dist/farside.html` | 133 | 19.93 | 21.4 | 486,749 | GPU verify, RTX, worst of 25 views |
| `biomes/swhighlands/dist/swhighlands-span.html` | 76 | 19.71 | 29.0 | 237,379 | GPU verify, Arc, worst of 17 views |
| `biomes/shighlands/dist/shighlands.html` | 159 | 19.26 | 18.7 | 445,102 | GPU verify, RTX, worst of 24 views |
| `biomes/crater-drylands/dist/crater-drylands-n.html` | 51 | 18.84 | 18.3 | 1,265,667 | GPU verify, Arc, worst of 27 views |
| `biomes/crater-drylands/dist/crater-drylands.html` | 51 | 18.84 | 18.3 | 1,265,667 | GPU verify, RTX, worst of 27 views |
| `biomes/rift/dist/rift.html` | 361 | 17.98 | 34.7 | 2,132,150 | GPU verify, RTX, worst of 15 views |
| `biomes/throne/dist/throne-savanna.html` | 81 | 17.90 | 16.6 | 791,144 | GPU verify, RTX, worst of 15 views |
| `biomes/throne/dist/throne-ash.html` | 144 | 17.86 | 16.7 | 296,548 | GPU verify, Arc, worst of 18 views |
| `biomes/riftrim/dist/riftrim-lakes.html` | 105 | 17.64 | 15.9 | 150,535 | GPU verify, RTX, worst of 12 views |
| `biomes/swhighlands/dist/swhighlands-rainwall.html` | 71 | 17.62 | 25.9 | 450,076 | GPU verify, Arc, worst of 16 views |
| `biomes/sedesert/dist/sedesert-mantis.html` | 126 | 17.22 | 17.0 | 1,285,805 | GPU verify, RTX, worst of 15 views |
| `biomes/ringisles/dist/ringisles-lagoon.html` | 256 | 17.04 | 14.7 | 417,064 | GPU verify, Arc, worst of 14 views |
| `biomes/shighlands/dist/shighlands-conifers.html` | 27 | 16.99 | 16.4 | 654,058 | GPU verify, Arc, worst of 14 views |
| `biomes/swhighlands/dist/swhighlands-pillars-span.html` | 240 | 16.83 | 16.2 | 159,044 | GPU verify, RTX, worst of 20 views |
| `biomes/nsemiarid/dist/nsemiarid.html` | 427 | 16.80 | 15.5 | 437,587 | GPU verify, RTX, worst of 21 views |
| `biomes/swhighlands/dist/swhighlands-pillars.html` | 41 | 16.78 | 16.2 | 159,044 | GPU verify, RTX, worst of 18 views |
| `biomes/xanadu/dist/xanadu-descent.html` | 290 | 16.06 | 31.4 | 1,708,204 | GPU verify, Arc, worst of 13 views |
| `biomes/ehighlands/dist/ehighlands.html` | 37 | 15.81 | 15.2 | 641,989 | GPU verify, RTX, worst of 17 views |
| `biomes/xanadu/dist/xanadu.html` | 344 | 15.65 | 29.2 | 1,647,217 | GPU verify, Arc, worst of 34 views |

## Biomes: by draw calls (top 15 pages)

| page | max draw calls | max triangles drawn (M) | scene triangles (M) | instances | source |
|---|---|---|---|---|---|
| `biomes/dambasins/dist/port.html` | 894 | 0.88 | 0.9 | 13,905 | GPU verify, RTX, worst of 14 views |
| `biomes/nwbay/dist/nwbay-caverns.html` | 880 | 13.21 | 10.2 | 731,907 | GPU verify, Arc, worst of 54 views |
| `biomes/ringisles/dist/ringisles-high.html` | 811 | 27.00 | 26.0 | 1,769,436 | GPU verify, RTX, worst of 15 views |
| `biomes/ringisles/dist/ringisles.html` | 784 | 26.87 | 23.7 | 1,449,624 | GPU verify, RTX, worst of 21 views |
| `biomes/ancientsvalley/dist/ancientsvalley.html` | 662 | 5.12 | 7.6 | 900 | GPU verify, RTX, worst of 11 views |
| `biomes/godthrone/dist/godthrone-tube.html` | 635 | 2.40 | 3.0 | 150,406 | GPU verify, RTX, worst of 12 views |
| `biomes/hyperjungle/dist/hyperjungle-savage.html` | 482 | 4.09 | 5.9 | 379,532 | GPU verify, RTX, worst of 10 views |
| `biomes/dambasins/dist/graveyard.html` | 472 | 6.06 | 0.6 | 20,920 | GPU verify, RTX, worst of 12 views |
| `biomes/hyperjungle/dist/hyperjungle-north.html` | 462 | 5.91 | 7.4 | 314,360 | GPU verify, RTX, worst of 9 views |
| `biomes/nsemiarid/dist/nsemiarid.html` | 427 | 16.80 | 15.5 | 437,587 | GPU verify, RTX, worst of 21 views |
| `biomes/swbay/dist/swbay.html` | 388 | 7.98 | 10.2 | 559,190 | GPU verify, RTX, worst of 30 views |
| `biomes/rift/dist/rift.html` | 361 | 17.98 | 34.7 | 2,132,150 | GPU verify, RTX, worst of 15 views |
| `biomes/rift/dist/rift-jungle.html` | 360 | 10.36 | 35.7 | 1,977,886 | GPU verify, RTX, worst of 11 views |
| `biomes/farside/dist/farside-front.html` | 357 | 9.53 | 11.5 | 433,144 | GPU verify, Arc, worst of 15 views |
| `biomes/xanadu/dist/xanadu.html` | 344 | 15.65 | 29.2 | 1,647,217 | GPU verify, Arc, worst of 34 views |

## Biomes: by scene triangles (top 15 pages)

| page | max draw calls | max triangles drawn (M) | scene triangles (M) | instances | source |
|---|---|---|---|---|---|
| `biomes/xanadu/dist/xanadu-cloud.html` | 296 | 11.77 | 40.8 | 2,202,674 | GPU verify, RTX, worst of 13 views |
| `biomes/rift/dist/rift-jungle.html` | 360 | 10.36 | 35.7 | 1,977,886 | GPU verify, RTX, worst of 11 views |
| `biomes/rift/dist/rift.html` | 361 | 17.98 | 34.7 | 2,132,150 | GPU verify, RTX, worst of 15 views |
| `biomes/rift/dist/rift-highland.html` | 234 | 12.37 | 32.1 | 2,343,409 | GPU verify, RTX, worst of 9 views |
| `biomes/xanadu/dist/xanadu-descent.html` | 290 | 16.06 | 31.4 | 1,708,204 | GPU verify, Arc, worst of 13 views |
| `biomes/rift/dist/rift-plateau.html` | 309 | 8.01 | 31.2 | 1,796,800 | GPU verify, RTX, worst of 9 views |
| `biomes/nhighlands/dist/nhighlands.html` | 237 | 14.14 | 30.8 | 2,753,431 | GPU verify, RTX, worst of 34 views |
| `biomes/xanadu/dist/xanadu.html` | 344 | 15.65 | 29.2 | 1,647,217 | GPU verify, Arc, worst of 34 views |
| `biomes/swhighlands/dist/swhighlands-span.html` | 76 | 19.71 | 29.0 | 237,379 | GPU verify, Arc, worst of 17 views |
| `biomes/ringisles/dist/ringisles-high.html` | 811 | 27.00 | 26.0 | 1,769,436 | GPU verify, RTX, worst of 15 views |
| `biomes/swhighlands/dist/swhighlands-rainwall.html` | 71 | 17.62 | 25.9 | 450,076 | GPU verify, Arc, worst of 16 views |
| `biomes/throne/dist/throne-cloud.html` | 74 | 24.97 | 23.8 | 1,649,626 | GPU verify, RTX, worst of 16 views |
| `biomes/ringisles/dist/ringisles.html` | 784 | 26.87 | 23.7 | 1,449,624 | GPU verify, RTX, worst of 21 views |
| `biomes/rift/dist/rift-savannah.html` | 237 | 6.94 | 22.3 | 1,302,241 | GPU verify, RTX, worst of 10 views |
| `biomes/farside/dist/farside.html` | 133 | 19.93 | 21.4 | 486,749 | GPU verify, RTX, worst of 25 views |

## Biome kits: the heaviest page of each kit, by triangles drawn

| page | max draw calls | max triangles drawn (M) | scene triangles (M) | instances | source |
|---|---|---|---|---|---|
| `biomes/ringisles/dist/ringisles-high.html` | 811 | 27.00 | 26.0 | 1,769,436 | GPU verify, RTX, worst of 15 views |
| `biomes/throne/dist/throne-cloud.html` | 74 | 24.97 | 23.8 | 1,649,626 | GPU verify, RTX, worst of 16 views |
| `biomes/crater-drylands/dist/crater-drylands-edge.html` | 64 | 22.23 | 19.5 | 1,721,875 | GPU verify, RTX, worst of 32 views |
| `biomes/farside/dist/farside.html` | 133 | 19.93 | 21.4 | 486,749 | GPU verify, RTX, worst of 25 views |
| `biomes/swhighlands/dist/swhighlands-span.html` | 76 | 19.71 | 29.0 | 237,379 | GPU verify, Arc, worst of 17 views |
| `biomes/shighlands/dist/shighlands.html` | 159 | 19.26 | 18.7 | 445,102 | GPU verify, RTX, worst of 24 views |
| `biomes/rift/dist/rift.html` | 361 | 17.98 | 34.7 | 2,132,150 | GPU verify, RTX, worst of 15 views |
| `biomes/riftrim/dist/riftrim-lakes.html` | 105 | 17.64 | 15.9 | 150,535 | GPU verify, RTX, worst of 12 views |
| `biomes/sedesert/dist/sedesert-mantis.html` | 126 | 17.22 | 17.0 | 1,285,805 | GPU verify, RTX, worst of 15 views |
| `biomes/nsemiarid/dist/nsemiarid.html` | 427 | 16.80 | 15.5 | 437,587 | GPU verify, RTX, worst of 21 views |
| `biomes/xanadu/dist/xanadu-descent.html` | 290 | 16.06 | 31.4 | 1,708,204 | GPU verify, Arc, worst of 13 views |
| `biomes/ehighlands/dist/ehighlands.html` | 37 | 15.81 | 15.2 | 641,989 | GPU verify, RTX, worst of 17 views |
| `biomes/scablands/dist/highline.html` | 300 | 15.21 | 14.1 | 371,128 | GPU verify, RTX, worst of 15 views |
| `biomes/copperglacier/dist/copperglacier-pass.html` | 23 | 15.11 | 14.5 | 187,979 | GPU verify, RTX, worst of 13 views |
| `biomes/firebliss/dist/firebliss-glen.html` | 83 | 14.67 | 14.2 | 1,591,062 | GPU verify, GPU, worst of 13 views |
| `biomes/nhighlands/dist/nhighlands.html` | 237 | 14.14 | 30.8 | 2,753,431 | GPU verify, RTX, worst of 34 views |
| `biomes/abyssal-savannah/dist/abyssal-savannah-belt.html` | 51 | 13.74 | 9.6 | 1,134,341 | GPU verify, RTX, worst of 14 views |
| `biomes/nwbay/dist/nwbay-caverns.html` | 880 | 13.21 | 10.2 | 731,907 | GPU verify, Arc, worst of 54 views |
| `biomes/oidong/dist/oidong.html` | 100 | 12.11 | 11.5 | 545,650 | GPU verify, RTX, worst of 27 views |
| `biomes/nwouterwall/dist/nwouterwall.html` | 36 | 12.04 | 11.4 | 1,607,254 | GPU verify, RTX, worst of 11 views |
| `biomes/highrift/dist/highrift-coulee.html` | 32 | 11.04 | 8.7 | 310,281 | GPU verify, Arc, worst of 7 views |
| `biomes/greenstep/dist/greenstep-cloudstep.html` | 88 | 10.66 | 15.2 | 517,730 | GPU verify, Arc, worst of 10 views |
| `biomes/guilin/dist/guilin.html` | 42 | 10.60 | 8.7 | 826,065 | GPU verify, RTX, worst of 15 views |
| `biomes/korona/dist/korona-hoar.html` | 41 | 10.21 | 9.1 | 156,615 | GPU verify, RTX, worst of 11 views |
| `biomes/k-guilin/dist/k-guilin.html` | 162 | 9.72 | 6.9 | 632,432 | GPU verify, Arc, worst of 18 views |
| `biomes/outlands/dist/outlands.html` | 25 | 9.06 | 13.9 | 366,525 | GPU verify, RTX, worst of 16 views |
| `biomes/swbay/dist/swbay.html` | 388 | 7.98 | 10.2 | 559,190 | GPU verify, RTX, worst of 30 views |
| `biomes/ebadlands/dist/ebadlands-montane.html` | 239 | 7.72 | 3.6 | 253,172 | GPU verify, RTX, worst of 12 views |
| `biomes/nwlowlands/dist/nwlowlands.html` | 280 | 7.69 | 10.5 | 690,205 | GPU verify, RTX, worst of 22 views |
| `biomes/eastabyss/dist/eastabyss.html` | 236 | 7.44 | 10.5 | 878,554 | GPU verify, RTX, worst of 27 views |
| `biomes/wouterwall/dist/wouterwall.html` | 35 | 7.37 | 5.9 | 860,116 | GPU verify, RTX, worst of 11 views |
| `biomes/swlowlands/dist/swlowlands.html` | 270 | 6.84 | 11.2 | 846,246 | GPU verify, RTX, worst of 33 views |
| `biomes/godstep/dist/godstep-redlands.html` | 39 | 6.23 | 7.7 | 266,473 | GPU verify, RTX, worst of 14 views |
| `biomes/geyser/dist/geyser-basin.html` | 59 | 6.16 | 3.2 | 326,904 | GPU verify, Arc, worst of 14 views |
| `biomes/dambasins/dist/graveyard.html` | 472 | 6.06 | 0.6 | 20,920 | GPU verify, RTX, worst of 12 views |
| `biomes/hyperjungle/dist/hyperjungle-north.html` | 462 | 5.91 | 7.4 | 314,360 | GPU verify, RTX, worst of 9 views |
| `biomes/godshearth/dist/godshearth.html` | 65 | 5.51 | 5.1 | 178,391 | GPU verify, RTX, worst of 17 views |
| `biomes/cut/dist/cut-face.html` | 166 | 5.38 | 5.2 | 374,228 | GPU verify, RTX, worst of 10 views |
| `biomes/ancientsvalley/dist/ancientsvalley.html` | 662 | 5.12 | 7.6 | 900 | GPU verify, RTX, worst of 11 views |
| `biomes/godthrone/dist/godthrone-gills-ladder.html` | 84 | 4.00 | 7.8 | 216,073 | GPU verify, RTX, worst of 10 views |

## Settlements and the open world: every page, by triangles drawn

| page | max draw calls | max triangles drawn (M) | scene triangles (M) | instances | source |
|---|---|---|---|---|---|
| `settlements/xanadu/dist/erewhon.html` | 1,528 | 35.14 | 21.8 | 1,021,644 | GPU verify, RTX, opening view |
| `settlements/voth/dist/voth-city.html` | 1,047 | 34.88 | 41.0 | 657,000 | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `settlements/ys/dist/ys.html` | 199 | 29.77 | 28.7 | 127,462 | GPU verify, RTX, opening view |
| `settlements/verge/dist/verge.html` | 620 | 12.49 |  | 153,749 | GPU verify, RTX, opening view |
| `settlements/highlands/dist/roketstad.html` | 537 | 12.42 | 20.6 | 911,848 | GPU verify, RTX, opening view |
| `settlements/locus/locus.html` | 184 | 8.80 |  |  | GPU verify, Arc, opening view |
| `settlements/longsong/dist/longsong.html` | 520 | 8.68 | 6.1 | 237,471 | GPU verify, RTX, opening view |
| `settlements/dalab/dist/dalab.html` | 579 | 7.88 | 10.5 | 102,105 | GPU verify, Arc, opening view |
| `settlements/mungo/dist/mungo.html` | 439 | 7.62 |  | 36,536 | GPU verify, Arc, opening view |
| `settlements/yuni/yuni.html` | 155 | 6.05 |  |  | GPU verify, RTX, opening view |
| `settlements/iziz/dist/iziz.html` | 923 | 5.86 | 7.9 | 206,924 | GPU verify, RTX, opening view |
| `settlements/ys/dist/kit.html` | 106 | 4.26 | 4.0 | 16,097 | GPU verify, RTX, opening view |
| `settlements/pinnacle-rock/dist/pinnacle-rock.html` | 1,857 | 4.08 | 1.1 | 68,818 | GPU verify, Arc, opening view |
| `settlements/mavs-refuge/mavs-refuge.html` | 104 | 4.05 |  |  | GPU verify, RTX, opening view |
| `settlements/girder/girder-hero.html` | 176 | 3.91 |  |  | GPU verify, Arc, opening view |
| `settlements/girder/girder.html` | 174 | 3.89 |  |  | GPU verify, RTX, opening view |
| `settlements/shade/dist/shade.html` | 59 | 3.51 | 3.0 | 111,639 | GPU verify, RTX, opening view |
| `settlements/iziz/dist/iziz-ixtest.html` | 585 | 3.51 | 4.3 | 146,694 | GPU verify, Arc, opening view |
| `settlements/screamers/dist/screamers.html` | 137 | 3.05 | 3.2 | 133,959 | GPU verify, RTX, opening view |
| `settlements/iziz/dist/iziz-palace.html` | 195 | 3.03 | 0.3 | 20,869 | GPU verify, RTX, opening view |
| `settlements/noahs-regret/dist/noahs-regret.html` | 53 | 1.51 | 1.4 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `settlements/highlands/dist/highlands.html` | 176 | 1.34 | 2.7 | 143,718 | GPU verify, Arc, opening view |
| `settlements/iziz/dist/iziz-vernacular.html` | 98 | 1.23 | 0.7 | 27,218 | GPU verify, RTX, opening view |
| `settlements/jimjam/dist/jimjam-kit.html` | 487 | 1.21 | 1.8 | 40,514 | GPU verify, RTX, opening view |
| `settlements/hook/dist/hook.html` | 432 | 1.07 | 3.1 | 42,550 | GPU verify, Arc, opening view |
| `settlements/yuni/yuni-assets.html` | 118 | 0.98 |  |  | GPU verify, RTX, opening view |
| `settlements/xanadu/dist/xanadu.html` | 88 | 0.86 | 5.8 | 254,320 | GPU verify, Arc, opening view |
| `settlements/voth/dist/voth-site.html` | 132 | 0.60 | 1.1 | 8,308 | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `settlements/locus/abyss-kit.html` | 114 | 0.60 |  |  | GPU verify, Arc, opening view |
| `settlements/ys/dist/mock.html` | 58 | 0.56 | 0.4 | 2,328 | GPU verify, RTX, opening view |
| `settlements/dhelv/dist/dhelv.html` | 234 | 0.55 | 4.6 | 123,000 | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `settlements/reedlake/dist/reedlake.html` | 102 | 0.48 | 0.6 | 14,724 | GPU verify, RTX, opening view |
| `settlements/locus/locus-kit.html` | 98 | 0.28 |  |  | GPU verify, RTX, opening view |
| `settlements/dalab/dist/dalab-set.html` | 70 | 0.26 | 0.6 | 16,258 | GPU verify, Arc, opening view |
| `settlements/iziz/dist/w-c.html` | 83 | 0.25 | 0.3 | 8,414 | GPU verify, Arc, opening view |
| `settlements/reedlake/dist/reedlake-village.html` | 150 | 0.24 | 0.2 | 5,984 | GPU verify, RTX, opening view |
| `settlements/locus/locus-plants.html` | 16 | 0.06 |  |  | GPU verify, Arc, opening view |
| `settlements/yuni/yuni-plants.html` | 13 | 0.06 |  |  | GPU verify, RTX, opening view |
| `settlements/iziz/dist/w-a.html` | 73 | 0.06 | 0.1 | 2,500 | GPU verify, RTX, opening view |
| `settlements/iziz/dist/w-b.html` | 50 | 0.05 | 0.1 | 1,670 | GPU verify, RTX, opening view |
| `settlements/screamers/dist/furniture.html` | 17 | 0.01 | 0.0 | 251 | GPU verify, RTX, opening view |

## Settlements: by draw calls

| page | max draw calls | max triangles drawn (M) | scene triangles (M) | instances | source |
|---|---|---|---|---|---|
| `settlements/pinnacle-rock/dist/pinnacle-rock.html` | 1,857 | 4.08 | 1.1 | 68,818 | GPU verify, Arc, opening view |
| `settlements/xanadu/dist/erewhon.html` | 1,528 | 35.14 | 21.8 | 1,021,644 | GPU verify, RTX, opening view |
| `settlements/voth/dist/voth-city.html` | 1,047 | 34.88 | 41.0 | 657,000 | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `settlements/iziz/dist/iziz.html` | 923 | 5.86 | 7.9 | 206,924 | GPU verify, RTX, opening view |
| `settlements/verge/dist/verge.html` | 620 | 12.49 |  | 153,749 | GPU verify, RTX, opening view |
| `settlements/iziz/dist/iziz-ixtest.html` | 585 | 3.51 | 4.3 | 146,694 | GPU verify, Arc, opening view |
| `settlements/dalab/dist/dalab.html` | 579 | 7.88 | 10.5 | 102,105 | GPU verify, Arc, opening view |
| `settlements/highlands/dist/roketstad.html` | 537 | 12.42 | 20.6 | 911,848 | GPU verify, RTX, opening view |
| `settlements/longsong/dist/longsong.html` | 520 | 8.68 | 6.1 | 237,471 | GPU verify, RTX, opening view |
| `settlements/jimjam/dist/jimjam-kit.html` | 487 | 1.21 | 1.8 | 40,514 | GPU verify, RTX, opening view |
| `settlements/mungo/dist/mungo.html` | 439 | 7.62 |  | 36,536 | GPU verify, Arc, opening view |
| `settlements/hook/dist/hook.html` | 432 | 1.07 | 3.1 | 42,550 | GPU verify, Arc, opening view |
| `settlements/dhelv/dist/dhelv.html` | 234 | 0.55 | 4.6 | 123,000 | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `settlements/ys/dist/ys.html` | 199 | 29.77 | 28.7 | 127,462 | GPU verify, RTX, opening view |
| `settlements/iziz/dist/iziz-palace.html` | 195 | 3.03 | 0.3 | 20,869 | GPU verify, RTX, opening view |

## Building kits (sheets): by triangles drawn (top 20)

| page | max draw calls | max triangles drawn (M) | scene triangles (M) | instances | source |
|---|---|---|---|---|---|
| `kits/talia/dist/talia.html` | 84 | 3.25 | 3.0 | 80,728 | GPU verify, RTX, opening view |
| `kits/ancients/dist/ancients-kit.html` | 355 | 2.78 | 14.6 | 422,039 | GPU verify, RTX, opening view |
| `kits/ancients/dist/hexahedron.html` | 80 | 2.41 | 3.0 | 155,429 | GPU verify, RTX, opening view |
| `kits/islanders/dist/islanders.html` | 591 | 2.10 | 2.1 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/zeijani/dist/zeijani.html` | 460 | 1.57 | 1.6 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/ancients/dist/worn.html` | 277 | 1.53 | 4.9 | 181,991 | GPU verify, RTX, opening view |
| `kits/catalog/dist/catalog.html` | 43,032 | 1.30 | 1.6 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/desert-nomads/dist/desert-nomads.html` | 972 | 1.30 | 1.3 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/post-apoc/dist/post-apoc.html` | 30 | 1.26 | 1.3 | 236 | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/interiors/dist/interiors-sets.html` | 47,108 | 1.18 | 9.0 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/pylon/dist/pylon.html` | 76 | 1.14 | 1.0 | 50,910 | GPU verify, RTX, opening view |
| `kits/ancients/dist/iziz-variants.html` | 448 | 1.10 | 2.7 | 70,141 | GPU verify, RTX, opening view |
| `kits/ancients/dist/hill.html` | 263 | 1.05 | 1.9 | 78,969 | GPU verify, RTX, opening view |
| `kits/ancients/dist/alt-towers.html` | 185 | 1.03 | 2.0 | 85,379 | GPU verify, RTX, opening view |
| `kits/ash-nomads/dist/ash-nomads.html` | 590 | 1.01 | 1.0 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/ancients/dist/iziz-style.html` | 836 | 0.98 | 3.9 | 42,099 | GPU verify, RTX, opening view |
| `kits/ancients/dist/launch.html` | 66 | 0.92 | 1.1 | 45,573 | GPU verify, RTX, opening view |
| `kits/ancients/dist/ring.html` | 46 | 0.92 | 1.0 | 47,936 | GPU verify, RTX, opening view |
| `kits/scyvoi/dist/scyvoi.html` | 753 | 0.89 | 0.9 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/ancients/dist/interiors.html` | 300 | 0.85 | 2.7 | 84,839 | GPU verify, RTX, opening view |

## Building kits (sheets): by draw calls (top 15)

| page | max draw calls | max triangles drawn (M) | scene triangles (M) | instances | source |
|---|---|---|---|---|---|
| `kits/interiors/dist/interiors-sets.html` | 47,108 | 1.18 | 9.0 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/catalog/dist/catalog.html` | 43,032 | 1.30 | 1.6 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/ancients-interiors/dist/ancients-interiors.html` | 17,397 | 0.62 | 0.6 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/interiors/dist/interiors-walk.html` | 3,370 | 0.22 | 0.3 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/fauna/dist/fauna.html` | 2,369 | 0.84 | 0.9 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/interiors/dist/interiors.html` | 2,148 | 0.07 | 0.2 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/desert-nomads/dist/desert-nomads.html` | 972 | 1.30 | 1.3 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/ancients/dist/iziz-style.html` | 836 | 0.98 | 3.9 | 42,099 | GPU verify, RTX, opening view |
| `kits/scyvoi/dist/scyvoi.html` | 753 | 0.89 | 0.9 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/islanders/dist/islanders.html` | 591 | 2.10 | 2.1 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/ash-nomads/dist/ash-nomads.html` | 590 | 1.01 | 1.0 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/zeijani/dist/zeijani.html` | 460 | 1.57 | 1.6 |  | GEOMETRY.md, 2026-11-03, opening view, SwiftShader |
| `kits/ancients/dist/iziz-variants.html` | 448 | 1.10 | 2.7 | 70,141 | GPU verify, RTX, opening view |
| `kits/ancients/dist/alt-civic.html` | 355 | 0.41 | 1.0 | 48,564 | GPU verify, RTX, opening view |
| `kits/ancients/dist/ancients-kit.html` | 355 | 2.78 | 14.6 | 422,039 | GPU verify, RTX, opening view |
