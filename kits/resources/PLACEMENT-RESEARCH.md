# Resource placement: research and proposals (2026-10-26)

Read-only research for the final rebuild. Nothing here is built.

## What exists, and the gap

- **`kits/resources`:** ten node kinds in three grades (`42r-res-ore.js`), fields (`43r-res-fields.js`: salt, pasture, fish, farmland), and the nearest-node rule (`resSource`, 400 m).
- **Biome kits:** the `gather` tag, and the species' `harvest.wood` text.
- **`kits/crops`:** crops by climate axes.
- **`core/hamlet`:** places a village's resource "if the map has none in reach".
- **Missing:** nothing places nodes across the world. They are hand-set on sheets, or seeded per village.
- **The scale model has no geology layer.** It has height, rain, temperatures, climate class and zone, `DATA.rivers` (flow and `to`), `DATA.basins` (endorheic lakes), `DATA.palaeolakes`, `DATA.vents`, `DATA.floods`, `DATA.ancient_roads`, and the polity regions.

## Proposed placement model

**Inputs** (baked offline from the scale model at its ~4 km cell):
- a derived **geology province** per cell:
  - volcanic arc or vent field;
  - crystalline upland, or shield;
  - sedimentary lowland basin;
  - evaporite (a closed basin or palaeolake floor);
  - rift;
  - Ancient-ruin ground;
- **relief** (local slope and height range);
- **drainage** (flow and stream order from `DATA.rivers`);
- rain, temperature and pressure.

These become one small byte raster per resource family: its **prospectivity**, 0 to 255. It ships as data, so JS and Godot read the same integers. Nothing is interpolated on the GPU.

**Rules per family:**

| Family | Where | Real-world basis |
|---|---|---|
| copper (porphyry), silver, gold lodes, sulfur | arc and vent provinces, and the flanks of the Throne, the Godthrone, the Rift and Korona; sulfur within a few km of `DATA.vents` | porphyry Cu sits in subduction-arc intrusions (USGS) |
| tin, rare earth | crystalline uplands (granite and pegmatite) | |
| iron | uplands and basin margins | |
| coal | subsiding lowland basins with past wet climate | coal forms from stacked mires in subsiding foreland basins (USGS; Karoo) |
| oil | basin margins over coal provinces, with seeps on folds | |
| salt, potash, alkali | endorheic basins and palaeolakes, zoned **bullseye**: gypsum at the rim, halite inside, potash at the last-dry centre | closed-basin evaporite sequence (NDGS) |
| saltpeter | dry caves and arid ground | |
| placer gold and tin | **routed:** walk `DATA.rivers` downstream from each lode node and drop placers where the gradient flattens (a confluence, the inside of a bend, a fan) | gold settles where flow slows (USGS placer model) |
| stone, clay | stone: any steep scarp of the right province; clay: river floodplains and lake beds | |

**Deterministic and streamable:**
- **Two tiers:**
  - **Tier 1** is the baked raster above.
  - **Tier 2** is a jittered grid: each placement cell (say 1 km, larger for rare kinds) takes at most one candidate per family, `KRAND.cell(KRAND.child(world, 'res:'+family), ix, iz)`.
- **A candidate is kept** when its hash, scaled to 0-255, is below the cell's prospectivity.
- **Within a cell:** its position is jittered inside an inset of the cell, which keeps a minimum spacing with no neighbour reads (a Poisson-disc approximation that needs no global pass). Its grade comes from a second draw, biased by prospectivity.
- **Any tile can be built alone,** in any order, in either engine. `core/rand/krand.gd` already matches the JS (`golden.json`).
- **Snapping** is to the height field after the pick, and a pick on water or a cliff is dropped by a fixed rule. It is never re-rolled.
- **Overrides:** an owner-placed node overrides by id, as a delta (`core/edits`).

**What it feeds:**
- **`core/hamlet`:** `KHAMLET.village` queries `KRES.near(x, z, kind, r)` instead of seeding its own node. A village is then placed *because* a node is there.
- **`core/simulation`:** a node's grade (and later its reserve) sets the producer rate, as `resRate` does now.
- **Polity books:** a per-polity summary of what lies within each polity's regions drives which goods it imports, so trade routes follow scarcity (the isle demo's Kautoa and Valapo).

## Ranked features

### 1. Geology province raster

- **What:** a script in `tools/scale-model/` derives provinces from height, relief, vents, basins, palaeolakes and the polity regions, then bakes one prospectivity byte per family per cell. The owner can repaint it like any region layer.
- **Adds:** every placement rule rests on it. The world's ores then follow its tectonics, not chance.
- **Cost:** about 1 MB of data, no runtime cost.
- **Where:** `tools/scale-model/geology.py`, output in `core/resources-data/` or the extract (`extract_region.py`).
- **Godot:** `Image.load` and `get_pixel` on integer cells.
- **Effort:** M.
- **Sources:** [USGS porphyry Cu model](https://www.usgs.gov/publications/porphyry-copper-deposit-model), [DF rock layers](https://dwarffortresswiki.org/index.php/DF2014:Rock).

### 2. Cell-hashed node field (`KRES.nodesIn(tile)`)

- **What:** the tier-2 jittered grid above, as a `[G data]` function returning node records keyed `res:<family>:<ix>:<iz>`. It registers the nodes in `core/tags`.
- **Adds:** world-wide nodes, identical on any tile, in either engine.
- **Cost:** microseconds per tile.
- **Where:** `kits/resources/src/45r-res-field.js`.
- **Godot:** a GDScript twin on `krand.gd`, drawn as `MultiMeshInstance3D`. Avoid `FastNoiseLite`: its cellular jitter default changed between 4.1 and 4.2.
- **Effort:** M.
- **Sources:** [Bridson Poisson disc](https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf), [Godot FastNoiseLite](https://docs.godotengine.org/en/4.2/classes/class_fastnoiselite.html).

### 3. Water-routed placers and zoned evaporites

- **What:** placer gold and tin are traced down `DATA.rivers` from lode nodes. Salt, potash and alkali are zoned in rings across closed basins and palaeolakes, including the Catch's two planned nodes.
- **Adds:** gold rushes along real rivers, and salt where the model's water ends. It closes the KNOWN_ISSUES salt-pan item.
- **Cost:** offline only.
- **Where:** `tools/scale-model/geology.py`, and `43r-res-fields.js`.
- **Godot:** baked records.
- **Effort:** M.
- **Sources:** [USGS gold placers](https://www.usgs.gov/publications/gold-placer-deposits), [NDGS potash sequence](https://www.dmr.nd.gov/ndgs/Publication_List/pdf/RI%20SERIES/RI-68%20Potash.pdf).

### 4. Polity scarcity ledger and fairness audit

- **What:** sums nodes and fields per polity and per settlement catchment. A verify check asserts each polity's guaranteed basics (stone, wood, water, salt within a day's travel) and at least one good it must import.
- **Adds:** scarcity, which drives the isle demo's trade, and a guard against a dead start.
- **Cost:** a build-time pass.
- **Where:** `kits/resources/src/46r-res-ledger.js`, read by `core/simulation` (`77-sim-6-trade.js`).
- **Godot:** a `Resource` export of the ledger.
- **Effort:** S-M.
- **Sources:** [Anno: no island has everything](https://www.keengamer.com/articles/guides/anno-1800-how-to-trade-and-move-resources/), [Civ VI balanced-maps mod](https://steamcommunity.com/sharedfiles/filedetails/changelog/1958135962?p=4).

### 5. Surface indicators and prospecting

- **What:** each node draws its tells at its foot: gossan, green stains, tar seeps, salt crust, stressed or indicator plants (a biome-kit hook). Deeper nodes stay hidden until a survey (a prospector's job, or an Ancient scanner) reveals them.
- **Adds:** exploration play, as LORE intends.
- **Cost:** decals and plant swaps.
- **Where:** `44r-res-nodes.js`, plus a `biome indicator` tag.
- **Godot:** `Decal`.
- **Effort:** M.
- **Sources:** [geobotany (UGS)](https://geology.utah.gov/map-pub/survey-notes/glad-you-asked/what-are-the-roots-of-geobotany), [oil seeps (Georgia GS)](https://epd.georgia.gov/sites/epd.georgia.gov/files/related_files/site_page/GR2.pdf), [RimWorld scanner](https://rimworldwiki.com/wiki/Ground-penetrating_scanner).

### 6. Richness by remoteness and hazard

- **What:** the grade draw is biased up with distance from settled cores and with air pressure or danger (the Abyss, the Godthrone).
- **Adds:** a reason to venture out.
- **Cost:** one term.
- **Where:** `45r`.
- **Godot:** the same.
- **Effort:** S.
- **Source:** [Factorio map generator](https://wiki.factorio.com/Map_generator).

### 7. Reserve tonnage (no depletion yet)

- **What:** each node carries a reserve drawn with its grade, kept as a delta by id. Depletion stays a tunable that is off, per the owner.
- **Adds:** room for later depletion with no data migration.
- **Cost:** tiny.
- **Where:** `42r`, and `77-sim-7-stocks.js`.
- **Godot:** a field on the record.
- **Effort:** S.
- **Source:** [RimWorld deep drill](https://rimworldwiki.com/wiki/Deep_drill).

### 8. Biological fields from the model

- **What:**
  - fish grade by shelf depth (under 200 m), river mouths and cold-water upwelling;
  - game herds on pasture near water;
  - timber stand records aggregated from `harvest.wood`.
- **Adds:** fishing and hunting villages placed on merit.
- **Cost:** offline only.
- **Where:** `43r`, and `core/hamlet/12-hamlet-gather.js`.
- **Godot:** baked.
- **Effort:** M.
- **Source:** [FAO: upwelling drives stocks](https://www.fao.org/4/n2701e/n2701e03.htm).

### 9. Coal and oil basin model

- **What:** coal goes in subsiding wet lowland basins, and oil on their margins and folds.
- **Adds:** an industrial geography for the Geomancer and Iziz.
- **Where:** `geology.py`.
- **Effort:** S.
- **Source:** [USGS coal mires](https://pubs.usgs.gov/pp/p1625a/IN/INpt4.html).

### 10. Ancient salvage as a resource family

- **What:** ruin ground yields salvage nodes (cable, alloy, cells) by Ancient-road and ruin density.
- **Adds:** the lore's core economy.
- **Where:** `42r`, as a new kind.
- **Effort:** M.

### 11. Overlay and distribution audit

- **What:** a prospectivity and node layer in the scale-model page, with histograms in `verify.py`.
- **Adds:** tuning by eye.
- **Effort:** S.
- **Source:** [Minecraft ore distribution bands](https://www.minecraftmaps.com/tools/ore-distribution).

## For the final rebuild: features 1-4

- **Feature 1 is the foundation.** Every later rule reads it, and it is the gap the model has today.
- **Feature 2 is the only placement** that is streamable and the same in Godot.
- **Feature 3 is real geology at offline cost.** It reuses the model's own rivers and basins, and it closes open KNOWN_ISSUES items.
- **Feature 4 ties placement to the economy test case.** The isle demo is where tuning happens.

Features 5-11 can follow without changing the data shape.

Caveat: the sources were read through search summaries, not in full.
