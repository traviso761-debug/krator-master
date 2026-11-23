# Qorī (Quarry): a lake town of 1,500 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Qorī's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.quarry` |
| Name | Qorī (Quarry) |
| px | 832,1516 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -718,000 m, z -106,000 m |
| People | 1,500 (about 273 households of 5.5) |
| Province | P1 (Lēk-Shor, the Lake Shore), hub Erehwon (`s57bkv9741`), 18 km by water (straight line) |
| Diet | `lake`: 188 t of grain a year, 68 t of fish, 12 t of fruit |
| Fishing | none: `lk.quarry.store`, the landing (crew 10). It buys its fish |
| Its make | none counted (stone has no good) |
| Terraces | `lk.quarry.terraces`: crew 160 in the harvest, 112 t of grain (three fifths of what it eats); about 84 ha of terrace at 1.6 t/ha |
| From the hub | 75 t of grain a year by the round |
| The round | `round.west` (Erehwon's west round): call 2 of 6, after Gārḍan, before Ōrcharḍ |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -440 m, 11.7 % slope over its 2 km cell; the lake (-520 m) on the N; relief 1,251 m within 7 km; the highest ground within 7 km at 328 m (768 m above the town) |
| The shore | *proposed* coast class `shelf` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model. |
| The region | `xanadu-lake-shore`, site `sxanlkquarry01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 14 ha of town (110 people a ha in the lanes), a footprint radius of about 200 m round the landing, the terraces above it out to the band |

## 3. The town

The quarrymen's town, 18 km west of Erehwon. Qorī cuts the stone Erehwon is built of from the caldera wall behind it, which rises 770 m in 7 km, the steepest of the shore. It has no dugouts (`lk.quarry.store`); the tune gives its stone no number (the build-out's question for a stone good is open), so the page shows the trade and the sim does not count it.

*Proposed* look: a white town at the foot of a cut face. The quarry face (a bench cut into the wall with drill marks and spoil below), the masons' yards along the shore where the blocks are dressed, the stone barges' slip, and a town of good ashlar for its size: its people build in the stone they cut.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `face` | industry | 15 % | bench | the quarry face and its benches, the spoil fan |
| `yards` | industry | 20 % | shore | the masons' yards and the stone slip |
| `town` | residential | 45 % | slope | the quarrymen's houses |
| `market` | market | 10 % | shore | the market and the temple |
| `upper` | residential | 10 % | bench | the master masons' houses |

**The houses** (*proposed*): about 273, one a household: 55 % poor, 35 % middling, 10 % rich (about 150, 95 and 27), 15 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the quarry face: `core/terrain carve with xa_quarry_yard at its foot` (bench)
- the stone slip: `xa_slip` (shore)
- the temple of the Decree (ashlar): `xa_temple` (shore)

**The boats** (*proposed*, `90s`): no dugouts, 1 launch, 4 barges at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| quarry and masons' yards | `xa_quarry_yard` | 4 |
| stone slips | `xa_slip` | 2 |
| smithies (the picks) | `xa_smithy` | 2 |
| workshops | `xa_workshop` | 3 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 2 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 273 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`.

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Qorī adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('quarry', x, z)` fitted to the region's ground at 832,1516; shore bearing N; the wall's rise about 768 m in 7 km |
| The quarry face | `core/terrain` (`36-core-carve.js`) | The cut benches in the wall as a carve patch through `CORE_TERRAIN`; the region's ground takes it at the bake |
| The spoil | `core/ruins` (`KRUBBLE`) | The spoil fan as rubble heaps |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59); `rock.hewn.drillmarked` (the face); `stone.cut` (the blocks).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlkquarry01`, "Qorī", type `town`, 832,1516, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

1. Stone has no good in the tune. *Default:* none added (the page shows the trade only); a `stone` good waits for the owner.

## 9. Steps

Built in step **L4** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py quarry`), the plan and its verify (`verify.py --assert ?town=quarry` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py quarry --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
