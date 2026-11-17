# Tuatara, the Lizardmen's copper town on the volcanic savanna: a site plan (proposal, 2026-11-17)

The owner, 2026-11-16: *"basilisk will be about 15k and the regional villages 3k"*; 2026-11-17: *"implement the lizardmen
settlements and tune"*, *"don't have to build them all yet"*. This is the plan a builder follows when the owner wants the
page. **How to build it is `kits/lizardmen/settle/GUIDE.md`**; this file is what to build. Everything here is *proposed*
unless it is the owner's or the tune's; the questions are in section 8.

What is settled:
- **Tuatara** is one of the four villages the lore names (`LORE.md` 6.20; pin `szv27b2reu`, **5.1 px 818,1554**).
- **~3,000 people**; in `LZ_TUNE` (`core/region/data/lz-tune.js`) it makes a year **grain 1,000 t, produce 250 t, meat and
  hide 210 t, copper 70 t** ("the richest ground: copper 102 nodes, the savanna's grain; no perennial water, so no fish"), its
  smiths rework bronze, and it is a **raider** town.
- **Its war band** (`LZ_TUNE.raids`, Z4): 150 of the Line warriors and the Bulwarks, against the Sultanate's Marches.
- **Its relics and its ley line** go to **the east reliquary** (*proposed* 790,1578), in the east loop of the Coil Rounds.

Files: `spec.json` (the proposed `LZV_SPEC`, made by `kits/lizardmen/settle/towns_plan.py`), `sheets/country.png` (the ground
round the pin), `sheets/village.png` (the spiral as the builder lays it).

## 1. Core adoption

As Gila's (`settlements/gila/PLAN.md` section 1), on the shared builder (`kits/lizardmen/settle`), with:

| Need | Module | How, here |
|---|---|---|
| the ground | the model baked round the pin (`lzv.py`), `core/drawn`, `core/terrain` `KGROUND` | near 9 x 9 km at 20 m, far 60 km at 500 m (`spec.json` `_pin.build`); layers `ground.savanna.litter`, `ground.dirt`, `ground.tilled`, `ground.ash` (the volcanic soil) |
| the village | `core/city` through `82-lzv-site.js` | one rhombic squared spiral, five windings |
| water | `core/water` | **no lake and no river**: the wells, the great tank (`gl-tank`) and seven cisterns (`lz-cistern`), each a `WATER.still` record |
| the copper | **`kits/resources`** (`KRES.near`) | the diggings on the nodes the resources kit gives within 6 km (`spec.json` `_resolve`) |
| the outwork | `core/hamlet`, the Lizardmen row, focus `mine` | the diggers' camp at the best copper node |
| the economy | `core/region` (`LZ_TUNE`, `checkTown`) | `TU_REC` held to the tune |
| crops | `kits/crops` | ashmillet, sandpan-fonio, bambara-groundnut, frillpod (LIZARDMEN-SURVEY section 4, the Tuatara/Gila list) |

## 2. The site

| | |
|---|---|
| Pin | **5.1 px 818,1554**, **-1,704 m** (the model's cell) |
| Ground | the ground falls **5.3 % to the north-east** at the pin; west of it the savanna rises (-1,300 m 10 km west), east it falls to -2,050 m |
| Air | **1.98 atm** |
| Climate | **XV abyssal savanna**: 29 °C mean (35 warmest month, 24 coolest), **1,020 mm** in one wet season |
| Water | **none perennial within 40 km**. **Neet Gill** (r754, a wadi, 0.7 m³/s, lists Tuatara) 10 km; it ends in a -2,255 m basin. The eastern sea is 54 km off |
| Copper | the survey: copper 32 nodes within 15 km (102 within 30), iron 26, gold 10, tin 10, silver 12, sulfur 11; the volcanic province within 30 km. The geology's placer on Neet Gill (gold high, tin medium) 13.4 km east |
| Neighbours | the Sultanate's **west watch fort 46 km due north** (818,1531) and **south watch fort 52 km east-north-east** (843,1546); Basilisk 135 km; Komodo 157 km; the east reliquary **74 km at 229°** |

## 3. Who lives there

Gila's shares with more Drovers (the savanna's grain) and more warriors (the raiders), fewer Makers and Tenders.

| Caste | Share | People | Dwelling (Gila's holds) | Count |
|---|---|---|---|---|
| 1 Tenders | 22 % | 660 | `lz-warren` (28) | ~24 |
| 2 Makers | 20 % | 600 | `lz-makers` (10), the three craft halls (12 each) | ~56 + 3 halls |
| 3 Drovers | 28 % | 840 | `lz-longhouse` (33) | ~26 |
| 4 Line warriors | 17 % | 510 | `lz-lodge` (30: 18 warriors, 12 Bulwarks) | ~27 |
| 6 Bulwarks | 10 % | 300 | | |
| 5 Interpreters | 3 % | 90 | `lz-tower` (7) | ~13 |

The miners are Makers and Drovers sent to the diggings by the Allotment; the camp's people are counted in the hamlet.

## 4. The layout (`sheets/village.png`)

- **One street, a rhombic squared spiral** (75°/105°, each winding 1.25 times the last): **five windings, 36 → 45 → 56 → 70
  → 88 m deep**, a 46 m nest court; the village about 1 km across.
- **The axis (*proposed*):** `spiral.axis` 15°, so the **mouth opens due north**, toward the Sultanate's forts and the
  raiders' road. The arms then run 63° off the contour; on 5.3 % that is a gentle climb (Gila's spit is 6.7 %). Question 2.
- **The windings by caste**, inner to outer (`pools`, `specials`): the Tenders' warrens with the great tank, the seer's hall,
  the medicine hut and an obelisk; Tenders and the Interpreters' towers; the Makers with the bronze, reed and bone halls and
  the warehouse (the plunder); the Drovers' long houses with **five granaries** (the savanna's grain); the warriors' lodges
  outermost with **three barracks**.
- **Every door faces the nest hall**; brick wells in the blocks' outer halves.
- **The mouth: the mustering ground and the war camp**: `lz-muster`, the Interpreters' tent and the great sail tent, and the
  band's tents (three hide tents, two pole-and-shield tents: `mouth.tents`), a lookout. No banners, drums or signal fires.
- **Seven cisterns** (`lz-cistern`, sunken brick under basalt slabs) on a ring outside the spiral, the mouth's side left
  open: the dry season's water.
- **The ley line** from the nest court south-west, **229°**, to the east reliquary; the ley stone at 58 m.
- **The country:**
  - **fields south** of the village (`fields.dir` south, 0.7-3.3 km out, under 12 % slope): seven farms, three panemone
    windmills, the herds of frilled lizards and burden beasts, the stone circle beyond;
  - **the copper diggings**, five mine heads (`lz-mine`) on the nodes `KRES.near` gives within 6 km (none inside 900 m),
    the diggers' camp on `core/hamlet` (focus `mine`) at the best.

## 5. What it lives on (`TU_REC`, `[G data]`)

| Good | Made (t a year, `LZ_TUNE`) | Where | Its own need (3,000 x the town's diet) | The Allotment |
|---|---|---|---|---|
| grain | 1,000 | the fields south | ~700 | ~300 t out (the capital, the warrens) |
| produce | 250 | the fields | ~250 | |
| meat and hide | 210 | the herds; the bone hall | 210 (the tune's diet for Tuatara: 70 kg each, no fish) | none spare |
| copper | **70** | the five mine heads | none | **all out to Basilisk's bronze hall** (nine to one with Komodo's tin); bronze ware back |
| salt | none | | ~25 | in, from Basilisk's pans and Gila |
| fish | none | | | the tune's diet for Tuatara has none |

`TU_REC.works` must make exactly the tune's goods: grain 1,000, produce 250, meat_hide 210, copper 70 (`LZ_TUNE.checkTown`).

## 6. Pieces and textures

- **No new piece.** Everything is the kit's (`lz-*`, `lc-*`, `59w-lz-works.js`'s `lz-mine` and `lz-cistern`) or Gila's
  (`gl-well`, `gl-tank`, by path: GUIDE.md S0.3).
- **Textures:** none owed; the four ground layers exist in the library.

## 7. Steps

| Step | What | Test | Status |
|---|---|---|---|
| **T0** | this plan, `spec.json`, the sheets | `python3 kits/lizardmen/settle/towns_plan.py tuatara` | done (`9fadd409f`) |
| **T1** | S0 of the guide (once for all towns) | the kit's page and Gila's byte-identical; `test-lizardmen.js` unchanged | done (`3d73b8f57`) |
| **T2** | `TU_REC` and the spec | `LZ_TUNE.checkTown(TU_REC).ok` in a node test with a negative | done (`test-tu-records.js`) |
| **T3** | the page | the guide's section 5, with `expect.keys` lz-nest, lz-ley, lz-muster, gl-tank, lz-cistern, lz-mine | done (GPU-verified; owner review on section 8 pending) |
| **T4** | flora (`biomes/rift`, XV) | later, with the savanna species (Gila's G6) | open |

## 8. Questions for the owner (answers *proposed*)

1. **Tuatara at its pin** (5.3 % slope, no water but wells and cisterns)? *Proposed:* yes.
2. **The mouth north**, toward the forts (the axis turned 63° off the contour)? Or along the contour (the mouth then opens
   north-west)? *Proposed:* north.
3. **The shares** (Tenders 22, Makers 20, Drovers 28, Line warriors 17, Interpreters 3, Bulwarks 10 %)? *Proposed:* yes.
4. **Seven cisterns and a great tank** for the dry season? *Proposed:* yes.
5. **The copper diggings on the resources kit's nodes**, five mine heads within 6 km, the camp on `core/hamlet`? *Proposed:* yes.
6. **Gila's well and tank** taken by path now, moved into the kit when a third town uses them? *Proposed:* yes.
7. **The war camp at the mouth** (five tents of the band's beside the Interpreters' and the sail tent)? *Proposed:* yes.
