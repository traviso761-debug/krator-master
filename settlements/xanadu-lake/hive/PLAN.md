# Hāibh (Hive): a lake town of 1,200 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Hāibh's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.hive` |
| Name | Hāibh (Hive) |
| px | 817,1490 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -748,000 m, z -158,000 m |
| People | 1,200 (about 218 households of 5.5) |
| Province | P7 (Nōrth-Shor, the North Shore), hub Phēr (`xan.pher`), 52 km by water (straight line) |
| Diet | `lake`: 150 t of grain a year, 54 t of fish, 10 t of fruit |
| Fishing | `lk.hive.fishing`, the dugouts: crew 200, 187 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 54 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | `lk.hive.honey`: 24 t of honey a year, crew 200; the road to the hub carries 85 % of the stock (`share`) |
| Terraces | `lk.hive.terraces`: crew 160 in the harvest, 90 t of grain (three fifths of what it eats); about 72 ha of terrace at 1.5 t/ha |
| From the hub | 60 t of grain a year by the round |
| The round | `round.north-west` (Phēr's north-west round): call 4 of 4, after Malbari, before Phēr |
| The fair | `T.loops`: the fair's west loop calls here two days a week |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -500 m, 8.3 % slope over its 2 km cell; the lake (-520 m) on the S; relief 813 m within 7 km; the highest ground within 7 km at -5 m (495 m above the town) |
| The shore | *proposed* coast class `shingle` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km; the Bhon Ḍrāi (`r492`, a wadi) ends 8 km south-west at 813,1491. |
| The region | `xanadu-north-shore` holds the ground (its box is px 808-884 by 1446-1514) but **no site yet**: step L2 adds it |
| Footprint | *proposed* about 11 ha of town (110 people a ha in the lanes), a footprint radius of about 200 m round the landing, the terraces above it out to the band |

## 3. The town

The honey town at the lake's north-west end. Hāibh makes 24 t of honey a year (`lk.hive.honey`) and the wax with it, from hives along the rim plain's flowering scrub and the north shore's orchards. It is the last call of Phēr's north-west round, 52 km west of Phēr.

*Proposed* look: a low, sunny town on a gentle shore (8 %), the apiaries in walled rows up the slope behind it (the hive walls of the kit's apiary), the honey houses by the landing, and the wax chandlers' shops. Bees' shrines: the Decree's wayside shrines here carry wax offerings.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `landing` | harbour | 10 % | shore | the landing, the honey houses |
| `town` | residential | 50 % | slope | the beekeepers' houses |
| `hives` | farm | 20 % | bench | the hive walls up the slope |
| `market` | market | 10 % | shore | the market, the chandlers, the temple |
| `fishers` | residential | 10 % | shore | the fishers' row |

**The houses** (*proposed*): about 218, one a household: 55 % poor, 35 % middling, 10 % rich (about 120, 76 and 22), 30 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the hive walls: `xa_apiary` (bench)
- the temple of the Decree: `xa_temple` (shore)

**The boats** (*proposed*, `90s`): 40 dugouts (two to a dugout, the fishing crew's half afloat at a time), 2 launches, 1 barge at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| apiaries | `xa_apiary` | 12 |
| honey houses (a workshop each) | `xa_workshop` | 3 |
| fish racks | `xa_fish_racks` | 5 |
| boat sheds | `xa_boatshed` | 3 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 2 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 218 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`.

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Hāibh adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('hive', x, z)` fitted to the region's ground at 817,1490; shore bearing S; the wall's rise about 495 m in 7 km |
| The region's site | `openworld/SITES.json` | A new site (`sxanlkhive01`, *proposed*), `model: false` at 817,1490, 6 km reach, in `xanadu-north-shore`, with a corridor along the shore to Malbari (step L2) |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlkhive01`, "Hāibh", type `town`, 817,1490, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

None beyond the shared target's.

## 9. Steps

Built in step **L2** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py hive`), the plan and its verify (`verify.py --assert ?town=hive` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py hive --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
