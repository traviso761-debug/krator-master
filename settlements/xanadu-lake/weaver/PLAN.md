# Wībhar (Weaver): a lake town of 2,500 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Wībhar's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.weaver` |
| Name | Wībhar (Weaver) |
| px | 852,1519 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -678,000 m, z -100,000 m |
| People | 2,500 (about 455 households of 5.5) |
| Province | P1 (Lēk-Shor, the Lake Shore), hub Erehwon (`s57bkv9741`), 22 km by water (straight line) |
| Diet | `lake`: 312 t of grain a year, 112 t of fish, 20 t of fruit |
| Fishing | none: `lk.weaver.store`, the landing (crew 10). It buys its fish |
| Its make | `lk.weaver.looms`: 300 weavers, `T.chain.weave` (1.2 kg of silk to 1 kg of brocade, 110 hours a piece); the silk comes from the hub |
| Terraces | `lk.weaver.terraces`: crew 160 in the harvest, 188 t of grain (three fifths of what it eats); about 141 ha of terrace at 1.6 t/ha |
| From the hub | 125 t of grain a year by the round |
| The round | `round.south-east` (Erehwon's south-east round): call 2 of 7, after Boṭ-Yārḍ, before Saphran |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -440 m, 10.9 % slope over its 2 km cell; the lake (-520 m) on the N; relief 1,141 m within 7 km; the highest ground within 7 km at 329 m (769 m above the town) |
| The shore | *proposed* coast class `shelf` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model. |
| The region | `xanadu-lake-shore`, site `sxanlkweaver01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 23 ha of town (110 people a ha in the lanes), a footprint radius of about 250 m round the landing, the terraces above it out to the band |

## 3. The town

The weavers' town. Wībhar's 300 looms (`lk.weaver.looms`, the tune's `T.chain.weave`: 1.2 kg of silk to 1 kg of brocade, 110 hours a piece) weave the Sultanate's brocade from the north shore's silk, which comes round by Erehwon. It has no dugouts (`lk.weaver.store`).

*Proposed* look: the busiest of the small towns, all clatter. Loom houses (long, high-windowed, 30 looms each) in rows up the slope, the dye works by the water where the vats drain into the lake and stain the shallows, the silk store and the brocade house by the landing. San Juan La Laguna's weavers' and dyers' co-operatives on Atitlán are the pattern. The dyers here dye the silk; Ḍāiyar on the north shore dyes for the lake's cotton and wool.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `landing` | harbour | 10 % | shore | the landing, the silk store, the brocade house |
| `dyes` | industry | 10 % | shore | the dye works by the water, the drying lines |
| `looms` | industry | 25 % | slope | the loom houses in rows on the slope |
| `town` | residential | 45 % | slope | the weavers' houses |
| `temple` | civic | 10 % | bench | the temple on the first bench |

**The houses** (*proposed*): about 455, one a household: 50 % poor, 38 % middling, 12 % rich (about 227, 173 and 55), 25 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the loom houses: `xa_loom_house` (slope)
- the dye works: `xa_dye_works` (shore)
- the brocade house (the guild's): `xa_warehouse with xa_shops` (shore)
- the temple of the Decree: `xa_temple` (bench)

**The boats** (*proposed*, `90s`): no dugouts, 1 launch, 2 barges at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| loom houses (300 looms) | `xa_loom_house` | 10 |
| dye works | `xa_dye_works` | 2 |
| silk and brocade stores | `xa_warehouse` | 2 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 4 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 455 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`.

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Wībhar adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('weaver', x, z)` fitted to the region's ground at 852,1519; shore bearing N; the wall's rise about 769 m in 7 km |
| (nothing else) | | |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59); `ground.dyeworks` (section 58, owed); `cloth.weave.plain` (the drying lines).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlkweaver01`, "Wībhar", type `town`, 852,1519, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

None beyond the shared target's.

## 9. Steps

Built in step **L3** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py weaver`), the plan and its verify (`verify.py --assert ?town=weaver` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py weaver --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
