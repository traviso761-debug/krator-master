# Nēṭ (Net): a lake town of 1,400 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Nēṭ's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.net` |
| Name | Nēṭ (Net) |
| px | 833,1488 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -716,000 m, z -162,000 m |
| People | 1,400 (about 255 households of 5.5) |
| Province | P7 (Nōrth-Shor, the North Shore), hub Phēr (`xan.pher`), 21 km by water (straight line) |
| Diet | `lake`: 175 t of grain a year, 63 t of fish, 11 t of fruit |
| Fishing | `lk.net.fishing`, the dugouts: crew 200, 218 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 63 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | none counted (its fish only) |
| Terraces | `lk.net.terraces`: crew 160 in the harvest, 105 t of grain (three fifths of what it eats); about 84 ha of terrace at 1.5 t/ha |
| From the hub | 70 t of grain a year by the round |
| The round | `round.north-west` (Phēr's north-west round): call 2 of 4, after Qōqō, before Malbari |
| The fair | `T.loops`: the fair's west loop calls here two days a week |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -500 m, 4.9 % slope over its 2 km cell; the lake (-520 m) on the W; relief 872 m within 7 km; the highest ground within 7 km at 32 m (532 m above the town) |
| The shore | *proposed* coast class `shingle` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model. |
| The region | `xanadu-north-shore` holds the ground (its box is px 808-884 by 1446-1514) but **no site yet**: step L2 adds it |
| Footprint | *proposed* about 13 ha of town (110 people a ha in the lanes), a footprint radius of about 200 m round the landing, the terraces above it out to the band |

## 3. The town

The net-makers' town. Nēṭ, 1,400, is a fishing town in the tune (`lk.net.fishing`); its name says the nets: *proposed*, it makes the lake's nets and lines as Boṭ-Yārḍ makes its hulls (no good in the tune: the nets are the fleets' own gear). It stands on a point between two bays (the lake lies west and south of the pin), the north-west round's second call.

*Proposed* look: net frames everywhere. The net lofts along the shore road with the nets hung to dry on frames in front of them, the rope and twine walks, the fish racks on the point, and a small harbour on each side of the point so the boats land in either wind.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `point` | harbour | 20 % | shore | the two landings either side of the point, the fish racks |
| `lofts` | industry | 20 % | shore | the net lofts and frames along the shore road |
| `town` | residential | 45 % | slope | the town up behind the point |
| `market` | market | 10 % | slope | the market and the temple |
| `bench` | farm | 5 % | bench | the terraces |

**The houses** (*proposed*): about 255, one a household: 60 % poor, 32 % middling, 8 % rich (about 153, 81 and 20), 30 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the net lofts: `xa_net_loft (missing)` (shore)
- the temple of the Decree: `xa_temple` (slope)

**The boats** (*proposed*, `90s`): 55 dugouts (two to a dugout, the fishing crew's half afloat at a time), 2 launches, 1 barge at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| net lofts and frames | `xa_net_loft (missing; xa_workshop stands in)` | 6 |
| fish racks | `xa_fish_racks` | 8 |
| boat sheds | `xa_boatshed` | 4 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 2 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 255 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; `xa_governor`; `xa_net_loft`.

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Nēṭ adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('net', x, z)` fitted to the region's ground at 833,1488; shore bearing W; the wall's rise about 532 m in 7 km |
| The region's site | `openworld/SITES.json` | A new site (`sxanlknet01`, *proposed*) with corridors to Malbari and Qōqō (step L2) |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59); the nets (`fibre.reedmat` tinted, or a net card: none in the library; *proposed* a cut-out `card.net` in section 59 if the frames read badly).

## 7. Pins (the scale-model queue; listed, not edited)

- A records-only town pin, `sxanlknet01`, "Nēṭ", type `town`, 833,1488, polity the Sultanate (the shared target's section 9 batch).

## 8. Open points (each with the default the build takes if the owner says nothing)

None beyond the shared target's.

## 9. Steps

Built in step **L2** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py net`), the plan and its verify (`verify.py --assert ?town=net` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py net --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
