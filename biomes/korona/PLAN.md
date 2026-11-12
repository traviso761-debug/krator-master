# biomes/korona: plan

The kit's design is `NOTES.md` (the corona country under the giant, the six stations, the life and the rule). This file holds what the
final rebuild did to it and what it left (`HANDOFF-REBUILD.md`, pair 9; `BACKPORT.md`).

## Core adoption (the final rebuild, pair 9, 2026-11-03)

Six pages, one kit: `dist/korona.html` (station 1, the tepui) and `--station hollow | basin | trench | gorge | hoar`. Every change below is in
`src/` (no station overrides the fragments named here, so all six take it), each look change behind a switch for the owner's look pass.

**The universal set (`BACKPORT.md` section 1):**

| Group | Taken | Where | Switch |
|---|---|---|---|
| Limb joints | `BIO.flareJoin` on the coin tree's limbs (the lace fan has no limbs: its fans ride its bole) | `55`, `31j` in `CORE_BIOME` | none (no draws moved) |
| Graphics | octahedral impostors for the far lace fans; the coin tree (2.5-6 m) keeps its blobs, under the 7 m the stand-ins start at | `55`, `34` | `?diet=0` |
| Cards | the 15 sheets the kit cuts by its own UVs (`cellUV`) marked `"sheet": "geometry"`: `check_cells` 0 faults, its baseline's 15 WHOLE SHEET rows gone | `materials.json` | none |
| Sky and air | height fog (R1) with a mist over the lowest water, the rain cover (R10), lightning with the weather, the wind on the foliage (R8), A2C (R7) | `89a`, `89z` | `?hfog=0` |
| Water | the stream's glint broken up (ext/56), the audit (57) and the shore's fields (60) on the page; no surf or breakers anywhere (every water here is still) | `89w`, `89z` | `?fields=0` |
| Reflections | `WATER.mirrorSwitch` on the station's lake, **off at load**: the basin's Tiers' lake and the trenches' salt lake (its two arms at one level) are their own mesh now; the other stations have no still over 400 m and take none | `89w`, `98z` | the panel's button, `?mirror=probe` / `live` |
| Shadows | `KSHADOW` on every page, **off by default** (the owner, 2026-11-03): `?shadow=1` turns it on | `89z` | `?shadow=1` |
| Ground | `KGROUND` for the floor's second to fourth layers (the base layer stays dithered as judged); `KFAR` past the map to 9 km from the station's own floor function; `KHORIZON` over the square and the far field, on the floor and, after the bake, every lit material | `47`, `85`, `89z` | `?kground=0`, `?far=0`, `?hz=0` |
| Export | rides with the merge | | |
| `KHOOK.warp` | not taken: no anomaly at Korona (the slot is empty until `core/anomaly`) | | |

**Korona's row (`BACKPORT.md` section 2 and 5):**

- **Strata (the tepui sandstone): taken.** `KSTRATA`'s `tepui` recipe on every wall (one stack a station, the beds' mean as the tint's
  pivot, half strength over the bodies' own banding): `47`, `?strata=0`. The 5.1 geology rebake agrees (`kits/resources/ROCK-PROPOSAL.md`:
  73% of the region is now `quartzite`, which the kit draws; checked against the rebake's table, 2026-11-03).
- **`KSTACKS.contour` and `KSTACKS.weather` (section 5): taken** on every body: joints down the tables' and buttes' walls with no
  profile change (their rims stay where the records put them: carvings, icefalls and wall plants read the records), profiles on the
  stacks and spires; two grains of weathering. `?contour=0`, `?weather=0`.
- **Talus, tor, dome: not taken.** The talus is the kit's own (`STAGE.talusH`, the source the core's talus was written from); no station
  has a tor or a dome on its survey.
- **Ground shader `polygon` (the hoar table): not taken.** The hoar table's pavement is a KSTACKS top (`MAT_TOP`), not the floor KGROUND
  hooks; a polygon layer there wants KGROUND on the top's material, a second hook. Owed to the hoar's next pass.
- **Fog belt on the tepuis: taken.** `ATMOS.fogBelt` on the highest body's windward (north-west) walls, a third of the way up to its top;
  the hoar table's on its lower wall only (the cloud sea it stands over); none in the dry lee gorge. `STAGE.belt` overrides; `?belt=0`.
- **Ice on the hoar table's pools: already** (the frozen tarn is a plate of ice, `pools[].ice`).
- **Reach for the ecotones, seasons: not taken.** The ecotones read their kits in place (nwlowlands, nhighlands, sedesert, ehighlands) as
  before; Korona's tropics have no season the plan names.
- **The punji pit: already** (`core/hazard`).
- **Cave mouths (KCARVE) in the trenches, and karst site 7: not taken.** `biomes/KARST-SITES-5.1.md` site 7 (the west trench rims:
  gypsum dolines, a salt-shore spring) says to place it "when Korona's stations have 5.1 px", and they have none yet (`STATIONS-MAP-5.1.md`:
  within 100 m and class unchanged, not re-surveyed). Owed to the trenches' re-survey.

**Fixed on the way:** the necanyons kit, read in place, hangs its seep curtains and ferns at a bed's outline, but KSTACKS draws the lip
at the cap's overhang (`footR x (1 - ch)`), which on a tepui's caps is 6-30 m in: station 1's attach audit failed at 1.7%. `89z` pulls each
in along its bed's radius to .35 m off the drawn lip (positions only; `?seat=0`). The necanyons page keeps its own placement (its caps' `ch`
is small); the fix in its `57` is owed to its next turn, since 9 build commands and 38 pages read it.

**Exchanges (`EXCHANGES.md`):**
- As vendor: `KORONA.plant(key, x, y, z, {lv, seed, id})` grows one `frosttank`, `butterwort`, `cobralily` or `greatsundew` with the kit's
  own builder for a reader (ebadlands' melt pools, nwouterwall's bog, nhighlands' seeps, the crater drylands' seeps). Nothing here calls it.
  `wallfern` and `bladderpool` are placed by the kit's passes against the wall and the pools, not one at a time: owed.
- As receiver: none taken this turn. The bristlecone (ebadlands, on the hoar table) wants ebadlands' species and trees read in place on a
  station that already reads ehighlands; the caribou moss (nwouterwall) and the ghost gum (crater drylands) wait on their vendors' turns;
  the sea buckthorn (nsemiarid) waits on the nsemiarid turn running beside this one.

**Species for readers:** no other build reads Korona's species (`tools/reach.py`). Keys and indices unchanged (`KORONA.SPECIES` 0 coin tree,
1 lace fan; `KORONA.PLANTS` as before). The coin tree's limbs are flared at the trunk; the far lace fans are impostors.

**For the owner's eye:** the tepui's beds (KSTRATA's tepui over the kit's own banding: two banding systems, the kit's per tier and the
recipe's per bed), the fog belt's height, the far field (the station's floor function carried 9 km with no tables on it), KGROUND's floor
against the dithered one (`?kground=0`), the shadows (`?shadow=1`).

## Amendment 2026-11-12: the pancake domes round the corona (the owner, 2026-11-12)

The owner decided on pancake domes round Korona. This section revises one line above: "Talus, tor, dome: not taken ... no
station has a tor or a dome on its survey" was true of the survey as it stood; the domes now exist on the model (5.1 edit 2,
`tools/scale-model/edit_512.py`), and station 7 below proposes the first page with one. The Firebliss Range takes the same
landform round its patera (`biomes/firebliss/PLAN.md` section 1c); the physics shared by both is written there, and only
Korona's own is repeated here.

### The model, and why Korona

**Venus's pancake domes** are steep-sided, flat-topped domes of very stiff lava: commonly about 25 km across, some over 30
(one by Aine Corona is about 35 km), the steep-sided class commonly put at a few hundred metres to about a kilometre high.
**On Venus they cluster round coronae:** inside the annulus of a corona's fractures and on the plains just outside it. Korona
is Krator's corona (`LORE.md` 3.1, `NOTES.md`), so it is where Krator should have them.

Venus's 90-bar air keeps gas in the magma so it oozes instead of exploding. Korona's trenches stand at 1.6-2.1 atm, the
densest air on the map outside the abyss, but that is still far too thin to do Venus's work. The plan does not claim it. A
Korona dome is **degassed magma**, risen slowly, with a pumice apron from its explosive start (Chaitén's and Cordón Caulle's
way).

### Korona's heat source, and where the rhyolite comes from

- **The heat:** the corona's **mantle plume is still active** (the owner, 2026-10-26; `NOTES.md`, "The plume is active"). It
  heats the ring faults, which carry geyser fields, hot springs and fumaroles "in the trenches and the moat, where the faults
  reach deepest". That is the long-lived basalt heat source the domes need (bimodal volcanism, as at Yellowstone).
- **The crust it melts:** 73% of Korona is quartzite on the 5.1 geology (`kits/resources/ROCK-PROPOSAL.md`): the tepui
  sandstone. Quartz alone melts at about 1,700 C, far too hot for a crustal melt. The rhyolite comes from **the basement
  under the sandstone**, a granite and gneiss shield as under Roraima's sandstone on Earth (the Guiana Shield), melted at its
  wet granite minimum (650-750 C) by the plume's basalt ponded under it. *Proposed:* the geology bake does not model a
  basement; the plan adds none to the model, only to the lore.
- **Where it comes up:** where the ring faults cut down through the sandstone cover. That is in **the trenches and the outer
  moat**, not on the ring crests, which are the cover itself. So the domes stand on the trench floors, black tables among
  the salt lakes and the jungle.
- **Why not at the centre:** the corona's middle is the plume's top, where basalt rises (the main trench's lake). Bimodal
  fields ring their basalt at a distance, as Yellowstone's rhyolite rings its plume. The domes stand 100-220 km out.

### The five domes (`edit_512.py`; the names are working names)

Each is flat on top to about 70% of its radius, then one or two cells of wall. Corona centre: 5.1 px 1086,519 (`NOTES.md`'s
814,189 on the old canvas). Pressure by the model's 1.6 e^(-h/8 km). Old-canvas px (5.1 less 272, 330) for the station sites.

| Dome | 5.1 px (old) | Across | Ground | Top | Height | From the centre | Ground's climate and air | What it is |
|---|---|---|---|---|---|---|---|---|
| **1, NW trench** | 1007,490 (735,160) | 14 km | -1,492 m | -892 m | 600 m | 168 km | XA (hypertropic jungle), 1.93 atm; a salt lake within 12 km | the glass table in the jungle: obsidian cliffs streaming with vines, carnivores on its poor glass soil (station 7) |
| **2, NE trench** | 1131,494 (859,164) | 12 km | -901 m | -379 m | 522 m | 103 km | Aw, 1.79 atm | between the inner rings, beside the tepui station's table |
| **3, S trench** | 1038,581 (766,251) | 16 km | -852 m | -202 m | 650 m | 157 km | BSh, 1.78 atm | a dry table in a lee gorge, the gorge station's country |
| **4, SE moat** | 1179,578 (907,248) | 16 km | -103 m | 547 m | 650 m | 220 km | BSh, 1.62 atm; about 30 km west of the Tsēk-Gèl | the outer moat, inside The Tiers and the Coyote Kingdom's polygon: the one dome on a polity's ground |
| **5, N trench** | 1071,430 (799,100) | 14 km | -297 m | 303 m | 600 m | 180 km | BWh, 1.66 atm | a black table on a desert trench floor |

12-16 km across and 520-650 m high: larger than Firebliss's (8-14 km) because the plume is larger than the patera, smaller
than Venus's. On the model they move 189 height cells, every one inside the Korona polygon, and none touches water or a
river (the script asserts it). Domes 1 and 3 dam a few upslope cells (24 to 34 and 34 to 44 pit cells): dome-dammed ponds,
as on Earth.

### What a dome means for the kit's rule

**Carnivory follows poor soil** (the brief). A rhyolite dome weathers to the poorest ground in Korona: glass, pumice and
acid grit, holding no nutrient and draining fast. So **a dome's top is a carnivore garden**: the pitcher and the sundew
lawns on the pumice, the frost tanks absent (too warm). The `poor` field reads glass as the poorest rock there is. The
dome walls are bare glass; the aprons are pumice slopes with the nutrient-hungry traps in their wet hollows.

**The tribes:** obsidian is the blade and the mirror of the tepui tribes (the Hum's word for it is the owner's to make:
*proposed* none). The glass walls take the contour carvings cleanly: a carving cut in obsidian is a dark groove that shines.
A dome is a landmark the Hum's road-marks can be read against from across a trench.

### Station 7: the glass table (proposed)

| | |
|---|---|
| Where | **dome 1, the NW trench**, 5.1 px 1007,490 (old 735,160): the table's top at -892 m and its wall over the trench floor at -1,492 m |
| What | a black obsidian table 14 km across standing out of the hypertropic jungle (XA, 1.93 atm): its 600 m glass wall with vines and seep lines down it, a pumice apron with the traps in its wet hollows, the top a poor-soil carnivore garden with melt and rain pools, the salt lake below to the south-west; the hot springs of a ring fault at its foot (the geyser kit's `corona` station read in place) |
| Built on | station 1's host and `47`; a dome is a KSTACKS body with a flat top and a vertical wall (the tepui's machinery: a table is a table), its rock the `rhyolite` recipe (`biomes/firebliss/PLAN.md` 8, item 9) instead of `tepui` |
| Alternatives | dome 5 (N trench, BWh): a dry table, the glass in the desert's light; dome 2 beside the tepui station |

### Core adoption (for station 7)

| Need | Module | How |
|---|---|---|
| the table | `KSTACKS` (37) | one body, a flat top, a wall, `contour` for the flow banding's joints; `KSTRATA` with the proposed `rhyolite` recipe (flow-banded glass, a pumice skin) |
| the apron | `KRELIEF` (38), `KGROUND` (43) | a pumice talus apron, its wet hollows as a ground layer |
| the hot springs | `core/water` (`spring`, `geyser`) and the geyser kit's `corona` station | read in place |
| the hazards | `core/hazard` | `fall` on the glass walls, `heat` at the springs, `gas` in the trench's hollows, the traps as before; glass edges as `thorn` (cuts) |
| sky, weather | `core/atmos` | as station 1: the standard sky, height fog, the rain cover |
| everything else | as the kit's other stations | |

**New in core:** nothing beyond what Firebliss proposes (the `rhyolite` strata recipe; the obsidian resource node). The
`poor` field needs glass as a rock kind (`kits/resources` provinces): a one-line addition when the node lands.

### Textures

`stone.obsidian`, `ground.obsidian`, `stone.pumice`; the gap `rock.rhyolite.flowbanded` is entered once, by Firebliss
(`core/materials/PROMPTS-NEEDED.md`).

### Ideas set aside

- **Domes on the ring crests:** the crests are the sandstone cover; the melt comes up where the cover is cut (the trenches).
- **Domes at the centre:** the plume's top is basalt's; rhyolite rings it at a distance.
- **Domes in the high cold country** (the hoar table's): no heat reaches the cover there.
- **Venus's sizes (25-35 km):** a 30 km dome would bury a whole trench floor and its lake; 12-16 km keeps each trench.
- **Pressure as the reason they ooze:** 1.6-2.1 atm is not Venus's 90 bars (above).

### Order of work

1. The model edit (done: 5.1 edit 2).
2. The `rhyolite` recipe and the obsidian node (with Firebliss).
3. Station 7, the glass table, after the trenches' re-survey (karst site 7 and the cave mouths wait on it too).

### Questions for the owner

- **The domes' age:** all cold (default), or one young and steaming over a fault's hot springs?
- **Station 7:** dome 1 in the jungle (default), or dome 5 in the desert?
- **Dome 4 and the Coyote Kingdom:** it stands on the Kingdom's ground (and The Tiers'). Is it theirs, a quarry, a stronghold, a holy hill?
- **The basement:** canon that a granite shield lies under the tepui sandstone, melted by the plume (proposed)?
- **Names:** the domes' names in the Hum, and the Hum's word for obsidian.
- **LORE.md** (proposed sentences, not written there): *"Round Korona's corona, on the floors of its trenches, stand the
  black tables: domes of glass-skinned rhyolite, 12-16 km across and 500-650 m high, risen where the ring faults cut
  through the tepui sandstone to the granite the plume has melted beneath it. Their tops are the poorest ground in Korona, so
  the carnivores rule them, and their glass gives the tepui tribes their blades and mirrors."*
