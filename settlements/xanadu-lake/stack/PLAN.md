# Siṭāq (Stack): a lake town of 900 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Siṭāq's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.stack` |
| Name | Siṭāq (Stack) |
| px | 812,1495 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -758,000 m, z -148,000 m |
| People | 900 (about 164 households of 5.5) |
| Province | P1 (Lēk-Shor, the Lake Shore), hub Erehwon (`s57bkv9741`), 73 km by water (straight line) |
| Diet | `lake`: 112 t of grain a year, 40 t of fish, 7 t of fruit |
| Fishing | `lk.stack.fishing`, the dugouts: crew 200, 140 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 40 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | none counted (its fish only) |
| Terraces | `lk.stack.terraces`: crew 160 in the harvest, 68 t of grain (three fifths of what it eats); about 51 ha of terrace at 1.6 t/ha |
| From the hub | 45 t of grain a year by the round |
| The round | `round.west` (Erehwon's west round): call 6 of 6, after Phish-Mārkiṭ, before Erehwon |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -447 m, 10.1 % slope over its 2 km cell; the lake (-520 m) on the NE; relief 699 m within 7 km; the highest ground within 7 km at 10 m (457 m above the town) |
| The shore | *proposed* coast class `cliff` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | The Girīn Ḍrāi (`r613`, wadi, 7.2 m³/s) and the Barāiṭ Ḍrāi (`r753`, wadi, 4.9 m³/s) end within 6 km: dry ravines that flood in the wet season. The village keeps off their beds. |
| The region | `xanadu-lake-shore`, site `sxanlkstack01` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 8 ha of town (110 people a ha in the lanes), a footprint radius of about 150 m round the landing, the terraces above it out to the band |

## 3. The town

The fishing village under the stack, the lake's north-west corner. Siṭāq, 900, is the smallest town of the west round, on a steep shore (10 %) where two wadis come down (the Girīn Ḍrāi, `r613`, and the Barāiṭ Ḍrāi, `r753`, both ending within 6 km). Its name is the stack: *proposed*, a rock stack in the water off the town, a landform record on the region, with a shrine on top.

*Proposed* look: Santa Cruz La Laguna, reachable only by boat. A tight village up a ravine between the two wadis' fans, a landing in the lee of the stack, fish racks on the rocks, and the terraces on the fans.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `landing` | harbour | 15 % | shore | the landing in the stack's lee |
| `village` | residential | 60 % | slope | the village up the ravine |
| `fans` | farm | 15 % | bench | the terraces on the wadis' fans |
| `temple` | civic | 10 % | slope | the temple |

**The houses** (*proposed*): about 164, one a household: 65 % poor, 30 % middling, 5 % rich (about 106, 49 and 8), 35 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the stack and its shrine: `a landform islet; xa_wayside_shrine on top` (shore)
- the temple of the Decree: `xa_temple` (slope)

**The boats** (*proposed*, `90s`): 30 dugouts (two to a dugout, the fishing crew's half afloat at a time), 1 launch, 0 barges at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| fish racks | `xa_fish_racks` | 6 |
| boat sheds | `xa_boatshed` | 3 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 2 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 164 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor (a headman's house: xa_mid_c)`.

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Siṭāq adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('stack', x, z)` fitted to the region's ground at 812,1495; shore bearing NE; the wall's rise about 457 m in 7 km |
| The stack | `core/world` (`41l-world-landforms.js`) | An `islet` record in the region's `landforms` off the landing (*proposed*: 40 m across, 35 m over the water), stamped as the north shore's point is |
| The wadis | `core/water` | Their beds from `rivers.json`; the village's lots kept off them (the plan's water rule) |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlkstack01`, "Siṭāq", type `town`, 812,1495, polity the Sultanate (the shared target's section 9 batch).
- The stack is a region landform record, not a model edit.

## 8. Open points (each with the default the build takes if the owner says nothing)

1. The stack: a landform on the region, not a model edit. *Default:* 40 m across, 35 m high, 300 m offshore.

## 9. Steps

Built in step **L4** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py stack`), the plan and its verify (`verify.py --assert ?town=stack` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py stack --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
