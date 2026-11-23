# Ōlḍ-Thalaba (Old Thalaba): a lake town of 600 on Erewhon's lake (plan, 2026-11-22)

One of the twenty lake towns of the shared target (`settlements/xanadu-lake/PLAN.md`: the target, the spec's shape, the
pieces, the verify and the Core adoption every town shares). This file is what is Ōlḍ-Thalaba's own. The owner, 2026-11-16:
*"Lake towns over 500 can be laid out in full"*; 2026-11-22: one shared target and the regions draw them. Everything not
from the owner, the lore or the tune is *proposed*.

## 1. The record (`XAN_TUNE.lake`, read in place)

| Field | Value |
|---|---|
| Id | `lk.old-thalaba` |
| Name | Ōlḍ-Thalaba (Old Thalaba) |
| px | 860,1496 (the 5.1 canvas, 2 km a pixel); in the xanadu-oidong-highrift frame x -662,000 m, z -146,000 m |
| People | 600 (about 109 households of 5.5) |
| Province | P7 (Nōrth-Shor, the North Shore), hub Phēr (`xan.pher`), 35 km by water (straight line) |
| Diet | `lake`: 75 t of grain a year, 27 t of fish, 5 t of fruit |
| Fishing | `lk.old-thalaba.fishing`, the dugouts: crew 135, 94 t a year (`T.fishKgPerson` 260 kg a head x .6); it eats 27 t, and the road to the hub carries 55 % of the stock (`share`); its fishery `T.fishery`, half a year of catch in the water |
| Its make | none counted (its fish only) |
| Terraces | `lk.old-thalaba.terraces`: crew 108 in the harvest, 45 t of grain (three fifths of what it eats); about 36 ha of terrace at 1.5 t/ha |
| From the hub | 30 t of grain a year by the round |
| The round | `round.north-east` (Phēr's north-east round): call 2 of 3, after Māuṭh, before Ḍāiyar |
| The fair | `T.loops`: the fair's east loop calls here two days a week |

## 2. The site and the ground

| | |
|---|---|
| The model's cell | -500 m, 8.6 % slope over its 2 km cell; the lake (-520 m) on the S; relief 1,071 m within 7 km; the highest ground within 7 km at 2 m (502 m above the town) |
| The shore | *proposed* coast class `shingle` at the landing (`core/coast`; L0's fit reads the region's `coast:<class>` field and keeps it if it disagrees) |
| Water | None within 8 km on the model. |
| The region | `xanadu-north-shore`, site `soldthalaba1` (`openworld/SITES.json`, 6 km reach): cut, no town drawn yet |
| Footprint | *proposed* about 5 ha of town (110 people a ha in the lanes), a footprint radius of about 150 m round the landing, the terraces above it out to the band |

## 3. The town

The fishing village left on Thalaba's shore. When Thalaba moved up to the mouth of Godshearth (the owner, 2026-11-16: "move thalaba to the mouth of godshearth and put a new village on the lake in its place"), 600 stayed: Ōlḍ-Thalaba (`soldthalaba1`, a pin already) keeps the shore and fishes. It is the second call of Phēr's north-east round.

*Proposed* look: a village inside a town too big for it. The fishers live in the lower streets by the water; above them the old town stands empty, its caravan market and its merchants' houses stripped of their roofs and timber (carried up to the new Thalaba), the walls left standing: ruins watched by `core/ruins`. A temple still kept, a quay too long for the boats it has.

**The quarters** (*proposed*; the spec's `quarters`, shares of the houses):

| Quarter | Role | Share | Where | What |
|---|---|---|---|---|
| `landing` | harbour | 20 % | shore | the old quay, the fish racks |
| `village` | residential | 50 % | shore | the lived-in lower streets |
| `ruins` | ruin | 0 % | slope | the empty old town above (no houses counted: the ruins) |
| `temple` | civic | 15 % | shore | the old temple, still kept |
| `bench` | farm | 15 % | bench | the terraces still worked |

**The houses** (*proposed*): about 109, one a household: 75 % poor, 22 % middling, 3 % rich (about 82, 24 and 3), 30 % of them in the Andean set (87b) as Phēr takes a share.

**The landmarks** (the spec's `landmarks`):

- the old temple: `xa_temple` (shore)
- the empty caravan market: `xa_caravanserai, ruined (core/ruins)` (slope)
- the long quay: `xa_quay` (shore)

**The boats** (*proposed*, `90s`): 25 dugouts (two to a dugout, the fishing crew's half afloat at a time), 1 launch, 0 barges at the landing.

## 4. Its pieces

| What | Key | How many (*proposed*) |
|---|---|---|
| fish racks | `xa_fish_racks` | 4 |
| boat sheds | `xa_boatshed` | 2 |
| the temple of the Decree | `xa_temple` | 1 |
| wayside shrines (one a terrace stair) | `xa_wayside_shrine` | 2 |
| houses | `xa_poor_*`, `xa_mid_*`, `xa_rich_*`, `xa_andean_*` | 109 |

**Missing** (shared target section 5; each draws a stand-in until it lands): `xa_ghat`; a ruined state for the kit's houses (the fort asset has `state:'ruined'`; the houses do not: *proposed*, the ruin drawn by `core/ruins` from the kept house's walls, roofs off).

## 5. Core adoption

The shared table (`../PLAN.md` section 7) holds for every town: `core/world`, `core/coast`, `core/water`, `core/city` and
`core/space`, `core/rand`, `core/tags`, `core/mask`, `kits/xanadu`, `kits/interiors`, `core/atmos`, `core/charactermodels`,
`core/region`. What Ōlḍ-Thalaba adds:

| Need | Module | How |
|---|---|---|
| Its ground | `core/world`, `89zp-xl-site.js` | `xlH('old-thalaba', x, z)` fitted to the region's ground at 860,1496; shore bearing S; the wall's rise about 502 m in 7 km |
| The ruins | `core/ruins` (`KRUINS`), `KRUBBLE` | Every ruined house: `KRUINS.watch(root, {name, ground})` once drawn; fallen roofs and walls as KRUBBLE heaps, seated by their rotated extents |

## 6. Textures

the shared set (`../PLAN.md` section 8); `stone.ghat.wet` (section 59); `wall.limewash.scorched` (the stripped walls).

## 7. Pins (the scale-model queue; listed, not edited)

- None new: `soldthalaba1` is its pin (5.1e12).

## 8. Open points (each with the default the build takes if the owner says nothing)

1. How many of the old town's houses stand ruined. *Default:* as many as the old Thalaba's 2,400 had (about 440), the village living in the lowest 110.

## 9. Steps

Built in step **L1** of the shared target (`../PLAN.md` section 10): the spec row in `89zl-xl-specs.js`, the ground fitted
(`tools/fit_lake_town.py old-thalaba`), the plan and its verify (`verify.py --assert ?town=old-thalaba` on the GPU lane), its
`bake_towns.py` entry and tile, and the region drawing it. Done when the verify passes, `bake_towns.py old-thalaba --check` reads
the same, the node tests hold its census to the tune, and `tools/check_core_use.py` passes.
