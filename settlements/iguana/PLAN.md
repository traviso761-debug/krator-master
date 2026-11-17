# Iguana, the Lizardmen's granary town on the Pile's plateau: a site plan (proposal, 2026-11-17)

The owner, 2026-11-16, of the town by the Pile: *"on some prime farmland nearby"*; 2026-11-17: *"the cube plateau village
will be called iguana"*, *"don't have to build them all yet"*. **How to build it is `kits/lizardmen/settle/GUIDE.md`**; this
file is what to build. Everything here is *proposed* unless it is the owner's or the tune's; the questions are in section 8.

What is settled:
- **Iguana** (the owner's name, 2026-11-17; "Basilisk" in the proposal of 2026-11-16) is **the capital's granary on the
  Pile's plateau**, ~3,000 people. **It has no pin yet**: *proposed* **5.1 px 713,1569** (`PLAN-LIZARDMEN.md`, owed to the
  scale-model queue).
- In `LZ_TUNE` it makes a year **grain 2,600 t, produce 250 t, meat and hide 210 t, relics 1.5 t** (gleaned from the Pile's
  lower levels); its relics go to **the east reliquary**.
- **The Pile** (Cube) is 14.6 km east, its upper levels held by the Tungangs of **Loj Nahn** (~1,000), whom the Lizardmen
  surround but have never pressed (`LORE.md` 6.1, 6.20).

Files: `spec.json`, `sheets/country.png`, `sheets/village.png` (made by `kits/lizardmen/settle/towns_plan.py`).

## 1. Core adoption

As Gila's, on the shared builder (`kits/lizardmen/settle`), with:

| Need | Module | How, here |
|---|---|---|
| the ground | the model baked round the pin, `core/drawn`, `KGROUND` | near 10 x 10 km at 20 m (the fields reach 4.4 km), far 60 km; layers `ground.grass.lush`, `ground.dirt`, `ground.tilled`, `ground.terrace.field` |
| the village | `core/city` through `82-lzv-site.js` | one rhombic squared spiral, five windings, wide and open |
| water | `core/water` | the wells and the great tank (`WATER.still`); **Muckle Weyt Beck** (r202, perennial, 22 m³/s) 5.4 km off as `WATER.flow` if the near grid holds it |
| the outwork | `core/hamlet`, Lizardmen row, focus `farming` | a farming hamlet 3.3 km west-south-west |
| the economy | `core/region` (`LZ_TUNE`, `checkTown`) | `IG_REC` held to the tune |
| crops | `kits/crops` | rice, helix-bean, sweet-potato, ashroot (the survey's Cube-plateau list) |

## 2. The site

| | |
|---|---|
| Pin | **5.1 px 713,1569** (*proposed*; no pin on the model), **-373 m** |
| Ground | **flat: 0.3 %**, the plateau's prime farmland; it rises gently east toward the Pile and west |
| Air | **1.68 atm** (the model's 1.6 e^(-h/8,000)) |
| Climate | the model's class at the pin is **Af, tropical rainforest** (the Pile's own cell is Cfa): **23 °C**, **1,992 mm** |
| Water | **Muckle Weyt Beck** (r202, perennial, 22.0 m³/s) **5.4 km**; the western terminal sea 28 km west |
| Neighbours | **the Pile 14.6 km east (74°)**; Basilisk 121 km; Gila 207 km; the east reliquary **155 km at 97°** |

## 3. Who lives there

A farming town: the most Drovers of any.

| Caste | Share | People | Dwelling | Count |
|---|---|---|---|---|
| 1 Tenders | 22 % | 660 | `lz-warren` (28) | ~24 |
| 2 Makers | 15 % | 450 | `lz-makers` (10), three craft halls | ~41 + 3 halls |
| 3 Drovers | 40 % | 1,200 | `lz-longhouse` (33) | ~36 |
| 4 Line warriors | 10 % | 300 | `lz-lodge` (30) | ~20 |
| 6 Bulwarks | 10 % | 300 | | |
| 5 Interpreters | 3 % | 90 | `lz-tower` (7) | ~13 |

## 4. The layout (`sheets/village.png`, `sheets/country.png`)

- **One rhombic squared spiral**, wide and open among the fields: five windings **44 → 55 → 69 → 86 → 107 m** (Gila's 36,
  widened), a 52 m court; about 1.2 km across.
- **The axis (*proposed*):** 105°, so the **mouth opens due east, toward the Pile** (the ground is flat, so the axis is free).
- **The windings:** Tenders with the tank, seer, medicine hut, obelisk; Tenders and towers; the Makers and the three halls and
  **the relic warehouse** (what the gleaners bring from the Pile, sorted along a spiral); the Drovers' long houses; the last
  winding more long houses and the lodges, **one barracks**.
- **The Great Granary**, after Mohenjo-daro's: **27 granary halls** (`lz-granary`, ~100 t each: the capital's 2,600 t) laid as
  a small squared spiral **1.25 km west** of the court, between the town and its fields.
- **The watch on Loj Nahn**: the mustering ground at the mouth, east; **three lookouts** (`lz-lookout`) on the way to the Pile
  at 2.6, 3.7 and 4.7 km (inside the near grid). The Lizardmen watch Loj Nahn; they do not press it.
- **The ley line** from the court **east, 97°**, toward the east reliquary, past the Pile on its south.
- **The fields west**, beyond the Great Granary: 1.5-4.6 km out, 29 rows across (under 10 % slope): eleven farms, **seven
  windmills**, the herds, the stone circle; a farming hamlet on `core/hamlet` 3.3 km west-south-west.

## 5. What it lives on (`IG_REC`, `[G data]`)

| Good | Made (t, `LZ_TUNE`) | Where | Its own need (its diet) | The Allotment |
|---|---|---|---|---|
| grain | **2,600** | the fields west | ~700 | **~1,900 t out**: the capital's grain, and Gila's dry years |
| produce | 250 | the fields | ~250 | |
| meat and hide | 210 | the herds | ~210 | |
| relics | **1.5** | the gleaners in the Pile's lower levels | | to **the east reliquary** |
| salt, bronze | none | | ~25, ~6 | in: Gila's salt, Basilisk's bronze |

`IG_REC.works` must make exactly grain 2,600, produce 250, meat_hide 210, relics 1.5 (`LZ_TUNE.checkTown`).

## 6. Pieces and textures

- **No new piece**; Gila's `gl-well` and `gl-tank` by path.
- **Textures:** none owed.

## 7. Steps

| Step | What | Test |
|---|---|---|
| **I0** | this plan, `spec.json`, the sheets | `python3 kits/lizardmen/settle/towns_plan.py iguana` |
| I1 | **the pin**: ask the scale-model queue for `iguana` at 713,1569 (`PLAN-LIZARDMEN.md`); the page can be built before it lands (`lzv.build` takes the pixel) | |
| I2 | `IG_REC` and the spec | `checkTown` with a negative |
| I3 | the page | the guide's section 5; `expect.keys` lz-nest, lz-ley, lz-muster, gl-tank, lz-granary, lz-lookout, lz-windmill |
| I4 | flora | later |

## 8. Questions for the owner (answers *proposed*)

1. **Iguana at 713,1569**, the flat farmland 14.6 km west of the Pile? *Proposed:* yes.
2. **The mouth east, toward the Pile**, with three lookouts: the watch on Loj Nahn? *Proposed:* yes.
3. **The Great Granary**: 27 halls in a squared spiral, after Mohenjo-daro's? *Proposed:* yes.
4. **The shares** (Drovers 40 %)? *Proposed:* yes.
5. **The gleaners**: do Iguana's Lizardmen go into the Pile's lower levels for relics (the tune's 1.5 t), and does Loj Nahn
   know? *Proposed:* yes, at night, and Loj Nahn hears them below.
