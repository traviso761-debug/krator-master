# biomes/savannarim: the savannah rims (plan)

The plan is `biomes/hyperjungle/PLAN-LANDS.md` (sections 1, 4, 5, 9 to 13): one kit holds the savannah's base for the three
savannahs (hyperjungle N's abyssal savannah, the e rim, the se rim), each land re-tinting and re-weighting it. This file holds what
the working rules ask a new build to write first, its core adoption, and the kit's own order.

## Core adoption (written first, as the working rules ask; PLAN-LANDS.md section 12)

Started from the nearest finished kit, **crater-drylands** (its `build.py`: the core list, the station pattern with `station.json`,
the full core/host interface), and for the host fragments from the **hyperjungle's savanna station** (the nearest finished savannah:
its stage, river, burn mosaic and mounds).

| Module | Taken | Where |
|---|---|---|
| core/biome (`CORE_BIOME`) | 10, 20, 30, 31b, 31j, 32 (kin), 33 (fung, for the hyperjungle read in place), 34, **38 KFIRE (H3)**, **39 the lean (H4)**, 40 (reach), 41, 42-44; **30s the copper flush (H7)** on station 1 (J6) | `build.py`, `station.json` |
| core/rand | every placement a `KRAND.hash(world, i, j, salt)` lattice cell; the builders' numbers from `KRAND.hash(seed, k, salt)` | 55, 60, 87 |
| core/mask | no canvas read for placement (the ground's paint is drawn, never read back) | 45 |
| core/tags | `BIO.init({tags:'savannarim'})`; every tree, grove and landform `REGISTER`ed before the bake draws it | 87 |
| core/space | the river's spans, the land's keep-clear (`KSPACE`) | 45, 87 |
| core/terrain | 37 **KSTACKS.mounds (H10)**, 43 KGROUND, 44 KFAR, 45 KHORIZON | 45, 83, 87 |
| core/water | the river (`WATER.flow`), wet ground and hollows | 89w, 89a |
| core/atmos | the shared sky at the land's place, the wind, the weather, height fog, rain cover | 89, 89a |
| core/clock | **the season (H7)**: `BIO.bindSeason` (the grass bleaches, the monsoon kapoks drop); the flush (`21-core-clock-flush`) on station 1 (J6) | 99 |
| core/host | `khost.FULL` (the whole interface) | `build.py` |
| core/materials | `materials.json`, `tools/textures/pack.py` -> `tex/` | 50, 45, 87 |
| the neighbours | read in place, never copied: the hyperjungle (41, 50, 52, 54-57, 60), and per station eastabyss, ehighlands, sedesert, crater-drylands (`build.py` NEIGH) | `build.py` |

`tools/check_core_use.py biomes/savannarim` passes.

## Order (PLAN-LANDS.md section 13)

| Step | What | Page |
|---|---|---|
| J4 (2026-11-08) | the base (red oat grass, blind grass, fan palm, umbrella thorn; gallery forest, kapok and baobab outliers read in place; KFIRE, mounds, seasons) and the north savannah | `dist/savannarim-north.html` (`--station north`); `dist/savannarim.html` the base on the se rim's map |
| J5 | the e rim (H4 lands here) | `dist/savannarim-east.html` (`--station east`) |
| J6 | the se rim (the rust miombo defined here, read by Godstep's redlands; the red guyed stalk Godstep's) | `dist/savannarim.html` |
