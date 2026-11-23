# Ḍāiyar (Dyer): a lake town of 1,400 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Ḍāiyar's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.dyer` |
| Name | Ḍāiyar (Dyer) |
| px | 870,1500 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -642,000 m, z -138,000 m |
| People | 1,400 (about 255 households of 5.5) |
| Province | P7 (Nōrth-Shor, the North Shore), hub Phēr (`xan.pher`), 57 km by water (straight line) |
| Diet | `lake`: 175 t of grain a year, 63 t of fish, 11 t of fruit |
| Fishing | `lk.dyer.fishing`, the dugouts: crew 200, 218 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 63 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | none counted (its fish only) |
| Terraces | `lk.dyer.terraces`: crew 160 in the harvest, 105 t of grain (three fifths of what it eats); about 84 ha of terrace at 1.5 t/ha |
| From the hub | 70 t of grain a year by the round |
| The round | `round.north-east` (Phēr's north-east round): call 3 of 3, after Ōlḍ-Thalaba, before Phēr |
| The fair | `T.loops`: the fair's east loop calls here two days a week |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -500 m, 8.1 % slope over its 2 km cell; the lake (-520 m) on the S; relief 1,005 m within 7 km; the highest ground within 7 km at 10 m (510 m above the town) |
| The shore | *proposed* coast class `sand` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model; the Sakāi Ḍrāi (`r488`, a wadi, 5.8 m³/s) ends at 881,1506, 11 km east. |
| The region | `xanadu-north-shore`, site `sxandyer01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 13 ha of town (110 people a ha in the lanes), a footprint radius of about 200 m round the landing, the terraces above it out to the band |

## 3. The town

The dyers' town, the north shore's east end. Ḍāiyar is a fishing town in the tune (`lk.dyer.fishing`), but its name says the dyers: *proposed*, it dyes the lake's cotton, wool and mats (Wībhar dyes the silk), with dye works whose vats drain into the lake. It is the last call of Phēr's north-east round, 28 km east of Phēr.

*Proposed* look: colour on the shore. The dye works along the water with their vats and the lengths of cloth hung on lines down to the beach, the madder and indigo fields on the benches, the fishers at the west end. The Sakāi Ḍrāi (`r488`) ends 11 km east, toward Ālph-Hēḍ across the water.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `dyes` | industry | 20 % | shore | the dye works and the drying lines |
| `landing` | harbour | 10 % | shore | the landing and the fish racks |
| `town` | residential | 45 % | slope | the town |
| `fields` | farm | 15 % | bench | the dye-plant fields on the benches |
| `market` | market | 10 % | slope | the market and the temple |

**The houses** (*proposed*): about 255, one a household: 55 % poor, 35 % middling, 10 % rich (about 140, 89 and 25), 25 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the dye works: `xa_dye_works` (shore)
- the temple of the Decree: `xa_temple` (slope)

**The boats** (*proposed*, `90s`): 50 dugouts (two to a dugout, the fishing crew's half afloat at a time), 2 launches, 1 barge at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| dye works | `xa_dye_works` | 5 |
| fish racks | `xa_fish_racks` | 6 |
| boat sheds | `xa_boatshed` | 3 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 2 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 255 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`.

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Ḍāiyar adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('dyer', x, z)` fitted to the region's ground at 870,1500; shore bearing S; the wall's rise about 510 m in 7 km |
| The dye plants | `kits/crops` | `CROPS.palette` for the dyes the north shore can grow (indigo, madder, safflower), so the fields and the cloth agree |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59); `ground.dyeworks` (section 58, owed).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxandyer01`, "Ḍāiyar", type `town`, 870,1500, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

1. The dyers' trade is in the name only. *Default:* no good added to the tune (the cloth is not counted); a `dye` good waits for the owner.

## 9. Steps

Built in step **L1** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py dyer`), the plan and its verify (`verify.py --assert ?town=dyer` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py dyer --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
