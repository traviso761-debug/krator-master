# Lōṭas (Lotus): a lake town of 1,500 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Lōṭas's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.lotus` |
| Name | Lōṭas (Lotus) |
| px | 822,1507 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -738,000 m, z -124,000 m |
| People | 1,500 (about 273 households of 5.5) |
| Province | P1 (Lēk-Shor, the Lake Shore), hub Erehwon (`s57bkv9741`), 43 km by water (straight line) |
| Diet | `lake`: 188 t of grain a year, 68 t of fish, 12 t of fruit |
| Fishing | `lk.lotus.fishing`, the dugouts: crew 200, 234 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 68 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | `lk.lotus.mats`: 60 t of mats a year, crew 200; the road to the hub carries 85 % of the stock (`share`) |
| Its make | `lk.lotus.fruit`: 120 t of fruit a year, crew 200; the road to the hub carries 85 % of the stock (`share`) |
| Terraces | `lk.lotus.terraces`: crew 160 in the harvest, 112 t of grain (three fifths of what it eats); about 84 ha of terrace at 1.6 t/ha |
| From the hub | 75 t of grain a year by the round |
| The round | `round.west` (Erehwon's west round): call 4 of 6, after Ōrcharḍ, before Phish-Mārkiṭ |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -316 m, 9.7 % slope over its 2 km cell; the lake (-520 m) on the NE; relief 879 m within 7 km; the highest ground within 7 km at 20 m (336 m above the town) |
| The shore | *proposed* coast class `marsh` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model. |
| The region | `xanadu-lake-shore`, site `sxanlklotus01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 14 ha of town (110 people a ha in the lanes), a footprint radius of about 200 m round the landing, the terraces above it out to the band |

## 3. The town

The reed and lotus town of the west shore's shallows. Lōṭas makes 60 t of mats (`lk.lotus.mats`, every lake household buys a kilo a year) and 120 t of fruit (`lk.lotus.fruit`, the lotus root and the shallows' fruit). It stands higher than the shore (the model's cell is at -316 m): the town is on a knoll over a broad bay of shallows where the reed beds and the lotus ponds are.

*Proposed* look: two towns, one on the knoll and one on the water. The houses on the knoll, and below them the reed beds with the mat sheds and reed racks on stilts at their edge, the lotus ponds walled off in the shallows, and the dugouts threading the channels between them.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `knoll` | residential | 45 % | slope | the town on the knoll |
| `sheds` | industry | 20 % | shore | the mat sheds and reed racks at the reed beds' edge |
| `ponds` | farm | 15 % | shore | the lotus ponds and their keepers' houses on stilts |
| `market` | market | 10 % | slope | the market and the temple on the knoll's shoulder |
| `landing` | harbour | 10 % | shore | the landing and its channel |

**The houses** (*proposed*): about 273, one a household: 60 % poor, 32 % middling, 8 % rich (about 164, 87 and 22), 30 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the reed beds and mat sheds: `xa_mat_shed` (shore)
- the lotus ponds: `xa_fishponds (as walled ponds in the shallows)` (shore)
- the temple of the Decree: `xa_temple` (slope)

**The boats** (*proposed*, `90s`): 45 dugouts (two to a dugout, the fishing crew's half afloat at a time), 1 launch, 1 barge at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| mat sheds and reed racks | `xa_mat_shed` | 8 |
| walled ponds | `xa_fishponds` | 4 |
| fish racks | `xa_fish_racks` | 5 |
| boat sheds | `xa_boatshed` | 3 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 2 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 273 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`; stilt houses at the water (the Andean poor house on piles, *proposed*: a variant, not a new piece).

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Lōṭas adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('lotus', x, z)` fitted to the region's ground at 822,1507; shore bearing NE; the wall's rise about 336 m in 7 km |
| The reed beds | `core/mask` (`KMASK`), `core/water` | The beds' mask in the shallows (the lake under 2 m), the reeds drawn as cards on it |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59); `ground.reedbed`; `card.reed`; `roof.thatch.reed` (the mat sheds); `reed.mat.woven` (the mats drying).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlklotus01`, "Lōṭas", type `town`, 822,1507, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

None beyond the shared target's.

## 9. Steps

Built in step **L4** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py lotus`), the plan and its verify (`verify.py --assert ?town=lotus` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py lotus --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
