# The Lozenge: the Arccube at a quarter height, a rough floor plan

The owner's brief (2026-10-27): **a quarter of the height, farming terraces on the upper facets, a rough floor plan
by the large-building (palace-blueprint) method, and the low population case.** The model is
`kits/ancients/targets/lozenge/89d5-lozenge.js` (with `89d6`-`89d8`; forked from `src/89d-arcube.js`, which stays
Soleri's 1 500 m cube); this folder is its plan. The owner then moved the Rift's ruin to a pile of blocks
(`targets/arcpile`) and kept this as its own type, the Lozenge.

| File | What |
|---|---|
| `sheets/L0.png` … `sheets/L5.png` | one plan cut per level (+12, +70, +150, +198, +260, +330 m), every zone coloured and measured; `L3-ruin`, `L4-ruin` for the ruin |
| `sheets/section-A.png`, `section-B.png` | across the diamond between the wells (through a pier station) and down light well 2 |
| `sheets/section-C-ruin.png` | across the broken corner of the ruin |
| `AREAS.md` | the hectares each cut meets, zone by zone, intact and ruined |
| `lozenge_plan.py` | the generator: the zones are classified from the model's own numbers, so a sheet cannot drift from it |
| `lozenge_population.py` | the population count behind the table below |

## The form

| | Soleri's sheet | the Lozenge |
|---|---|---|
| length (the cube's side) | 1 000 m | 1 000 m |
| width (the diamond) | 1 414 m | 1 414 m |
| height to the deck | 1 500 m | **375 m** (the diamond squashed 4:1, `VS = 0.25`) |
| faces | 45 degrees | **14 degrees** |
| keel over the plain | 86 m | 21 m |
| footprint | 140 ha | 141.4 ha |
| population | 400 000 (2 717 / ha) | **about 170 000** (1 210 / ha), the low case |

The upper faces are **flights of terraces**: 41 to a face, each a riser of 3.66 m (one storey, one row of the
dwelling grid's windows) under a tread of 14.6 m (the field). About 121 ha of plan, roughly 61 ha of it in fields
once the wells, the spine, the courts and the corner piers are taken out. The lower faces step the other way,
storey over storey, their risers looking out over the plain.

## The study: what the precedents teach

- **Habitat 67** (Montreal): a stepped stack where every home has the roof of the one below as its garden. The
  terrace row here is the same idea at a city's scale: a home 14.6 m deep, lit from its riser, roofed by a field.
- **The Ifugao rice terraces** (Banaue): risers of 1-6 m, treads irrigated from the top down. A 14-degree slope gives
  treads 4 times the riser, wide enough for wet fields: the channel along each lip in the model feeds the tread below.
- **Soleri's arcologies** (the Babel and Hexahedron sheets, Arcosanti): the city is zoned by depth, living on the
  skin, work and civic life inward round a void. The front elevation's bands are kept as the deep zones of the plan.
- **Kowloon Walled City**: 33 000 people on 2.6 ha with no light past the first room. The warning: depth without a
  window is not housing. So the count below houses people only where there is daylight.

## How the population was counted

A home needs a window. The homes are:

1. **the face rows**: the one-storey row behind every terrace riser, and behind every lower step that is 40 m or
   more over the plain (nearer the keel the belly is a dim undercroft: works and stores). 125 ha.
2. **the deep lit**: the mass within 10 m of any other open wall: the twelve light wells (their walls are the
   biggest lit surface in the building), the void, the end craters, the courts. 874 ha.
3. **the piers**: 10 m behind their four walls, ground to belly. 188 ha.

That is **1 187 ha of lit floor** (at one storey per 3.66 m). Of it 65% is dwellings (the rest corridors, lifts,
schools, shops), at **45 m2 gross a person**: an Ancient, generous standard.

| case | lit depth | share | m2 / person | intact | ruin (surviving fabric) |
|---|---|---|---|---|---|
| **low (chosen)** | 10 m, one face row | 65% | 45 | **171 000** | **159 000** |
| mid | 20 m, one face row | 70% | 30 | 523 000 | 484 000 |
| high | 30 m, two face rows | 75% | 20 | 1 245 000 | 1 148 000 |

The ruin loses the south-east bite (the broken corner along the whole south vertex line), the spall, the pier that
failed and the fallen tower; its fracture counts as a new lit wall. That is **capacity in the surviving fabric, not
the survivors**: the Tungangs and the Loj Nahn are a later task, and this figure (about 1 100 ha of lit floor in the
ruin) is the ceiling for it.

Everything deeper than the lit zone, about 4 600 ha if every storey were floored, is the unlit city: works, stores,
plant, cisterns, lamp-lit farms, and the cultural centre and city centre bands round the void. The low case
puts about 270 m2 of it behind every resident.

The table is `lozenge_population.py` (`python3 lozenge_population.py`): the face rows on a 2 m plan grid, the deep
lit floor on 5 m voxels by Euclidean distance to open air. The sheets are `lozenge_plan.py`.

## What is owed

- A **terraced-field texture** for the treads (`ground.terrace.field` in `core/materials/PROMPTS-NEEDED.md`): the
  treads are the concrete map tinted to earth under coloured crop beds until it comes.
