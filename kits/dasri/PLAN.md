# The Dasri Kit: Design Plan (`kits/dasri`)

The settlement and architectural kit of **the Dasri** (`LORE.md` §6.8, §3.1; `biomes/catch/PLAN.md`; `core/simulation/PROPOSAL-CATCH.md`): the desert caravaneers, oasis keepers, and urban salt-merchant sheikhdoms of the Bowl, the Eastern High Desert, and the Catch crossing. Catalog and `core/tags` culture **`dasri`**, emblem **the horns** (`shurfat` horned parapet pinnacles and ibex-horn finials).

## 0. What the Build Is

| | |
|---|---|
| Folder | `kits/dasri/` (`src/`, `build.py`, `dasri_bundle.py`, `verify.py`, `materials.json`, `tex/`, `PLAN.md`, `README.md`, `API.md`, `INDEX.md`, `PORT.md`, `KNOWN_ISSUES.md`, `tests/`) |
| Page | `dist/dasri.html`: the kit sheet with standalone inspection rows for **Urban Jabal** (`ds_jabal_*`) and **Dasri Village / Oasis** (`ds_vil_*`), `1.75 m` human scale figures and plinth labels, Front / Back / Plan camera presets, and a dedicated **Cliffside & Rock-Pinnacle Composition** showcasing both a *Dar al-Hajar*-style Jabal rock-pinnacle palace & tower cluster and a stepped Dasri canyon-ledge village flush against desert sandstone cliffs |
| Engine | **`core/engine`, read in place** (`core/engine/engine.py`): `defBuilding`, merged geometry buckets per material key, `36o-open.js` real operable `KDOOR` leaves and `KGLASS` stained/clear/lit window panes, `36s-stair.js` stairs, `37-wk-rec.js` `KWALK` floor/wall collision, `91f-furnish.js` `KFURN` master-catalog furniture adapter, and `99-host-take.js` `KHOST` hand-over |
| Registry | 28 `defBuilding` definitions (`ds_jabal_*` urban register, `ds_vil_*` village/oasis register), registered in `core/tags` (`culture: 'dasri'`) before drawing |
| Bundle | **`DASRI`** (alias **`DS`**, via `dasri_bundle.py`): one self-contained closure for `settlements/jabal`, `biomes/catch` (*Arfwai*, *Salt al-Ban*), Bowl salt-lake settlements (*Solta*), and `core/hamlet` villages |

## 1. Core Adoption

Written before the first fragment (`README.md`, "Core modules are not optional"):

| Module | Taken | For |
|---|---|---|
| `core/engine` | yes, read in place | `defBuilding`, merged buckets, openings (`36o-open.js`), stairs (`36s-stair.js`), walk boxes (`37-wk-rec.js`), furnish (`91f-furnish.js`), night lights, viewer shell |
| `core/rand` (`KRAND`) | yes | all seeded variation (`KRAND.hash`, `KRAND.unit`, `KRAND.vnoise`) for cliff relief, variant selection, course jitter, and host draws; never `Math.random` or `sin` hashes |
| `core/tags` (`KTAGS`) | yes | every placed building, feature, door, and catalog furniture piece registered before drawing; opt-in `52d-ds-tags.js` registers `dasri` cleanly in the kit's scope without dirtying global page baselines |
| `core/door` (`KDOOR`, `KGLASS`, `KDOORHOST`) | yes | operable studded cedar street doors, souq shutters, funduq gates, and translucent `qamariya` stained/lit/clear glass fanlights (zero black void plates) |
| `core/walk` (`KWALK`, `KWALKBOX`) | yes | floors, terraces, stairs, doorways, and `walk-reach` verification from street front into ground rooms, courtyards, and stepped terraces |
| `core/space` (`KSPACE`) | yes | spatial overlap checks on the cliffside and village compositions |
| `core/drawn` (`KDRAWN`) | yes | registering the sheet's ground plane and sculpted sandstone cliff/pinnacle meshes so `harness.SURVEY` `drawn-ground` measures the real drawn triangles |
| `core/host` (`KHOST`) | yes | camera, orbit/walk controls, hover inspector, polygon tool, standard key map |
| `core/atmos` (`ATMOS`, `KratorSky`) | yes | `core/atmos/placeholder` read by path for the viewer skybox and `ATMOS.skylight` PBR reflections |
| `core/materials/record` (`KMAT`) | yes | PBR material records and WebP texture pack (`materials.json` -> `tex/`) |
| `kits/catalog` + `core/furnish` (`KFURN`) | yes | real master-catalog pieces (`nomad`, `generic`, `generic-goods`, `jobs`) placed inside souq stalls, workshops, khans, `mafraj` pavilions, and oasis compounds |
| `core/mask` (`KMASK`) | not needed on sheet | no raster mask placement on the kit sheet; no `getImageData` used anywhere |
| `core/water` | not needed on sheet | small architectural cistern/trough basins use the engine's `water` bucket; open rivers/lakes belong to settlement pages |
| `core/biome` | no | flora belongs to the desert/wadi biome kits on settlement pages |
| `core/city`, `core/hamlet` | data rows exported | `32-ds-plan.js` exports `DS_HAMLET_ROWS` (`dasri_village`, `dasri_oasis`) and `DS_BOX` (`dims`) so `core/hamlet` and `core/city` consume them directly without editing `core/` here |
| `core/simulation`, `core/world` | no | simulation and 1:1 world terrain live on the settlement and openworld builds that import `dasri_bundle.py` |
| `core/ruins` | no | all 28 kit defs are intact inhabited buildings |

## 2. Two Coordinated Yemeni Architectural Registers

Inspired by **Yemeni architecture** across Sana'a, Shibam Hadramawt, Dar al-Hajar (Wadi Dhar), Jabal Haraz / Al-Hajjarah highland cliff towns, and fortified desert oasis kasbahs (`qasr`):

### 2.1 Urban `Jabal` Register (`ds_jabal_*`, `tags.variant: 'urban'`, `style: 'jabal'`)
For **Jabal**, capital of the Jabal Sheikhdom by the Bowl river and home of the **Train of Jabal** salt-caravan company (`4-7` storeys, `11.8-25.8 m`):
- **Stone Defense Base (`1-2` storeys)**: Battered/coursed dark vesicular basalt (`basalt`) or dressed buff desert sandstone (`ashlar`), or *ablaq* alternating courses on civic landmarks; high slit vents with frosted/smoked panes; deep-set semicircular stone-arched portals with heavy studded cedar doors (`KDOOR`).
- **Fired Brick & Shibam Mudbrick Upper Storeys**: Warm terracotta-red fired brick (`brick`) stepping slightly inward per tier, plus **Shibam variants (`v: 1`)** whose lower shafts are warm mudbrick (`banco`) and whose upper storeys and crowns are coated in dazzling white waterproof `qadad` lime plaster.
- **Crisp White Gypsum (`juss`) Geometric Relief**: Projecting 3D white chevron/zigzag (`\/\/\/`) and interlocking diamond (`<><><>`) belt courses between storeys, vertical gypsum pilaster strips dividing facade bays, and whitewashed `qadad` roof decks.
- **`Qamariya` Arched Stained-Glass Fanlights**: Semicircular gypsum-hooded lunettes over timber-shuttered casements, backed by jewel-toned stained glass (amber, turquoise, cobalt, ruby) behind white radial/rosette gypsum tracery, aligned in strict plumb columns up the facade.
- **Timber `Mashrabiya` / `Shurbah` Cooling Boxes, `Mizab` Spouts & `Mafraj` Belvederes**: Corbelled latticework cedar cooling boxes, vertical white lime-plastered rain channels and stone `mizab` spouts, pierced brick-and-gypsum roof screens with stepped **horned `shurfat` corner pinnacles**, and top-floor **`mafraj` reception pavilions** overlooking walled front roof terraces.

### 2.2 Dasri Village & Oasis Register (`ds_vil_*`, `tags.variant: 'village'`, `style: 'village'`)
For **Dasri foothill villages, canyon-ledge hamlets, and Catch/Bowl oasis stations** such as *Arfwai* and *Solta* (`1-3` storeys, `4.6-12.6 m`):
- **Rougher Stone & Battered `Zabur` Earth**: Coursed rubble stone bases (`rubble`) under warm battered rammed earth / mudbrick (`banco`) articulated with subtle horizontal `madamik` mud-course bands.
- **Restrained Limewash Accents**: Sparse whitewashed lintel eyebrows over small shuttered windows, simple whitewash parapet copings, and modest corner horn-nibs — omitting the multi-tier stained-glass `qamariya` grids and tall `mafraj` pavilions of Jabal.
- **Vernacular Roofs & Oasis Works**: Flat packed-earth roofs on exposed juniper/tamarisk pole ends with timber rain spouts, exterior solid-stone stairs, beehive mudbrick granaries, animal-drawn *saqiya* well sheds, *Solta* halite salt-drying sheds, round battered watchtowers, and a fortified desert oasis **`qasr`** with a battered cylindrical corner drum tower and courtyard domes.

## 3. Dual Placement Contract: Standalone AND Cliff-Locked (`o.cliff`)

Every building is engineered to work **both**:
1. **Standalone in the round (`!o.cliff`, default)**: All four facades (`+z`, `+x`, `-x`, `-z`) carry full masonry, belt courses, windows, drainage chutes, and a grounded stone plinth (`o.lo` skirt for uneven ground).
2. **Flush against a cliffside or perched on a rock pinnacle (`o.cliff: true`)**:
   - **Rear-high stepped massing**: Building volumes step up toward `-z` (rear spine highest, `+z` terraces stepping down toward the lane/valley, following *Dar al-Hajar* and *Wadi Dawan*), so the `-z` back keys naturally into a rising cliff face without awkward front overhangs or buried facades.
   - **Rear protrusion suppression**: In `o.cliff` mode, rear `-z` doors, projecting `mashrabiya` boxes, awnings, and rear spouts are suppressed so `bbox.mn[2]` stays cleanly at `-d/2` with zero rock clipping or z-fighting.
   - **Deep battered stone cliff skirt (`dsCliffSkirt`)**: Extends coursed rubble/basalt retaining masonry and buttress ribs below `y = 0` (`o.skirt` / `o.lo`, up to `6 m` deep) plus side-rear rock-keying collar nibs so buildings never float on steep cliff ledges or rock spires.

## 4. Complete Piece List (28 Defs)

| Key | Register | Size (`w x d x h`) | Description |
|---|---|---|---|
| `ds_jabal_house_poor` | Urban Jabal | `6.8 x 7.4 x 13.8` | 4-storey narrow artisan tower-house (`v:1` Shibam white-crowned mudbrick variant) |
| `ds_jabal_house_mid` | Urban Jabal | `8.6 x 9.2 x 17.6` | 5-storey burgher tower-house with ashlar base, `qamariya` bays, `mashrabiya`, roof `mafraj` (`v:1` Shibam variant) |
| `ds_jabal_house_rich` | Urban Jabal | `11.4 x 11.8 x 22.4` | 6-storey salt-merchant tower-house with *ablaq* base, stained-glass `qamariya`, twin `mashrabiya`, grand `mafraj` |
| `ds_jabal_corner_tower` | Urban Jabal | `9.6 x 9.6 x 20.6` | 6-storey street-corner tower-house with dual primary facades (`+z`, `+x`) and corner oriel |
| `ds_jabal_mansion_stepped` | Urban Jabal | `14.8 x 16.4 x 23.8` | Stepped 3->5->7 storey *Dar al-Hajar*-style hillside/cliff merchant mansion with cascading `qadad` terraces |
| `ds_jabal_souq_row` | Urban Jabal | `12.6 x 8.4 x 14.6` | 4-storey urban block over a 3-arch ashlar souq arcade with striped awnings and furnished stalls |
| `ds_jabal_salt_warehouse` | Urban Jabal | `13.4 x 11.6 x 12.8` | Train of Jabal salt & alkali factor's *wakala* with basalt damp-course, halite block stacks, tally gallery |
| `ds_jabal_brazier` | Urban Jabal | `9.4 x 8.8 x 12.4` | Copper & brass metalworker (*nahhas*) workshop with hooded forge, bellows, and upper residence |
| `ds_jabal_bakery` | Urban Jabal | `8.8 x 8.6 x 11.8` | Urban *tannur* bakery with twin clay bread ovens, flour store, and brick-and-gypsum upper floors |
| `ds_jabal_weaver_dyer` | Urban Jabal | `10.2 x 9.6 x 14.2` | Weaver & indigo/saffron dyer's house with ground looms, dye vats, and rooftop drying cloths |
| `ds_jabal_spice_khan` | Urban Jabal | `12.0 x 11.2 x 15.6` | Coffee, *qishr* & spice *samsarah* with recessed patio, coffee hearth, and `mashrabiya` upper rooms |
| `ds_jabal_caravanserai` | Urban Jabal | `22.0 x 22.0 x 18.5` | Train of Jabal Salt Caravanserai (*Funduq*) with monumental gate, arcaded court, salt bales & upper galleries |
| `ds_jabal_rock_palace` | Urban Jabal | `18.4 x 20.0 x 25.8` | Sheikh's Rock-Palace / *Mafraj* Citadel with battered basalt bastion, stepped brick wings & council belvedere |
| `ds_jabal_hammam_cistern` | Urban Jabal | `14.4 x 13.6 x 10.6` | `Qadad`-waterproofed sunken *birka* cistern & multi-domed *hammam* bathhouse with stained-glass dome oculi |
| `ds_jabal_bazaar_gate` | Urban Jabal | `13.6 x 8.6 x 15.8` | Fortified *Bab* bazaar gate with twin basalt-and-brick flanking towers, walkable arch & `qamariya` gallery |
| `ds_jabal_call_tower` | Urban Jabal | `6.8 x 6.8 x 24.8` | Cylindrical/polygonal red-brick watch & caravan call tower with white gypsum chevron ribs, balcony & `qadad` dome |
| `ds_vil_house_poor` | Village / Oasis | `6.4 x 6.8 x 4.8` | 1-storey battered `zabur` & rubble house with exposed pole eaves, exterior stone stair & roof bread oven |
| `ds_vil_house_mid` | Village / Oasis | `8.6 x 9.2 x 7.8` | Stepped 2-storey wadi-ledge house with forecourt, `madamik` mud courses & sparse whitewash trim |
| `ds_vil_house_elder` | Village / Oasis | `10.8 x 11.4 x 10.6` | 3-storey village sheikh / oasis keeper's stone-and-mudbrick house with stepped terrace & horn nibs |
| `ds_vil_compound` | Village / Oasis | `13.6 x 13.2 x 7.6` | Walled camel & goat homestead with mudbrick court, beast shade, trough & 2-storey rear house |
| `ds_vil_granary` | Village / Oasis | `8.4 x 7.6 x 6.4` | Raised rubble-plinth cluster of 3 battered mudbrick beehive granary silos with whitewashed rain caps |
| `ds_vil_shade_loggia` | Village / Oasis | `9.6 x 6.8 x 4.6` | Open-fronted juniper-post caravan way-shade (*sablah*) with plastered carpet bench & water jars |
| `ds_vil_saqiya_well` | Village / Oasis | `9.8 x 9.8 x 5.8` | Stone well-head & animal-drawn *saqiya* pot-wheel under tamarisk shade feeding a `qadad` watering runnel |
| `ds_vil_salt_shed` | Village / Oasis | `12.4 x 9.6 x 5.6` | *Solta* / *Salt al-Ban* evaporating brine pans & open mudbrick-pier halite block drying shed |
| `ds_vil_potter_kiln` | Village / Oasis | `9.2 x 8.6 x 6.2` | Battered circular clay & `qadad`-lime updraught kiln, slaking pit & water-jar drying rack |
| `ds_vil_cliff_stair` | Village / Oasis | `3.6 x 8.0 x 6.4` | Solid-stone canyon-ledge mule stair & battered retaining terrace with drainage runnel |
| `ds_vil_watch_post` | Village / Oasis | `6.6 x 6.6 x 11.2` | Battered cylindrical mudbrick desert watchtower (*burj*) with `mizab` spouts & triangular crenellations |
| `ds_vil_oasis_qasr` | Village / Oasis | `24.4 x 23.0 x 12.6` | Fortified desert oasis *qasr* with battered curtain walls, round corner drum tower, gatehouse & courtyard domes |

## 5. Verification Invariants (`verify.py --assert` & `tests/test-dasri.js`)

- Universal `harness.SURVEY` checks (`samplers`, `drawn-ground`, `gpu-renderer`, `shader-errors`, `no-nan`, `eye-above-ground`).
- Kit checks (each paired with a negative test where appropriate):
  - `inside-declared-footprint` & `inside-declared-height` & `triangle-budget`
  - `every-def-builds` (all 28 defs placed and verified)
  - `tags-vocabulary` (`unknown === 0`, every building carries `culture: 'dasri'` and valid `BUILDING_TYPES`)
  - `front-door` & `doors-open-and-shut` (every operable `KDOOR` opens and closes cleanly; `KGLASS` panes present, zero black void plates)
  - `walk-reach` (every walkable building's ground/court/terrace targets reached from its front)
  - `register-contrast` (urban `ds_jabal_*` pieces carry `qamariya` stained/lit fanlights & `juss` relief bands and rise taller than village counterparts; `ds_vil_*` pieces stay `<= 13 m` with restrained vernacular massing)
  - `cliff-lock-contract` (every cliff-placed building in `o.cliff: true` suppresses rear protrusions beyond `-d/2`, extends its stone `cliffSkirt` below its lowest rock ledge corner with zero floating gaps, and keys into the sandstone cliff/pinnacle)
  - `voth-trades` (`tools/check_trades.py` passes on `DS_TRADES`)
  - `furniture-keys` (0 missing catalog keys)
  - `material-records` & `deterministic` (identical rebuild fingerprint)
