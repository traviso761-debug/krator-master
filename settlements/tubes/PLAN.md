# The Tubes, the Lizardmen's cavern town in the Rift line's ruined station: a site plan (proposal, 2026-11-17)

The owner, 2026-11-16: the Tubes is *"both a ruin and a lizardman town of about 1000"*; 2026-11-17: *"don't have to build
them all yet"*. This file is what to build. **It is not built on the surface builder**: the Tubes is a cavern, and its page
follows **Loj Twenny** (`settlements/loj-twenny`, on `core/city/cavern`), not Gila. `kits/lizardmen/settle/GUIDE.md` still
holds for its rules, its records, its checks and its traps (sections 2, 4's records, 5, 6). Everything here is *proposed*
unless it is the owner's or the tune's; the questions are in section 8.

What is settled:
- **The Tubes** (pin `sa8xk6pimb`, **5.1 px 608,1547**) is **station 8 of the Ancients' Rift line** (`LORE.md` 6.1: "1 Dalab,
  2 Shelf, 3 the Twenny junction, ... 8 The Tubes, 9 Cube: Loj Nahn"), ruined, and a Lizardmen town of **~1,000**.
- In `LZ_TUNE` it makes a year **produce 120 t (fungus beds), fish 40 t, meat and hide 20 t, relics 3 t** (from the ruined
  station) and eats a **cavern's diet** (more produce, less grain); its relics go to **the west reliquary** (651.9,1486.7).
- **The scale model has the cavern** (`tools/scale-model/model/data/tubes.json`): the tube `tube_rift_08` ("Southern Rift
  Basalt Tube Complex", flow-banded basalt, **24 m wide, 16 m high, 40 m down**) runs north-east to south-west through the
  pin, and at the pin its cavern `cav_the_tubes` is a **bottle hall, 220 x 150 m, 38 m high, with a 25 m skylight**.

Files: `spec.json` (the cavern's geometry from the model, in the page frame), `sheets/country.png` (the ridge),
`sheets/village.png` (the town in the tube), made by `kits/lizardmen/settle/towns_plan.py`.

## 1. Core adoption

| Need | Module | How |
|---|---|---|
| the cavern | **`core/terrain/39-core-cavern.js`** (`KCAVERN`) and **`core/city/cavern`** (`KCITY.cavern`, its `lineHold` strategy) | the hall and the tube's two arms as a line hold: the spine the tube, the spaces the hall and the side tubes, the sites cut into the walls; `KCITY.cavern.carve` gives the `KCAVERN` records. **`core/city/cavern` and Loj Twenny are on branch `claude/loj-twenny-059a5e`** (not on main when this was written): build after it merges |
| the light | **`core/cavelight`** (`KCAVELIGHT`) | the skylight's shaft of day over the nest hall, and the Lizardmen's own light: lacquered bronze lamps, few (they see well in the dark: *proposed*) |
| the station's ruin | **`kits/ancient-transit`** (the subway, `56b`) and **`core/ruins`** (`KRUINS.watch`) | the platforms and a wrecked train in the south-west arm, the wreck watched (nothing floats) |
| the ridge above | the model baked round the pin (as `lzv.py` bakes it), `core/drawn`, `KGROUND` | the ridge, the skylight's rim, the two portals, the fields; layers `ground.ash.soil`, `ground.wadi.cobble`, `ground.tilled` |
| the buildings | `kits/lizardmen` | the nest hall, the warrens, the towers, the seer's hall, the bells, the fungus beds (`lz-fungus`, the kit's works), lodges; **cells cut into the tube's walls** as `core/city/cavern` sites (drawn as the kit's triangular caste doors and a leiwen band in the basalt) |
| the outwork | `core/hamlet`, the Lizardmen row, focus `fishing` | the fishing camp on the western sea's shore 15.6 km north-east, a record (off the page) |
| the economy | `core/region` (`LZ_TUNE`, `checkTown`) | `TW_REC` held to the tune |
| people, time | `core/simulation`, `core/sched` | as Loj Twenny runs its hold, when the castes have figures; until then the census is data |

## 2. The site

| | |
|---|---|
| Pin | **5.1 px 608,1547**, **-77 m** on the ridge above; the hall's floor ~40 m below (`tubes.json` depth) |
| Ground | a basalt **rift-shoulder ridge**, falling 9.5 % to the north-west at the pin and steeply on every side (-1,685 m 10 km east) |
| Air | **1.62 atm** |
| Climate | **Csa, hot-summer Mediterranean**: 21 °C, **925 mm** |
| The tube | `tube_rift_08`: from 628,1528 (north-east) through the pin to 594,1558 (south-west), 140 km long in all; a branch to Loj Twenny's cavern far north |
| Water | **Tkyoob Warra** (r052, perennial, 98.5 m³/s) 19 km; the western terminal sea **15.6 km north-east** |
| Tin and gold | the geology's placer on Tkyoob Warra 25.9 km (gold high, tin medium): not worked (the tune gives the Tubes none) |
| Neighbours | Gila **153 km at 36°**; the west reliquary **149 km at 36°**; the Pile 228 km |

## 3. Who lives there

More Tenders (the beds in the dark) and more Interpreters (the relics) than a village.

| Caste | Share | People | Where |
|---|---|---|---|
| 1 Tenders | 30 % | 300 | warrens on the hall's floor (~11 `lz-warren`), the fungus beds |
| 2 Makers | 25 % | 250 | cells cut into the north-east arm's walls (~25 of 10) and the craft hall |
| 3 Drovers | 20 % | 200 | cells in the north-east arm (~6 of 33 holds' worth); the fishers at the camp |
| 4 Line warriors | 12 % | 120 | lodges in the south-west arm beyond the station (~7) |
| 6 Bulwarks | 8 % | 80 | with the warriors |
| 5 Interpreters | 5 % | 50 | towers on the hall's floor (~7 `lz-tower`, 21 m under a 38 m roof), the seer's hall |

## 4. The layout (`sheets/village.png`)

The squared spiral is the hall's floor; the tube's arms are the windings run out straight, as the tube allows.
- **The bottle hall** (220 x 150 m, its long axis on the tube): **the nest hall** at its centre under the skylight; round it
  on the floor **a squared spiral of two windings**: the Tenders' warrens, the Interpreters' towers, the seer's hall, the
  bells and the paired stelae, every door facing the nest. The skylight is the town's one opening to the sky.
- **The north-east arm, 600 m**: the Makers' and Drovers' **cells cut into both walls**, every door facing back up the tube
  toward the hall (the cavern's form of "every door faces the nest"); the craft hall where the arm leaves the hall.
- **Seven side tubes** off the north-east arm: **the fungus beds** (`lz-fungus`, the crop grown in the dark: the tune's 120 t
  of produce; `kits/crops` pale fungi).
- **The south-west arm**: first **the station's ruin**, 220 m (the platforms, a wrecked train, the relic store: the Lizardmen
  glean the station for the tune's 3 t of relics); then **the lodges** of the warriors and Bulwarks and a barracks, 300 m.
- **The portals**: about 600 m out each way, where a collapsed roof opens the tube to the ridge, a ramp climbs out; **the
  mustering ground and a lookout at the north-east portal** (the way to the sea and to Gila).
- **The ley line** from the nest hall **north-north-east, 36°**, up the skylight's shaft, toward the west reliquary.
- **On the ridge**: the skylight's rim walled with basalt; small fields of ashmillet and bambara on the ridge's flatter top;
  the herds. The fishing camp on the sea is a record, not on the page.

## 5. What it lives on (`TW_REC`, `[G data]`)

| Good | Made (t, `LZ_TUNE`) | Where | Its own need (the cavern's diet x 1,000) | The Allotment |
|---|---|---|---|---|
| produce | **120** | the seven fungus beds | ~120 | |
| fish | 40 | the fishing camp on the western sea | ~40 | |
| meat and hide | 20 | the herds on the ridge | ~20 | |
| relics | **3** | the station's ruin | | to **the west reliquary** |
| grain | none | | ~150 | **in**: Gila and the western warrens |
| salt, bronze | none | | ~8, ~2 | in: Gila's salt, Basilisk's bronze |

`TW_REC.works` must make exactly produce 120, fish 40, meat_hide 20, relics 3 (`LZ_TUNE.checkTown`).

## 6. Pieces and textures

- **Owed** (built as the Tubes' own, prefix `tw`, or the kit's: question 4): **a wall cell** (a triangular caste door cut
  into the basalt with a leiwen band, the cell behind it as `core/city/cavern`'s site), **the skylight's rim**, **the
  portal ramp**. The station's ruin is the transit kit's subway in ruin.
- **Textures:** the tube's rock is the library's flow-banded basalt (the kit's pack has it); the ground layers exist. None owed.

## 7. Steps

| Step | What | Test |
|---|---|---|
| **W0** | this plan, `spec.json`, the sheets | `python3 kits/lizardmen/settle/towns_plan.py tubes` |
| W1 | wait for `core/city/cavern` and Loj Twenny on main; read Loj Twenny's `PLAN.md`, `build.py`, `src/20-lt-plan.js` | |
| W2 | the hold's plan (`src/20-tw-plan.js`, `[G data]`) on `KCITY.cavern.lineHold`: the spine along `_cavern.tube`, the hall, the side tubes, the sites | `KCITY.cavern.audit(H).ok`; a node test with a negative |
| W3 | `TW_REC` | `checkTown` with a negative |
| W4 | the page: the ridge, the carve, the light, the town, the station's ruin | Loj Twenny's verify's asserts, plus `people` (1,000 within 15 %), `ley-aims`, `records-held`, every cell door facing the hall, `KRUINS` nothing floating |

## 8. Questions for the owner (answers *proposed*)

1. **The Tubes in the model's bottle hall** (220 x 150 m, 38 m high) and the tube's two arms? *Proposed:* yes.
2. **Built on `core/city/cavern`, as Loj Twenny**, after that branch merges? *Proposed:* yes.
3. **The station's ruin in the south-west arm**, gleaned for relics; the town in the station's own tube? *Proposed:* yes.
4. **The wall cell, the skylight's rim and the portal ramp** as the kit's pieces (other Lizardmen caverns may come) or the
   Tubes' own? *Proposed:* the kit's.
5. **Little light**: the Lizardmen see well in the dark, so few lamps and the skylight's shaft the brightest thing? *Proposed:* yes.
6. **The fishing camp** on the western sea as a record only, off the page? *Proposed:* yes.
