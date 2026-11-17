# Gila, the Lizardmen's salt village on its lake: a site plan (proposal, 2026-11-16)

The owner, 2026-11-16: *"also session to plan and build ... a lizardman village"*.

What is settled, from the owner and the lore:
- **The Lizardmen** (`LORE.md` 6.20; `kits/lizardmen/DESIGN.md`, agreed 2026-10-15/16): the alien reptilian people of the
  deep Rift floor. They never trade or treat, take no captives, build in squared spirals with walls that lean wrong and
  triangular doors sized by caste, use bronze and never iron, and keep no warlord: the Interpreters act in concert.
- **Gila** is one of the four villages the lore names (old canvas 381,1155; **5.1 px 653,1485**, pin `sze26pgivd`).
- **Its size:** "the regional villages 3k" (the owner, 2026-11-16, `core/simulation/PROPOSAL-LIZARDMEN.md` question 1).
- **Its economy:** autarkic, no money, a command economy run by the Interpreters (the Allotment), goods moved along the
  Coil Rounds; Gila's evaporites and Sauropolis's sea pans are the country's two salt sources (the owner endorsed both,
  PROPOSAL-LIZARDMEN questions 4-6). **One reliquary per cluster:** the west's is "by Gila's lake" (question 3).
- The West Rift scope (`core/region/WEST-RIFT-SCOPE.md`): the Lizardmen are the barrier between the rifts, "barely any
  trade"; the West's strongest halite (205-254) lies inside their country, at Gila's lake.

Everything else here is *proposed*. The owner's questions are in section 8.

Sources:
- `kits/lizardmen` (`README.md`, `API.md`, `DESIGN.md`, `KNOWN_ISSUES.md`): the buildings.
- `core/simulation/PROPOSAL-LIZARDMEN.md` and `core/simulation/LIZARDMEN-SURVEY.md` (2026-11-16): the sites, the
  Allotment, the Coil Rounds, the resources.
- The scale model 5.1, `tools/scale-model/model/data`:
  - `h.png`: height = (R·256+G)/65535·29,600 − 2,600 m, B > 127 water;
  - `tm.png` (mean °C + 90), `p.png` (byte/255 · 4,000 mm), `c.png` (the classes of `climate.json`);
  - `rivers.json`, `basins.json`;
  - 2 km a pixel.
- `kits/resources/data/geology.json`, `kits/crops`.

## 1. Core adoption

| Need | Module | How |
|---|---|---|
| the ground at 1:1 | the scale model through the page's own bake (as Thalaba's `gen/69u-tb-ground.js`); `core/world` when the Lizardmen's country is cut as an open-world region | `build.py` bakes the model's heights bicubic round the pin into `gen/69g-gl-ground.js` (a near grid at 20 m, a far grid at 500 m); the page draws the near grid as a PlaneGeometry and `terrainH` reads **the drawn triangles** (`core/drawn`'s split), so placement and the eye agree. No open-world region holds the Lizardmen yet: when one is cut (`tools/scale-model/cut_site.py`), Gila moves onto `core/world`'s `WORLD.H` and this bake retires |
| the drawn ground | `core/drawn` (`KDRAWN`) | the near grid registered (`KDRAWN.add(KDRAWN.grid(...))`): the eye check and the audits read what is drawn |
| the ground's surface | `core/terrain` `KGROUND` (`43-core-ground.js`) | four library layers from Gila's own pack (`materials.json`: savanna litter, salt crust, tilled field, beaten yard), blended by per-vertex weights from the plan's records (the streets and yards, the fields, the salt flats); `relief` on |
| the village (3,000 people) | **`core/city`** (`KCITY`, sealed in one closure as Thalaba seals it) | over 500 people, so `core/city`, not `core/hamlet`. The village's own steps on a `KCITY.create` instance (as Thalaba's): the raster, **one squared-spiral street** (`SL.addWay`) and the ley line; the blocks between the spiral's arms fronted by `KCITY.courts.edgeRun` and placed by `KCITY.courts.place` (core/city's own primitives: overlap, the street raster, the foot on the ground). **No new street generator in core/city** (the kit's `KNOWN_ISSUES.md`: "agreed with that workstream first"): the spiral's steps live in `src/89g-gl-site.js` and are offered to the city-layout workstream as `KCITY.leiwen` once the owner agrees (section 8, question 4) |
| the outworks under 500 (the salt-works camp) | `core/hamlet`, a **Lizardmen row** (`core/hamlet/lizardmen/23-hamlet-lizardmen.js`, opt-in as the Fellgang row is, passed by name until the all-builds rebuild) | the row (castes as households, the works by focus: salt, farming, fishing, ranch, mine, quarry) is written and tested here (G2); the page lays the salt works by its own records first and moves them onto `KHAMLET.village` with the row at G5 |
| water | **`core/water`** | **the lake**: `WATER.open` at −1,723 m with its bed (a calm salt lake, no swell); **the wells and the great tank**: `WATER.still` (one record each, drawn together); the salt pans' brine: `WATER.still` per pan |
| the buildings | `kits/lizardmen`, read in place (the kit's build with `--settlement`: its src, the engine `core/engine`, its pack and furniture) | every dwelling, hall, monument and the reliquary is a kit def. **Pieces the kit lacks**, built as Gila's own (`src/66-gl-works.js`, prefix `gl`, on the kit's toolkit `lz*`): the brick well, the great tank, the salt pans and the salt store (section 6). Asked of the kit later: the mine head, the fishing weir, the bake house (its `KNOWN_ISSUES.md`) |
| placement, records | `core/rand` (`KRAND`), `core/tags` (`KTAGS`), `core/space` (through the city bundle) | every lot from core/city's streams (`KRAND.cell` per block); the outworks by `KRAND.hash` of (world, cell, index, salt); every placed thing registered in core/tags before it is drawn (the engine's `place()`) |
| doors, walk, furniture | `core/door`, `core/walk`, `core/furnish` | as the kit's page takes them (the caste doors open with E; F walks) |
| sky, light | `core/atmos` (the placeholder sky `KratorSky`, `ATMOS.skylight`), `core/clock` | as the kit; the haze of 1.96 atm air thicker than the Vale's |
| host, tools | `core/host` | the inspector, the polygon tool, the walk, the views |
| crops | `kits/crops` | the fields' crops by name from its records: frillpod, ballmelon (`home: rift`), ashmillet; **lakecake** skimmed from the salt lake (`needs: salt`, aquatic). The kit's farm piece draws placeholder crops (its `KNOWN_ISSUES.md`) |
| the economy | `core/region` (later: `LZ_TUNE`, PROPOSAL-LIZARDMEN step Z0, the sim session's) | Gila's records as plain data (`src/88-gl-records.js`, `[G data]`): the census by caste, the works and their yields, the season's need, what the Allotment sends and takes. `LZ_TUNE` reads them when Z0 is built |
| people and time | `core/simulation`, `core/sched`, `core/charactermodels` | not yet: the castes have no figures (the kit's `KNOWN_ISSUES.md`), the Lizardman head and tail mods are a spike. The census is data; the walkers come with the figures |
| flora | `core/biome`, `biomes/rift` (XV, the abyssal savanna) | not yet (step G6): the floor's savanna species on the biome core, as Thalaba takes Xanadu's. The page's ground is bare savanna litter until then, and says so |
| ruins | `core/ruins` | not taken: nothing at Gila is ruined (the reliquary's breach was repaired: DESIGN.md) |
| export, LOD | `core/export`, `core/lod` | as the kit's page: not yet (the engine kits take neither) |

## 2. The site

**px 653,1485**, at the south tip of a ridge spit between two bays of Gila's salt lake.

| | |
|---|---|
| Ground | **−1,614 m** at the pin (the model's cell −1,613); the drawn ground falls east to the lake, **6.7 %** over the village's 900 m (84 m of relief) |
| Air | **1.96 atm** (the model's 1.6 e^(−h/8,000)) |
| Climate | **XV** abyssal savanna: mean **29 °C** (35 warmest month, 24 coolest; extremes 40/18), **1,051 mm** in one wet season |
| The lake | **Gila's lake**, basins.json "salt lake" at 648.5,1483.7: **2,304 km²** at **−1,723 m** (spill −1,587 m). The shore is **1.7 km east** and **3.6 km south** of the pin; the pin stands **110 m above** the water |
| The spit | runs north from the pin, its crest at −1,350 to −1,550 m, 4 km wide, the lake's west arm on one side and its north-east lobe on the other; flatter up the crest (3-4 % at 3 km north-west) |
| Rivers | **Brant Beck** (r215, perennial, 20 m³/s) enters the north-east lobe at 654.5,1474, **22 km north**; Muckle Tkyoob Beck (r866, 52 m³/s) enters the west salt lake (−1,752 m) 31 km north-west. Nothing perennial on the spit |
| Evaporites | the country's only ones (geology.json at the pin): gypsum 215, halite 205, potash 140, alkali 129, saltpetre 40, limestone 134. **Good rock salt 14 km west** (646,1484). No copper, tin or gold within 30 km; low-grade iron only |
| Farming | the survey's 30 km: 94 farm-equivalent km²; crops that fit: ashmillet, Bambara groundnut, sandpan fonio, frillpod, ballmelon, bell-date; fish 168 |

**Its neighbours** (straight lines): **The Tubes** 153 km SSW (the western cluster's other place, ~1,000 Lizardmen in the
Rift line's ruined cavern); the Pile 212 km SE; Sauropolis 315 km SE. Outside the country: Cthonos (ruin) 257 km, Xanadu's
West watch fort 275 km, Erehwon 310 km; Nulab and Blakhed (the West Rift) 250-270 km west. No road or river joins any of them.

**Why the pin, not Brant Beck's mouth** (*proposed*; question 1). The pin is the lore's and the model's, on the salt, 110 m
above a lake that floods its flats in the wet season. The spit has no stream, so the village drinks from **wells**: the
spit's crest takes 1,051 mm a year, and a fresh lens floats on the salt water under it. Brick wells and a great tank are
Mohenjo-daro's (DESIGN.md's model), seven hundred of them in a city: here one for every few buildings.

## 3. Who lives there (*proposed*)

**About 3,000** (the owner). Caste shares, and where each lives:

| Caste | Height | Share | People | Dwelling (kit) | Holds | Count |
|---|---|---|---|---|---|---|
| 1 Tenders | 1.22 m | 25 % | 750 | `lz-warren` (seven cells in a whorl) | 28 | ~27 |
| 2 Makers | 1.53 m | 22 % | 660 | `lz-makers`, and the craft halls (DESIGN.md: "built into the craft halls") | 10; a hall 12 | ~55 + 4 halls |
| 3 Drovers | 1.92 m | 25 % | 750 | `lz-longhouse` (eleven bays) | 33 | ~23 |
| 4 Line warriors | 2.41 m | 15 % | 450 | `lz-lodge` (castes 4 and 6 together) | 30 | ~25 |
| 6 Bulwarks | 3.80 m | 10 % | 300 | | | |
| 5 Interpreters | 3.03 m | 3 % | 90 | `lz-tower` | 7 | ~13 |

The page counts what it places (the `people` check, a budget within 15 % of 3,000). The nest hall's hosts and the clutches
are not counted: a host is a resident mid-rebirth.

## 4. The layout (*proposed*)

**One street, a squared spiral** (DESIGN.md 2.1: "a squared (square or rhombic) spiral of buildings winding in to the nest
hall"). Rhombic: its corners are **75° and 105°**; each winding is **1.25 times** the width of the one inside it (the kit's
ratio). Five windings of blocks, the first 36 m deep, the last 88 m; the village about 700 m across, its axes laid along the
spit's contour so the arms run level and the cross arms climb.
- **The nest hall** (`lz-nest`) in the court at the centre, the bells and the paired stelae before it.
- **Every door faces inward:** each block is fronted on its inner street only, so every house looks toward the nest hall;
  the block's outer half holds yards, wells and pens, its back to the next street out.
- **The windings by caste**, inner to outer: the Tenders' warrens by the nest hall they tend (with the seer's hall, the
  medicine hut, the great tank and the obelisk); the Interpreters' towers among more warrens; the Makers' quarters with the
  three craft halls (bronze and stone, reed, bone) and the warehouse; the Drovers' long houses with the granaries; the
  warriors' lodges outermost with the barracks.
- **The mouth:** the street's outer end opens north-west, up the spit, to the mustering ground and the lookouts.
- **The ley line** (`lz-ley`, "the one straight thing in the town, aimed at the reliquary"): a straight path from the nest
  hall's court out through every winding to **the reliquary**. Crossing the spiral is the only short way in.
- **The reliquary** (`lz-reliquary`), isolated, in the older order's scale: on the lake's south shore of the spit, about
  **3.5 km** south-west, out of sight of the village behind the shoulder.
- **The country:**
  - **fields** up the spit's crest north-west (frillpod, ballmelon, ashmillet; the kit's `lz-farm` with its plough
    beast), two panemone **windmills** (`lz-windmill`) on the crest;
  - **the salt works** on the east shore's flats: the evaporating pans (the lake's brine let in, dried by the sun), the
    salt store; the lakecake skimmed from the shallows;
  - the **stone circle** (`lz-circle`) on the crest beyond the fields; two **lookouts** (`lz-lookout`).
  - frilled lizards and burden beasts by the fields.

## 5. What it lives on (`src/88-gl-records.js`, `[G data]`; all est.)

| Good | Made at Gila (a year) | Gila's own need | The Allotment |
|---|---|---|---|
| **salt** (halite from the pans) | ~300 t | ~25 t (3,000 at ~7.5 kg, and the bone hall's curing: hides, meat) | **~275 t out** along the Coil: the Tubes, the western warrens, Basilisk; the east has Sauropolis's pans (the polity's 45,000-65,000 need ~340-490 t) |
| gypsum, potash, soda, saltpetre | small: plaster for the cells, glaze, the lacquer's mordants | most | a share out |
| grain and pulse (ashmillet, Bambara groundnut, frillpod) | ~600 t from ~1,100 ha | ~700 t | **short: ~100 t in** in a dry year |
| ballmelon, bell-date | ~250 t | ~250 t | |
| lakecake (the salt lake's alga), fish | ~120 t | ~120 t | |
| frilled lizards (meat, hide, bone) | herds of ~600 | | |
| copper, tin | none | ~6 t of bronze a year (tools, bells, armour) | **in**: copper from Tuatara's diggings, tin from Komodo's placers, by way of the capital's bronze hall; or cast bronze |
| bone, hide | the bone hall (the herds and the raids' dead) | | the Coil's inward gifts |

The Coil Rounds (PROPOSAL-LIZARDMEN section 3): Gila's loads go **outward in one season and inward in the next**, never
straight; the bronze gifts reach it outward and leave it inward as bone. The records are plain data by id (`GL_REC`): the
census, the works, each good's make and need by season, the allotments `{season, good, from, to, qty, by, via}`.

## 6. Pieces the kit lacks, and textures

**Built here as Gila's own** (`src/66-gl-works.js`, the kit's toolkit, the kit's materials; seeds 7801-7899):

| Key | What |
|---|---|
| `gl-well` | a brick well after Mohenjo-daro's: a round shaft of wedge bricks, a raised squared lip (the kit's leiwen band on it, one flaw), a bone sweep-pole and a lacquered bucket; caste 'all' (no door) |
| `gl-tank` | the great tank: a sunken brick basin (12 x 7 m, 2.4 m deep) with stairs at both ends, a brick colonnade on the lake side, leaning; its water a `core/water` still record |
| `gl-pans` | a field of salt pans: a squared spiral of clay-walled pans (the brine let in at the outer end, salt raked at the centre) |
| `gl-saltstore` | the salt store: a reed hall on a brick podium (the granary's air channels) with salt cones in front |

**Asked of the kit later** (its `KNOWN_ISSUES.md`): the fishing weir and drying racks; the mine head (not needed at Gila);
the bake house; the squared-spiral passage into the reliquary.

**Textures.** Gila's own pack (`materials.json`) takes four library sets that exist: `ground.savanna.litter`,
`ground.salt`, `ground.tilled`, `ground.dirt`. The buildings use the kit's pack. **No texture is owed.**

## 7. Steps

| Step | What | Test | Status |
|---|---|---|---|
| **G0** | this plan | | done (`bb130ce67`) |
| **G1** | the build: `kits/lizardmen/build.py --settlement` (the kit's page with a settlement's src, gen and core files; without the flag the kit's page is byte-identical); Gila's `build.py` bakes the ground and seals core/city; the four new pieces | the kit's page unchanged (its hash); `tools/check_core_use.py settlements/gila` | done |
| **G2** | the Lizardmen row in `core/hamlet` (opt-in subfolder), with its node test | `node core/hamlet/lizardmen/test-hamlet-lizardmen.js` | done |
| **G3** | the page: the ground, the lake and the wells on core/water, the spiral on core/city, the buildings, the country, the reliquary and its ley line, the views; `verify.py` | the GPU verify: `gila-laid`, `on-the-model`, `people` (budget), `water-on-core`, `ley-aims`, `no-overlap`, `on-the-ground`, the kit's universals | done |
| **G4** | the records for the sim (`GL_REC`) | the books balance: made + allotted in = need + allotted out, by good | done |
| **G5** | the salt works on `KHAMLET.village` with the Lizardmen row | the hamlet's census and works | done |
| **G6** | flora on the biome core (`biomes/rift`, XV); the open world when the region is cut | the region's verify | open (after `biomes/rift`) |

## 8. Questions for the owner (answered 2026-11-16: all six agreed as proposed)

1. **Gila at its pin** (the spit's tip, 110 m over the lake, wells for water), or moved 22 km north to **Brant Beck's mouth**
   (a perennial stream, the lake's north-east lobe)? **Agreed:** the pin (`px 653,1485`).
2. **Wells and a great tank** for the water, after Mohenjo-daro? **Agreed:** yes (`gl-well`, `gl-tank`).
3. **The caste shares** (Tenders 25 %, Makers 22 %, Drovers 25 %, Line warriors 15 %, Interpreters 3 %, Bulwarks 10 %)?
   **Agreed.**
4. **The spiral street:** one rhombic squared spiral (75°/105°, each winding 1.25 times the last), every door facing in,
   the ley line the only straight way. Laid by Gila's own steps on core/city; may the city-layout workstream take it into
   `core/city` as a generator (`KCITY.leiwen`) for Sauropolis and the other villages? **Agreed:** yes, later.
5. **The west reliquary** on the spit's south shore, 3.5 km from the village? **Agreed.**
6. **Salt out, bronze in:** Gila sends ~275 t of salt a year along the Coil and takes its copper and tin (or cast bronze)
   from the east. **Agreed.**

## 9. Found on the way (for the sessions that own them; not changed here)

- `LORE.md` 6.20 still gives the villages on the old canvas (Gila 381,1155): 5.1 is +272,+330 (WEST-RIFT-SCOPE question 15).
- `lk-greathall` is "the Hall of Intention" in the kit's source since 2026-11-16; the kit's committed page is older.
- `core/engine/36-def.js` `place(key, x, z, ry, o)` sets `y = terrainH(x, z)` when `o.y === undefined`, even for nested `place()` calls inside a builder (`CURREC != null`, e.g. `lz-farm` placing `frilled` and `burden` in local coordinates); harmless on flat `y = 0` kit sheets, worked around in `90g-gl-world.js` for Gila.
- `core/terrain/43-core-ground.js` `kgTri` names a parameter `v1`, which clashes with r128's `cube_uv_reflection_fragment` `#define v1 0.276` when `KGROUND.hook` is attached to a `MeshStandardMaterial` on a scene with `scene.environment`; `MeshLambertMaterial` (as `biomes/abyssal-savannah` uses) avoids it.
- `core/hamlet/test-hamlet.js` has an unrelated failure on `neouterwall: arrow shafts` (`WOOD_RULES` in `10-hamlet-wood.js`).
