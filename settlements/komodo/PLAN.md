# Komodo, the Lizardmen's tin town at the far end of the eastern sea: a site plan (proposal, 2026-11-17)

The owner, 2026-11-16: *"the regional villages 3k"*; 2026-11-17: *"implement the lizardmen settlements and tune"*, *"don't
have to build them all yet"*. **How to build it is `kits/lizardmen/settle/GUIDE.md`**; this file is what to build.
Everything here is *proposed* unless it is the owner's or the tune's; the questions are in section 8.

What is settled:
- **Komodo** is one of the four villages the lore names (`LORE.md` 6.20; pin `spnqhezhiw`, **5.1 px 865,1617**).
- **~3,000 people**; in `LZ_TUNE` it makes a year **grain 600 t, produce 250 t, fish 240 t, meat and hide 90 t, tin 8 t**
  ("tin from the placers on its rivers; bamboo rice; little farmland"), and it is a **raider** town.
- **Its war band** (`LZ_TUNE.raids`, Z4): 120 Line warriors and Bulwarks, against the Golden Tears' camp (850,1628).
- **Its relics and its ley line** go to **the east reliquary** (*proposed* 790,1578).

Files: `spec.json`, `sheets/country.png`, `sheets/village.png` (made by `kits/lizardmen/settle/towns_plan.py`).

## 1. Core adoption

As Gila's, on the shared builder (`kits/lizardmen/settle`), with:

| Need | Module | How, here |
|---|---|---|
| the ground | the model baked round the pin (`lzv.py`), `core/drawn`, `KGROUND` | **the near grid run east 13.5 km along the shore** to hold the placer camp on Kruk Warra: x -4.5 to +13.5 km, z -5 to +4 km, at 25 m (`spec.json` `_pin.build`); the far grid 60 km at 500 m. Layers `ground.redsoil`, `ground.brown_mud_02`, `ground.damp_beach_sand` (the shore), `ground.tilled` |
| the coast | `core/coast` (when the region is cut) | until then the sea's edge is the model's, as `WATER.open`'s bed draws it |
| the village | `core/city` through `82-lzv-site.js` | one rhombic squared spiral, five windings, on a bluff |
| water | **`core/water`** | **the eastern terminal sea**: `WATER.open` (`spec.json` `lake`: level -2,600.5 m, salt, no tide, a calm field); the wells and the great tank `WATER.still`; **Kruk Warra** (r088, perennial, 51 m³/s) `WATER.flow` where the near grid holds it |
| the tin | **`kits/resources`** (`KRES.near`) | the placer washing floors on Kruk Warra's gravel (`spec.json` `_resolve`) |
| the outwork | `core/hamlet`, the Lizardmen row, focus `mine` | the placer camp on Kruk Warra, 11.9 km east |
| the economy | `core/region` (`LZ_TUNE`, `checkTown`) | `KM_REC` held to the tune |
| crops | `kits/crops` | bamboo-rice, taro, shade-manioc (the survey's Basilisk/Komodo shore list) |

## 2. The site

| | |
|---|---|
| Pin | **5.1 px 865,1617**, **-2,452 m** |
| Ground | a **bluff falling 11 % to the north**, to the sea's shore 1-2 km away (the sea's cells begin one pixel north); south it climbs to -2,050 m within 8 km |
| Air | **2.17 atm** |
| Climate | **XA hypertropic jungle**: 35 °C mean (39/31), **4,000 mm** (the model's ceiling) |
| The sea | **the eastern terminal sea**, its far east end: 9,272 km², salt, no tide; Basilisk at its west end, 204 km |
| Rivers | **Kruk Warra** (r088, perennial, 51.3 m³/s, lists Komodo) **11.9 km east**; **Leet Beck** (r145, perennial, 32.6) 16.5 km west; Tyan Gill (wadi, 7.6) 24.6 km |
| Tin and gold | placers (the geology): **Kruk Warra 11.9 km (gold high, tin medium)**, Leet Beck 16.5 km (both medium), Tyan Gill 24.6 km (tin high), Leet Beck 27.1 km |
| Neighbours | **the Golden Tears' camp 37 km south-west** (the war band's mark); Tuatara 157 km; the east reliquary **169 km at 298°**, across the sea |

## 3. Who lives there

Gila's shares (the owner agreed them for Gila, 2026-11-16).

| Caste | Share | People | Dwelling | Count |
|---|---|---|---|---|
| 1 Tenders | 25 % | 750 | `lz-warren` (28) | ~27 |
| 2 Makers | 22 % | 660 | `lz-makers` (10), three craft halls | ~62 + 3 halls |
| 3 Drovers | 25 % | 750 | `lz-longhouse` (33): the fishers and the rice | ~23 |
| 4 Line warriors | 15 % | 450 | `lz-lodge` (30) | ~25 |
| 6 Bulwarks | 10 % | 300 | | |
| 5 Interpreters | 3 % | 90 | `lz-tower` (7) | ~13 |

## 4. The layout (`sheets/village.png`, `sheets/country.png`)

- **One rhombic squared spiral**, five windings **32 → 40 → 50 → 62 → 78 m** (tighter than Gila's 36 m: the bluff is
  steep), a 46 m court; about 900 m across.
- **The axis (*proposed*):** 15°, within 6° of the contour: **the long arms run level along the bluff and the cross arms
  climb**; the mouth opens **due north, down to the shore**. Every building on a plinth (the builder's plinths; 4,000 mm of
  rain), the nest court graded level (`grade`, the builder's default).
- **The windings** as Gila's: Tenders with the tank, the seer's hall, the medicine hut, an obelisk; Tenders and towers; the
  Makers and the three halls and the warehouse; the Drovers with **three granaries**; the lodges with **two barracks**.
- **The mouth:** the mustering ground and the band's camp (hide and pole-and-shield tents), a lookout; from it a track down
  to the shore.
- **The shore:** **three fishing weirs and drying racks** (`lz-weir`) standing in the shallows 1.6 km north of the court.
- **The ley line** from the nest court **west-north-west, 298°**, over the sea toward the east reliquary.
- **The fields east** along the shore bench (0.8-3.6 km, under 16 % slope): bamboo-rice, taro, shade-manioc; five farms,
  one windmill (wet air, little wind), the herds, the stone circle.
- **The placer camp on Kruk Warra**, 11.9 km east: three washing floors (`lz-placer`) on the gravel `KRES.near` gives
  within 1.5 km of the geology's placer, the camp on `core/hamlet` (focus `mine`, ~90 workers), a track along the shore.

## 5. What it lives on (`KM_REC`, `[G data]`)

| Good | Made (t, `LZ_TUNE`) | Where | Its own need (the town's diet) | The Allotment |
|---|---|---|---|---|
| grain | 600 | the fields east | ~700 | ~100 t in (Tuatara, the warrens) |
| produce | 250 | the fields | ~250 | |
| fish | **240** | the weirs | ~120 | ~120 t out |
| meat and hide | 90 | the herds | ~90 | |
| tin | **8** | the placers | none | **all out to Basilisk's bronze hall** |
| salt | none | | ~25 | in, from Basilisk's pans |

`KM_REC.works` must make exactly grain 600, produce 250, fish 240, meat_hide 90, tin 8 (`LZ_TUNE.checkTown`).

## 6. Pieces and textures

- **No new piece**: `lz-weir` and `lz-placer` are the kit's works (`59w-lz-works.js`); `gl-well` and `gl-tank` Gila's.
- **Textures:** none owed.

## 7. Steps

| Step | What | Test | Status |
|---|---|---|---|
| **K0** | this plan, `spec.json`, the sheets | `python3 kits/lizardmen/settle/towns_plan.py komodo` | done (`9fadd409f`) |
| **K1** | `KM_REC` and the spec | `checkTown` with a negative | done (`test-km-records.js`) |
| **K2** | the page | the guide's section 5; `water-on-core` with the sea (`expect.lake`); `expect.keys` lz-nest, lz-ley, lz-muster, gl-tank, lz-weir, lz-placer | done (GPU-verified; owner review on section 8 pending) |
| **K3** | flora (`biomes/rift`, XA jungle) | later | open |

**Watch:** the near grid is twice Gila's (18 x 9 km at 25 m: ~260,000 vertices). If the page is heavy, draw the placer
camp's ground from the far grid and keep the near grid to the village (question 3).

## 8. Questions for the owner (answers *proposed*)

1. **Komodo at its pin**, on the bluff over the sea? *Proposed:* yes.
2. **The long arms along the contour, the mouth down to the shore**, every block on a plinth? *Proposed:* yes.
3. **The placer camp on Kruk Warra on the page** (the near grid run 13.5 km east), or the camp a record only, drawn when the
   open-world region is cut? *Proposed:* on the page.
4. **Gila's shares** for Komodo? *Proposed:* yes.
5. **Three weirs** for the tune's 240 t of fish? *Proposed:* yes.
