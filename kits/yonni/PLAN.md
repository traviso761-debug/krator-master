# kits/yonni: Twin-Born Spear-Queens of Yonni & the Scoured Hills — Plan

## Core adoption

Before writing any fragment (`README.md`, "CORE MODULES ARE NOT OPTIONAL"), `kits/yonni` adopts the shared `core/` and `kits/` modules directly in place:

| Module | Status | Reason / Usage |
|---|---|---|
| `core/engine` | **Taken** (read in place via `engine.py`) | Merged world-space geometry buckets (`30-geo.js`), PBR library materials (`27-mat.js`), `defBuilding`/`place` (`36-def.js`), doors/glass (`36o-open.js`), walkable stairs (`36s-stair.js`), walk boxes (`37-wk-rec.js`), scene (`90-scene.js`), catalog furnish pass (`91f-furnish.js`), night halos (`91n-night.js`), clock/smoke (`93-anim.js`), host handover (`99-host-take.js`). Zero shadowed engine files. |
| `core/rand` | **Taken** (`08-core-rand.js`) | `KRAND` deterministic hashing and streams for variant/material selection, ground sculpting, and life records. Zero `Math.random` or `Math.sin` hashes in `src/`. |
| `core/tags` | **Taken** (`50/52/53-core-tags*.js`) | `KTAGS` registry for every placed building, resource node, flora placeholder, animal, and furniture piece (`culture: 'yonni'`). |
| `core/materials` | **Taken** (`core/materials/record` + `tools/textures/pack.py`) | `KMAT` records and packed WebP albedo/normal/roughness sets (`materials.json` -> `tex/`) for every building surface AND `f_*` triplanar detail maps for every furniture render family. |
| `core/catalog` & `core/furnish` | **Taken** (`furniture_bundle.py` + `KFURN`) | Master catalog sets (`generic`, `generic-goods`, `jobs`, `arms`, `scrap`) bundled alongside `kits/yonni`'s bespoke `yonni` `FURN_CULTURE` / `FK.set` / Twin-Born `FURN` definitions in `KratorFurniture`. |
| `core/door` | **Taken** (`10-core-door.js`, `20-core-glass.js`, `90-core-door-host.js`) | Operable plank/bronze-banded doors (`KDOOR`, `KDOORHOST`, `E` key) and horn-mica/storm-lantern glazing (`KGLASS`). |
| `core/walk` | **Taken** (`20-core-walk.js`, `walk/box/24-core-walk-box.js`) | Walkable slabs, spiral stair strips (`svStripWalk`), contour gangplanks, and sloped flying bridges (`F` walker). |
| `core/atmos` & `core/atmos/placeholder` | **Taken** (`89-atmos-*.js`, `placeholder.py`) | Standard Krator skybox (`KratorSky`), `ATMOS.skylight` PBR environment reflections, and `#include <atmos_waves>` on the coastal harbour row. |
| `core/host` & `core/clock` | **Taken** (`khost.SHELL + kengine.HOST`) | Orbit/WASD/walk camera, frame clock (`20-core-clock.js`), inspector, polygon tool, standard controls (`X` cut-away, `N` night, `E` door). |
| `core/drawn` | **Taken** (`10-core-drawn.js`) | `KDRAWN` registering the sculpted kit-sheet ground (flat catalog rows, `26 deg` hillside showcase ridge, coastal cliff scarp, harbour beach/seabed). |
| `core/shader` | **Taken** (`core/shader/*.js`) | Shared GLSL helpers required by `core/atmos` and `core/materials`. |
| `kits/resources` | **Taken** (read in place: `42r-res-ore.js`, `44r-res-nodes.js`) | All 20 ore/mineral kinds in 3 grades; Yonni mines resolve their nearest non-oil node within 400 m via `resSource`. |
| `kits/fauna` | **Taken** (`fauna_bundle.py`) | Coastal sheep, goats, poultry, and pack stock placed in byres and pens with `SV_LIFE` schedules. |
| `core/biome` | Not taken | Building kit viewer page, not a full biome showcase; placeholder wet-coastal terrace flora are tagged `cls: 'flora'` defs per `README.md`. |
| `core/world` | Not taken | Standalone building kit sheet; settlements on the 1:1 map (`346, 418`) will take `core/world` and bundle this kit. |
| `core/city` / `core/hamlet` / `core/camp` | Not taken | City/village/camp layout modules consume `ynDims()` and `YN_TRADES` when placing a Yonni town; the kit sheet lays out inspection rows. |
| `core/simulation` / `core/sched` | Not taken | Life records carry faction, sub-faction, job, and 24-hour schedule data (`SV_LIFE`) ready for `SIM` in settlement builds. |
| `core/water` | Not taken | Viewer sheet has only a single harbour-row sea strip using `core/atmos` `#include <atmos_waves>`, matching `kits/islanders`. |
| `core/terrain` | Not taken | Kit sheet sculpts a clean analytic hillside, cliff scarp, and shore plane registered in `KDRAWN`; open-world sites use `core/terrain`. |
| `core/ruins` | Not taken | Intact active living culture kit (`state: 'intact'`), no ruined fallen debris structures. |
| `core/export` / `core/lod` / `core/minimap` | Not taken | Settlement/biome-level pipeline modules; kit exposes `tagExport()`, `doorExport()`, and `ynDims()` for downstream worlds. |

---

## 1. Culture, People & Climate (`Yonni`, `346, 418` & `Scoured Hills`)

- **Culture key:** `yonni` (`Yonni Spear-Queens`, *Sfīra-Kandētæ*).
- **Language & Society:** Mixed Kushitic + Sarmatian inflected English (*Sfīra-Kandē* Spear-Queen, *Khārth-Kandē* Hearth-Queen, *Fīld-Kandē* Field-Queen, *Tvīn-Sisītæ* Twin-Sisters, *Lōni-Bōrna* Lone-Born Seer). Women are taller and stronger than men; **90% of births are identical twins**, shaping domestic and civic architecture: paired twin sleeping alcoves, dual-spear racks, twin-hearth braziers, twin-spear bronze roof finials, Dual-Throne Kandē citadels, and rare Lone-Born Seer rotundas.
- **Environment & Resources:** Wet windward coastal mountains (`+166..+4,402 m`, `1,647–2,200 mm/yr` squalls), rich in `iron`, `coal`, `tin` (`tin = 200`), `saltpeter`, `amber`, coastal granite, and rust-ironstone cobbles.

## 2. Architectural Grammar

1. **Battered Coastal-Cobble Bases & Telescoping Zero-Podium Root-Skirts:**
   - Coarse salt-grey coastal granite & rust-ironstone river-cobble lower drums (`cobble`, `ironstone`), transitioning to pale crushed-shell hydraulic sea-lime rendered shafts (`sealime`, `sealimeWarm`).
   - **Zero rectangular podiums:** Every drum extends an open-bottomed 1:6 battered cobble root-skirt (`3.5–7.5 m` below `y = 0`) so placements on `0°–35°` slopes plunge cleanly into hillsides without floating corners.
2. **Overhanging Corbel-Fin Upper Galleries & Watershed Drip-Skirts:**
   - Vertical tapering stone corbel-fins (`861d6426`), fluted stone corbel-ribs (`02f9f0ab`, `171af084`), and dark oiled coastal ironwood arcades carrying wider upper circular galleries.
   - Mid-wall annular slate/lime watershed drip-skirts and semicircular crescent window rain-visors (`02f9f0ab`) shedding squalls clear of walls and doorways.
   - Broad oversailing conical & domed Round Rain-Canopies in slate-blue shingle (`slate`), patinated verdigris bronze/copper standing-seam (`verdigris`), and tin-bronze (`bronze`) radial ribs crowned by twin-spear finials.
3. **Steep-Slope Circulation & Two Modes (`style: 'freestanding'` | `'cliff'`):**
   - Drum-hugging spiral stone stairs (`171af084`, `c1eecdde`), uphill 2nd-floor contour gangplanks, and sloped roofed flying bridges between multi-drum compounds (`8dac4161`).
   - **Freestanding Mode (`style: 'freestanding'`):** Poor (3), Middle (3), Rich (4, including Five-Apse Promontory Manor `yn-manor-apserose`) dwellings; Royal/Civic/Sacred/Citadel Landmarks (13: Twin-Queen Royal Palace & Citadel, Peripteral Court Rotunda, Dual-Throne Twin-Kandē Citadel, Cantilevered Saucer-Terrace Spire, Golden-Dome Seer Monastery, Annular Sunken-Court Moot & Exchange, Gilt-Dome & Verdigris-Disc Sanctuary, Four-Pylon Buttressed Dome Shrine, Hexagonal-Truss Pagoda Watch-Citadel, Lone-Born Seer Rotunda, Sisterhood Spear-Hall, Lore-Tower, Rain-Cistern Bathhouse); Formline & Coastal Defence (6); full Voth census Trades, Inns, Villas, Bazaar-Drums, Sun-Petal Watchtowers, Shade-Sail Compounds & Scallop-Cap Smelters (26 land + 4 coastal harbour defs); plus a dedicated **`26°` Sloped Scoured-Hills Showcase Row** proving steep-slope placement.
   - **Cliff-Flush Engaged Mode (`style: 'cliff'`):** Spear-Queen Frontier Border-Fort (`yn-border-fort`), Fluted-Pillar Cliff Acropolis & Viaduct (`yn-cliff-viaduct-hall`), Cliff-Clinging Saucer-Lantern Hold (`yn-cliff-lanternhold`), Cantilevered Fluted-Corbel Rotunda Loggia (`02f9f0ab`), Engaged Three-Quarter Cliff-Tower Cluster (`02f9f0ab`), Arched Cleft-Bridge & Twin-Towers (`02f9f0ab`, `171af084`), Cliff-Ledge Twin-Cot, Cliff-Vented Rock-Forge, and Hanging Eyrie Watch-Cupola, placed against a sculpted coastal granite cliff scarp.

## 3. Texture Wiring & Z-Fighting Audit Mandates

1. **100% Real Library Textures (`materials.json` -> `tex/`):**
   - Every building surface (`cobble`, `ironstone`, `granite`, `cliff`, `sealime`, `sealimeWarm`, `slate`, `verdigris`, `bronze`, `iron`, `ironwood`, `planks`, `floor`, `carved`, `flagstone`, `terracotta`, `wool`, `kilim`, `sail`, `rope`, `turf`, `earth`, `sand`, `coal`, `cassiterite`, `gossan`, `efflor`, `ground`, plus `plain`/`brass`/`bone`/`flag`/`room` fallbacks) and every furniture render/tex family (`f_wood`, `f_plank`, `f_cloth`, `f_metal`, `f_bronze`, `f_gold`, `f_rust`, `f_stone`, `f_plaster`, `f_ceramic`, `f_terracotta`, `f_tile`, `f_hide`, `f_leather`, `f_rope`, `f_wicker`, `f_reed`, `f_bamboo`, `f_bark`, `f_bone`, `f_nacre`, `f_lacquer`, `f_food`, `f_plant`, `f_leafy`, `f_paper`, `f_wax`, `f_ash`, `f_thatch`, `f_pewter`, `f_paint`) is wired to packed library maps.
   - Verified by `all-surfaces-textured` in `verify.py --assert` (`0` untextured non-emissive/non-glass meshes across buildings, terrain, props, and furniture).
2. **Geometric Coplanar Z-Fighting Audit (`_api.zfightAudit()`):**
   - World-space triangle-pair audit across all placed meshes and furniture batches detecting same-normal (`dot > 0.998`), coplanar (`|d1 - d2| <= 0.0015 m`), 2D-overlapping triangles of different material/color, enforced in `verify.py --assert` (`z-fighting`).
