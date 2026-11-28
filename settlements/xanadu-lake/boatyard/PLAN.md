# Boṭ-Yārḍ (Boatyard): a lake town of 2,000 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Boṭ-Yārḍ's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.boatyard` |
| Name | Boṭ-Yārḍ (Boatyard) |
| px | 846,1519 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -690,000 m, z -100,000 m |
| People | 2,000 (about 364 households of 5.5) |
| Province | P1 (Lēk-Shor, the Lake Shore), hub Erehwon (`s57bkv9741`), 11 km by water (straight line) |
| Diet | `lake`: 250 t of grain a year, 90 t of fish, 16 t of fruit |
| Fishing | none: `lk.boatyard.store`, the landing (crew 10). It buys its fish |
| Its make | none counted (the hulls are the lake's own gear) |
| Terraces | `lk.boatyard.terraces`: crew 160 in the harvest, 150 t of grain (three fifths of what it eats); about 112 ha of terrace at 1.6 t/ha |
| From the hub | 100 t of grain a year by the round |
| The round | `round.south-east` (Erehwon's south-east round): call 1 of 7, after Erehwon, before Wībhar |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -456 m, 9.9 % slope over its 2 km cell; the lake (-520 m) on the N; relief 1,090 m within 7 km; the highest ground within 7 km at 274 m (730 m above the town) |
| The shore | *proposed* coast class `sand` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model. |
| The region | `xanadu-lake-shore`, site `sxanlkboatyard01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 18 ha of town (110 people a ha in the lanes), a footprint radius of about 250 m round the landing, the terraces above it out to the band |

## 3. The town

The shipwrights' town, 12 km east of Erehwon along the south shore. Boṭ-Yārḍ builds the lake's hulls: the dugouts, the launches, the market boats and the barges every town uses. It has no dugouts of its own in the tune (`lk.boatyard.store`): its people build boats, not fish from them. It is the south-east round's first call.

*Proposed* look: slipways down the shore with hulls on the stocks, the timber yards and saw pits above them, the rope walk along the shore road, and a dry dock for the Sultan's launches. The timber comes up the lake from the Cataracts (P3 makes 4,000 t a year) by Erehwon.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `yards` | industry | 30 % | shore | the slipways, the dry dock, the sheds |
| `timber` | industry | 10 % | shore | the timber yards and saw pits |
| `town` | residential | 45 % | slope | the shipwrights' houses |
| `market` | market | 10 % | shore | the market and the temple |
| `rope` | industry | 5 % | shore | the rope walk along the shore road |

**The houses** (*proposed*): about 364, one a household: 55 % poor, 35 % middling, 10 % rich (about 200, 127 and 36), 20 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the slipways: `xa_slipway` (shore)
- the dry dock: `xa_drydock` (shore)
- the temple of the Decree: `xa_temple` (shore)

**The boats** (*proposed*, `90s`): no dugouts, 4 launches, 3 barges at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| slipways | `xa_slipway` | 4 |
| slips | `xa_slip` | 4 |
| dry dock | `xa_drydock` | 1 |
| boat sheds | `xa_boatshed` | 4 |
| timber yards | `xa_timber_yard (missing)` | 2 |
| workshops | `xa_workshop` | 4 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 3 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 364 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`; `xa_timber_yard`; a rope walk (a long shed; xa_workshop stands in).

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Boṭ-Yārḍ adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('boatyard', x, z)` fitted to the region's ground at 846,1519; shore bearing N; the wall's rise about 730 m in 7 km |
| (nothing else) | | |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59); `wood.planks` (the hulls on the stocks: the kit's own).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlkboatyard01`, "Boṭ-Yārḍ", type `town`, 846,1519, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

None beyond the shared target's.

## 9. Steps

Built in step **L3** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py boatyard`), the plan and its verify (`verify.py --assert ?town=boatyard` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py boatyard --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
