# Gārḍan (Garden): a lake town of 1,800 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Gārḍan's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.garden` |
| Name | Gārḍan (Garden) |
| px | 836,1517 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -710,000 m, z -104,000 m |
| People | 1,800 (about 327 households of 5.5) |
| Province | P1 (Lēk-Shor, the Lake Shore), hub Erehwon (`s57bkv9741`), 10 km by water (straight line) |
| Diet | `lake`: 225 t of grain a year, 81 t of fish, 14 t of fruit |
| Fishing | `lk.garden.fishing`, the dugouts: crew 200, 281 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 81 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | `lk.garden.fruit`: 300 t of fruit a year, crew 200; the road to the hub carries 85 % of the stock (`share`) |
| Terraces | `lk.garden.terraces`: crew 160 in the harvest, 135 t of grain (three fifths of what it eats); about 101 ha of terrace at 1.6 t/ha |
| From the hub | 90 t of grain a year by the round |
| The round | `round.west` (Erehwon's west round): call 1 of 6, after Erehwon, before Qorī |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -460 m, 8.3 % slope over its 2 km cell; the lake (-520 m) on the N; relief 1,176 m within 7 km; the highest ground within 7 km at 336 m (796 m above the town) |
| The shore | *proposed* coast class `shingle` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model. |
| The region | `xanadu-lake-shore`, site `sxanlkgarden01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 16 ha of town (110 people a ha in the lanes), a footprint radius of about 250 m round the landing, the terraces above it out to the band |

## 3. The town

The Sultan's gardens' town, 10 km west of Erehwon. Gārḍan makes 300 t of fruit a year (`lk.garden.fruit`) on walled orchards up the slope: apricots, the strawberry-tree, citrus, and the pleasure gardens of the court's houses on the bench. It is the west round's first call and Erehwon's nearest neighbour along the shore.

*Proposed* look: a green town of garden walls. Walled orchards (`xa_garden_wall`) stepping up the terraces, the rill gardens of the rich houses on the bench (`xa_rill_garden`), the fruit market and the drying racks by the landing, and the houses of Erehwon's merchants who keep a summer house here.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `landing` | harbour | 10 % | shore | the landing, the fruit market, the drying racks |
| `town` | residential | 40 % | slope | the gardeners' houses |
| `orchards` | farm | 25 % | bench | the walled orchards on the benches |
| `villas` | residential | 15 % | bench | the merchants' summer houses and their rill gardens |
| `temple` | civic | 10 % | slope | the temple and the market square |

**The houses** (*proposed*): about 327, one a household: 40 % poor, 40 % middling, 20 % rich (about 131, 131 and 65), 20 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the walled orchards: `xa_garden_wall with the orchard plot (missing)` (bench)
- the rill gardens: `xa_rill_garden, xa_rill_hill` (bench)
- the temple of the Decree: `xa_temple` (slope)

**The boats** (*proposed*, `90s`): 50 dugouts (two to a dugout, the fishing crew's half afloat at a time), 3 launches, 1 barge at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| walled orchards | `xa_garden_wall + orchard plot` | 12 |
| rill gardens | `xa_rill_garden` | 3 |
| fruit stores | `xa_warehouse` | 2 |
| fish racks | `xa_fish_racks` | 6 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 3 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 327 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`; the orchard plot.

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Gārḍan adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('garden', x, z)` fitted to the region's ground at 836,1517; shore bearing N; the wall's rise about 796 m in 7 km |
| The orchards | `core/hamlet` (`14-hamlet-farmland.js`), `kits/crops` | The trees as land on the benches, the farmland pass a hamlet uses, with `CROPS.pick` for the fruit |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlkgarden01`, "Gārḍan", type `town`, 836,1517, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

None beyond the shared target's.

## 9. Steps

Built in step **L4** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py garden`), the plan and its verify (`verify.py --assert ?town=garden` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py garden --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
