# settlements/pinnacle-rock: port audit

*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** cells and the text under "Notes": a rerun keeps them and refreshes the numbers. `--reset` retags everything.*

Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · `[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · `[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the fragment mixes data with drawing or host code and needs a data pass and a draw pass.

| | [G data] | [G shader] | [G native] | [web] | [draw] |
|---|---|---|---|---|---|
| KB | 152 (46%) | 0 (0%) | 0 (0%) | 24 (7%) | 153 (47%) |

Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and `events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, `ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.

| Fragment | KB | Tag | THREE | canvas | DOM | events | loop | geom | shader | inst | ray | store | net | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/00-head.html` | 1.2 | [web] | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |
| `src/40-pr-layout.js` | 18.1 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the settled plan as records and pure queries (PR) |
| `src/42-pr-world.js` | 0.6 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | no three.js, no geometry, no DOM |
| `src/43-pr-roosts.js` | 44.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the roosts as records (PRR.plan on KSTACKS bodies): decks, Girder-shaped stalls and bridges, climbs, lifts, the Stair |
| `src/45-host-stage.js` | 9.6 | [web] | 7 | 0 | 3 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |  |
| `src/47b-host-roosts-plan.js` | 3.7 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | runs PRR's plan (43) before the kits build, adds its ways to PR, cuts the lift road's bench into LAND.talus and re-seats the floor mesh there |
| `src/54-pr-town.js` | 27.5 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the town on the top as records (PRT.plan: one core/city instance, steps 0-5 from the layout, the module's builder 6-12; the trades it carries) |
| `src/54b-host-town-plan.js` | 0.8 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | runs PRT's plan (54) on this page's rock and roost plan with the Beast Riders' sizes (CAT.dims); core/city registers every lot in core/tags |
| `src/55-pr-farms.js` | 18.9 | [G data] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the farms as records (PRF.plan): the ring in six terraces of field cells, the crops, twelve farmhouses, the palisade's runs, gates and posts, the tracks |
| `src/55b-host-farms-plan.js` | 1.0 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | runs PRF's plan (55) on this page's ground (the mesa's foot, the debris slope, the lift road's end) |
| `src/56-pr-camps.js` | 15.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | the bands' grounds as records (PRC.plan): BR_CAMP's grounds pitched on the top and the floor, the hedges and fences (BR_RUN), the tracks |
| `src/56b-host-camps-plan.js` | 1.4 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | runs PRC's plan (56) with the page's ground rules; its tracks join PR's ways before the forest grows |
| `src/57-pr-cavern.js` | 13.4 | [G data] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the Deep Root as records and a KCAVERN plan (PRD.plan): the court, its stair, the passage of the tribes, the hall, the light well, the openings, the rock-cut dressing, the ring of stones, the fig |
| `src/57b-host-cavern-plan.js` | 1.3 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | runs PRD's plan (57) on this page's cap with KCAVERN and the kit's sizes; the processional joins PR's ways |
| `src/58-pr-garden.js` | 13.8 | [G data] | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | the Garden's great-houses as records (PRG.plan): compounds, great-houses round the Heart, rock longhouses against the pinnacles, the paths |
| `src/58b-host-garden-plan.js` | 1.1 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | runs PRG's plan (58) on this page's Garden's mesa and Heart with the roost plan's ascents |
| `src/86-pr-far.js` | 3.2 | [draw] | 3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the far land: one ring mesh from WORLD.H (the scale model) |
| `src/87-pr-talus.js` | 1.7 | [draw] | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | the debris slope's fallen blocks: one biome item placed per 6 m cell (KRAND); the slope's height is LAND.talus (45) |
| `src/88-host-build.js` | 2.1 | [web] | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | split: data inside host code |
| `src/89-host-roosts.js` | 25.5 | [draw] | 10 | 0 | 0 | 0 | 0 | 4 | 0 | 1 | 0 | 0 | 0 | draws PRR's records (merged meshes by material, the Beast Riders kit's maps) and registers them; the lifts' cages move on a tick |
| `src/89c-host-town.js` | 6.6 | [draw] | 12 | 0 | 0 | 0 | 2 | 2 | 0 | 2 | 0 | 0 | 0 | draws TOWN's records: the streets as ribbons, the squares paved, each building built once (CAT.proto, isleProto) and instanced |
| `src/89d-host-farms.js` | 11.1 | [draw] | 23 | 0 | 0 | 0 | 2 | 7 | 0 | 4 | 0 | 0 | 0 | draws FARMS' records: levelled field slabs, instanced crop rows, rice, beds, pens and orchard trees, the paddies' water, the palisade's stakes, the farmhouses and gates (CAT), the tracks and the road |
| `src/89e-host-camps.js` | 5.6 | [draw] | 13 | 0 | 0 | 0 | 2 | 4 | 0 | 4 | 0 | 0 | 0 | draws CAMPS' records: tents and pens (CAT, instanced), the hedges' runs as a light band and their gates, the fences, banners, tracks |
| `src/89f-host-cavern.js` | 16.3 | [draw] | 24 | 0 | 0 | 0 | 2 | 8 | 0 | 2 | 0 | 0 | 0 | draws CAVERN's records: the chunks (ground in the cap's material, walls hewn), the cap re-cut over the openings, the dressing, the stones, the fig, the pool, the processional |
| `src/89g-host-garden.js` | 1.6 | [draw] | 1 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | draws GARDEN_TOWN's records: the houses (CAT, instanced), the paths |
| `src/89h-host-walk.js` | 1.7 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the walk registry (core/walk): the decks' rings, the climbs' and ascents' treads, the bridges, the Stair, the lift road |
| `src/89w-host-water.js` | 4.1 | [draw] | 8 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | core/water's still water on core/atmos (the paddies, the spring, the seep pond, the Deep Root's pool, the rain pools on the slickrock); core/atmos bound on the host's hour |
| `src/89y-host-night.js` | 4.4 | [draw] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the night's fires and lamps placed from the records with core/atmos (braziers, beacons, the glow layer, one hall light); core/atmos's export carries them (its lamps and glows) |
| `src/99-host-take.js` | 73.0 | [draw] | 9 | 0 | 0 | 0 | 0 | 14 | 0 | 2 | 8 | 0 | 0 |  |
| `src/99-tail.html` | 0.0 | [web] | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | page shell |

## Notes

(none yet: the split lists and the overrides go here)
