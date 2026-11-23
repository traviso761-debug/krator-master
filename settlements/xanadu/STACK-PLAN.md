# Xanadu on the vertical stack: the integration plan (2026-11-22)

The owner, 2026-11-22: *"vertical stack is done so we can start planning the xanadu integration"*. This plan turns
`GRAPHICS-TERRAIN-PROPOSAL.md` section 12c ("Next step after merge & Stage 8: Build out Xanadu on the new graphics &
terrain stack") and `TODO.md`'s "Post-merge graphics expansion: build out Xanadu" (both on `origin/claude/vertical-stack`,
bd05a56ac) into ordered sessions for every Xanadu region and page. It is phase B of `BUILD-PLAN.md`, rewritten now that
the stack is done: it replaces that file's B0-B5 rows. Plans only; nothing here is built. Everything not from the owner,
the stack's reports or the lore is *proposed*; session counts are estimates.

Read with it: `BUILD-PLAN.md` (phase A, the settlements), and on the stack branch (`git show
origin/claude/vertical-stack:<file>`): `GRAPHICS-TERRAIN-PROPOSAL.md` 8, 9.2, 11, 12, 12c; `STAGE-3-4-REPORT.md` (S1-S5,
the 3D grass), `STAGE-5-REPORT.md` (M1, the packing table), `STAGE-6-7-REPORT.md` (Longsong's I1-I4 and Gate 5),
`VERTICAL-STACK-REPORT.md` (relief version 2). The worked examples: `openworld/oidong-highrift` (a region on the stack) and
`settlements/longsong` (an interior on the stack: `godot/data/world-oidong-highrift/places/sq80bzd7ep-monastery/interiors.json`).

## 0. The owner's answers (2026-11-22, this plan's batch)

1. **Before Stage 8: data now, looks after** ("Data now, looks after"). Until the all-builds rebuild carries Stage 8, Xanadu's
   stack work is engine-neutral data only (material classes, room graphs, the ground-layer table, routes), beside phase A's
   layouts. Re-bakes, packing, Godot exports and look tuning come after Stage 8, so no page is tuned twice.
2. **Xanadu gets its own S4 ground-layer set** ("Xanadu's own layer set"), keyed by the `xanadu` world style, beside the
   stack's six global layers.
3. **The first Xanadu interior on I1-I4 is Erewhon's citadel** ("Erewhon's citadel"): the Vizier's palace and the Pleasure
   Dome (`settlements/xanadu/src/89y-xa-interiors.js`).
4. **On the web, only the glazed families get 8-bit normals** ("Glazed families only"), checked against the 16 MB page and
   sidecar caps; Godot takes the full two-map packing.

Earlier answers that bind here: the stack's Xanadu slice is **the Lake Shore with Erehwon**; **the six province regions not
yet cut wait for the stack** (`BUILD-PLAN.md` section 0).

## 1. The rule: each thing built once

Stage 8 rebuilds every page and re-bakes every region anyway. So:
- **Layouts and records** (core/city plans, hamlets, sites, room graphs, material classes) are engine-neutral: build them
  now (phase A). The rebuild carries them unchanged.
- **Looks** (lighting by hand, exposure, a page's own shadow or ambient tweaks, texture re-packs, Godot exports) wait for
  Stage 8: done before it, they are redone by it.
- **Ground that will be re-cut** waits: the six province regions are cut once, after Stage 8, on the stack's world tiles and
  relief version 2, and what stands on them is placed once, there. The two lake regions and `xanadu-oidong-highrift` exist
  and are re-baked by Stage 8; anything placed on them now moves with the re-bake (the lake towns' grounds are closed-form
  fits: `tools/fit_lake_town.py` re-runs, nobody hand-edits).
- **What Stage 8 must find in place** for Xanadu to be packed and baked right the first time: the material classes (XS1)
  and the Xanadu S4 table (XS1). They land **before** Stage 8.

## 2. What the stack gives, and what Xanadu takes of each

| Stack item | What it is (the stack's reports) | Xanadu's use |
|---|---|---|
| `relief.micro: 2` | WMICRO version 2 (the erosion's bias reduced; Stage 8 turns it on everywhere) | the three Xanadu regions and the six to cut; the map-seated pages re-baked (section 4) |
| World-tile streams | streams traced on 64 km world tiles: two regions over one place agree | the lake is shared by two regions; the province cuts share edges |
| S1 `KHORIZON` | 40 km horizon angles and sky visibility, baked per Godot export (`core/world/bake_horizon.py`); the web reads the same textures | the caldera wall shades the south shore's towns in the morning; the Rift's walls; the Spillway gorge |
| S2 `KSHADOW` | near shadows on, both engines | every page, by the rebuild |
| S3 | Godot chunk normal-and-crease textures (32 m) | the terraces' risers and the caldera's flanks read in Godot |
| S4 | Godot layered ground in arrays (`godot/tools/pack_ground_layers.py`, `godot/krator/kground_layers.gd`); the web keeps `KGROUND`'s two fixes | **Xanadu's own six layers** (section 6) |
| S5 | sky, fog and cloud shadow by the hour (core/atmos twins) | the lake's morning haze; Erewhon at dusk |
| `KratorWorldGrass` | Godot 3D grass sward (`godot/krator/world_grass.gd`), masked off water, cliffs, roads, footprints, paved courts | the Vale's meadows, orchards' floors, lake margins; masked off paddies, terrace risers and quays (section 7) |
| M1 | packing (`STAGE-5-REPORT.md` 4): Godot `v4_arrays_two_maps` for ground and town atlases, `v2_two_maps_oct8` for kits; web three maps, glazed families to `xy8` normals, `v3` arrays at runtime near 16 samplers | the Xanadu kit's glazed tilework, domes and lacquer (section 5) |
| M2-M4 | per-pixel light near the eye, planar POM on hero walls, concave cavity and base grounding | the citadel's ashlar and brick, the Moorish palaces' tile dados, the forts' rubble |
| I1-I4 | indoor sun mask, the room table (`core/interiors/10-core-roomlight.js` `KROOMLIGHT`), room-gated lamps (2 shadowed hero lamps in Godot), corner AO; `interiors.json` v2; Godot `KInteriorsLight`, `library_interior.gdshader` | Erewhon's citadel first (XP2), then the kit's rooms (XP6) |
| Gates | 1 pack and channel, 2 samplers, 3 handedness, 5 sun-leak probe, 7 swatches, 8 budgets ratchet | each session below names its gates |
| Route harness | `tools/route_harness.py` (web) and `godot/tests/perf/route_harness.gd`: four stops, three hours | a `xanadu` track (section 8) |

## 3. The regions

| Region | Now | Before Stage 8 | Stage 8 (the rebuild) | After Stage 8 |
|---|---|---|---|---|
| `openworld/xanadu-lake-shore` (P1: Erehwon, 13 shore towns, 3 isles) | cut, 2.5 MB page; the stack's stage 3 rebuilt it on its branch | phase A's lake towns L3-L4, the isles (H1), the sample (H2) | `relief.micro: 2`; streams, sites, resources re-baked; the lake towns' `bake_towns.py` entries re-fitted | **XP1, the slice**: Godot export with S1 horizon, S3, S4 Xanadu layers, grass, water, Erehwon and the lake towns as places; the `xanadu` route |
| `openworld/xanadu-north-shore` (P7: Phēr, 6 lake towns, Thalaba road) | cut, 4.7 MB | phase A's L0-L2 (Māuṭh from A1, now in the cloud) | the same re-bakes; Phēr's and the towns' entries | XP4: export, horizon, grass; Phēr as a place |
| `openworld/xanadu-oidong-highrift` (the whole Sultanate, 1 km cells; Qiblai's ring, Kirstabal's lake, the Devisers' camp) | 8.9 MB page + an 8.5 MB `tex.xanadu.js` sidecar | the Tears' camp site (A7) | the same re-bakes | XP4: export; stays the valley-wide view (the province regions hold the 1:1 detail) |
| The six to cut: Bhēl (P2, Theodiga), Qāṭarāq (P3, Qiblai), Gōlḍ-Mārch (P4, Strongwall), Siqārp (P5, Kirstabal, Gihon), Ōpal-Bhālī (P6, Lāiṭwāl), Mārchiz (P8, the Marches) | not cut (the owner: wait for the stack) | nothing on them; their sites stay as `SITES.json` rows | — | **XP5**: cut on world tiles and relief v2, exported with S1, S4, grass, born on the stack; then their held sites (`BUILD-PLAN.md` B4) |

**The horizon bakes** (S1) run per Godot export (`bake_horizon.py <export_dir>`). *Proposed* order: lake-shore (XP1), then
north-shore, then the province cuts as each is exported, `xanadu-oidong-highrift` last (its 1 km cells and its size: the bake
is measured first, as oidong-highrift's was, 8.6 MB of WebP at 250 m).

## 4. The pages

What each needs. **Re-bake**: the page reads region data or has a town entry (`core/world/bake_towns.py`), so relief v2
moves its ground or band. **Glazed**: it draws Xanadu families the M1 promotion takes (section 5). **Export**: it becomes a
Godot place (as Longsong's monastery is) after Stage 8.

| Page | Built? | Re-bake | Glazed | Interiors | Export | When |
|---|---|---|---|---|---|---|
| **Erewhon** (`settlements/xanadu`, `erewhon` target, 6.2 MB) with the citadel and the Dome | yes; the re-seat to 841,1517 owed (its session) | **yes**, once re-seated on the lake-shore region | **heaviest**: `xZel`, `xHaft`, `xMuqT`, `xBTile`, `xPietra`, the marbles, `xTiles` (and the pattern sheets `xMosC`, `xMosD`, `xGiltC`, `xBandC`, `xBandR`, flat since XS0) | **first** (XP2): the citadel | XP1 (the place), XP2 (its `interiors.json`) | the re-seat before Stage 8 (a layout), its look after |
| The kit's sheet (`settlements/xanadu`, `xanadu` and `scrap` targets, 6.0 MB) | yes | no | all families | — | — | the swatch gallery's source (Gate 7) in XP3 |
| **The lake towns** (`settlements/xanadu-lake`, one page, `?town=`) | Māuṭh in progress (A1, cloud) | **yes** (each town's entry re-fitted) | few: the temples' tile bands | XP6 (the lake rooms, `87k1`) | XP1 and XP4 as places | layouts now (phase A); looks after |
| **Phēr** (8.5 MB) | yes | **yes** (12c lists it; `bake_towns.py` `pher`) | the Azure Dream's house, the fair's tiles | XP6 | XP4 | after |
| **Kirstabal** | yes | **yes** (12c) | few; the slate wall (`wall.slate.coursed` owed) | XP6 | XP5 (Siqārp) | after |
| **Gihon** (its session, now) | in progress | yes, when Siqārp is cut | the Mint's and the temple's gold and opal | XP6 | XP5 | layout now; on the ground in XP5 |
| **Thalaba** | yes | yes (the north shore's road; its square is in two regions) | few | XP6 | XP4 | after |
| **Lāiṭwāl** (3.7 MB) | yes | yes, when Ōpal-Bhālī is cut | Tungang's `celadon` and `gilt` (the Glaziers' moonglass is procedural: no family to promote) | XP6 | XP5 | after |
| **Qiblai** (`settlements/qiblai`; a Godot export `godot/data/qiblai` exists from the spike) | yes | yes, when Qāṭarāq is cut | **heavy** (the Qiblai kit's gilt crowns and tiles) | XP6: the eight monasteries' halls (butter lamps: Longsong's case) | XP5 (re-export on `packFormat: 2`) | after |
| **Strongwall** (and the Marches' forts, the Tempest) | fort sheet yes; on the world no | yes, when Gōlḍ-Mārch / Mārchiz are cut | no; **M3 POM** on the rubble and ashlar | the keep's halls, later | XP5 | layouts now; on the ground XP5 |
| **The Beacon** | no page | when Mārchiz is cut | the gold monastery's gilt | later | XP5 | its page's layout now (its session); on the ground XP5 |
| **Viridian**, **the Azure Dream** (5 pages), **the Flashing Eye** | yes | **yes** (their builds read region data) | the monasteries' colours, the Azure Dream's lacquer | XP6 (the Hall of Dreaming's cots: many small rooms) | XP4/XP5 by region | after |
| `kits/xanadu`, `kits/qiblai` (kit bundles `XAK`) | yes | no | yes | the rooms' sets (`kits/interiors/sets/xanadu.js`, `xanadu-citadel.js`) | as `v2_two_maps_oct8` kit packs | XP3 |
| `biomes/xanadu` (6 stations, 7.7-12.6 MB; `xanadu-floor` at 79 % of its cap) | yes | no | no | — | its grasses feed `KratorWorldGrass`'s cards | Stage 8 (KGROUND) only |

## 5. M1 for Xanadu: what is packed how

**The classes** (XS1 writes them; Stage 8's `pack.py` reads them):
- **glazed** (to `xy8` normals on the web, `hemi-oct8` + `mipVariance` in Godot): `xZel`, `xHaft`, `xMuqT`, `xBTile`,
  `xPietra`, the polished marbles (`xMarW`, `xMarK`; `xMarbleB`, `xMarbleW` are `mapOnly`, so flat), `wood.lacquer`
  (`qLacq`), and `xTiles` (the owner's exception). The stack's rule is `specular >= 0.45` and `roughness < 0.35`, judged
  since XS0 on the packed roughness map (`XS1-CLASSES.md`, "Fixes after XS0"): `xMosC`, `xMosD`, `xBandC`, `xBandR`,
  `xGiltC` fail it and are classed flat until Stage 8 glazes them (the owner, 2026-11-23: "Glaze at Stage 8"); `qGilt` fails it too but stays glazed
  (XS1's call on the gilts, kept). Dropped from this list as no
  Xanadu pack carries them: `roof.tile.celadon` (the Eternian kit's), `tile.hex.ceramic` (Pylon's), `wood.lacquer.crimson`
  (the nomads', Islanders', Scyvoi's, tents', Lizardmen's and Longsong's) and the Glaziers' moonglass (drawn procedurally on
  Lāiṭwāl; no library family). Each takes the rule's class when a Xanadu family wires it;
- **flat** (Gate 1: no height range demanded): every `patterns/` sheet the rule does not take, `plaster`, `xWash`, the
  limewash, the metals, and the two ice families (`icewall`, Tungang's `ice`: rule hits, flat by the owner's choice);
- **relief** (M3 planar POM where hero, M4 cavity): `stone`, `brick`, `xSandR`, `xRubble`, `stone.sandstone.ashlar`,
  `stone.marble.ashlar`, `wall.rubble.limewash` (owed), the fort's ashlar;
- **cutout** (added after XS0): `xSun`, `xValance`, drawn with `alphaTest`: lit like flat, never a height in their alpha (Gate 1).

**Where the classes live** (XS1, done 2026-11-23: `XS1-CLASSES.md`): a `"class"` field on each family in the builds'
`materials.json` (`kits/xanadu`, `settlements/xanadu`, `kirstabal`, `thalaba`, `flashing-eye`, `kits/qiblai`, and
`kits/tungang`, whose Glazier set Lightwall draws), read through `tools/textures/mclass.py` from the table
`core/materials/classes/m1-classes.json`. Byte-neutral, proven three ways: today's `pack.py` reads no `class` (nor does the
stack's), each file packs to identical `tex/` with and without it, and all 55 pages and sidecars rebuild identical.
Nothing is re-packed before Stage 8. XS1 added `xTiles` to the glazed list (the domes', bulbs' and drums' tile) and kept
the three `mapOnly` marbles flat (no normal to promote); `XS1-CLASSES.md` section 1.

**The caps.** Promoting a family to lossless `xy8` adds about 340-510 KB of WebP (the stack's measure). The heaviest Xanadu
carriers: `xanadu-oidong-highrift.tex.xanadu.js` (8.5 MB sidecar: every XAK family), `pher.html` (8.5 MB), `erewhon.html`
(6.2 MB). With about fourteen glazed families, the sidecar could grow by 5-7 MB, toward its own 16 MB cap. *Proposed* rule
for the rebuild: promote a glazed family on a page only where it is drawn within hero distance (the citadel's, the temples'),
measure each page after packing, and keep every page and sidecar under 90 % of its cap (`check_budgets.py` warns there).

**Samplers.** WebGL2's 16 per fragment program. `KSHADOW`, `KHORIZON` (two textures), `KGROUND`'s layers and a kit family's
three maps stack up on a region page. XS0 measures every Xanadu page's linked-program samplers with the stage 1 harness; a
page within 3 of 16 takes the `v3_arrays_three_maps` runtime assembly (the `ISLE_ATLAS` pattern) at the rebuild.

## 6. S4: Xanadu's own ground layers

**XS1 wrote the set** (`godot/tools/ground_layer_sets/xanadu.json`; `XS1-CLASSES.md` section 6). It orders the layers by
the six roles `terrain.gdshader` gives the indices (base, wet, high, gravel, rock, pave), so this table's order and two of
its layers changed: valley floor, lake shore, alpine, terraces, caldera rock, courtyard paving (`paving.tiles144`, since
Godot's pave zone selects slot 5); the paddy and the red soil are held. The table below is the plan as first proposed.
`godot/tools/pack_ground_layers.py` packs one six-layer set today. *Proposed*: a set keyed by world style
(`LAYER_SETS = {'default': [...], 'xanadu': [...]}`, written to `godot/data/ground_layers/xanadu/`; `kground_layers.gd` picks
the set from the region's style), six layers so the sampler count does not move:

| Layer | Set | Where (the `xanadu` style's ground classes) |
|---|---|---|
| 0 grass | `ground.grass.lush` (the global layer, shared) | meadows, orchard floors, the rim plain |
| 1 terrace | `ground.terrace.field` | the lake towns' terraces, the tea gardens, the Vale's fields |
| 2 red soil | `ground.redsoil` | the Vale's bare earth, the Cataracts' slopes, lanes |
| 3 paddy | **`ground.paddy.wet`** (new, section 60; stand-in `ground.brown_mud_02`) | the Vale's rice paddies, the lake's flooded margins |
| 4 shore | `ground.shingle`, `stone.ghat.wet` at the landings (section 59) | the lake shore, the quays' foot |
| 5 caldera rock | `rock.tuff` (or `rock.basalt.vesicular` on the volcanoes' flanks) | the caldera wall, the cones, the Spillway gorge |

Courtyard paving stays a building's material (`xTiles`), not a ground layer: the town tiles carry it. The web keeps
`KGROUND` as it is (the owner's engine split, section 12).

## 7. The Godot side

- **Exports.** `godot/tools/export_spike.py` and the world-stream export, on `packFormat: 2`: `world-xanadu-lake-shore` (XP1),
  `world-xanadu-north-shore`, `world-xanadu-oidong-highrift` (XP4), the six province regions (XP5). Each with its
  `horizon/` (S1), `tools/check_godot_exports.py` clean. Places inside them as Longsong is (`places/<site>-<name>/`):
  Erehwon's citadel first.
- **`KratorWorldGrass`** (`world_grass.gd`): the sward's masks (water, cliffs, roads, footprints, paved courts) plus, for
  Xanadu, *proposed*: the paddies (layer 3) and terrace risers (slope over the bench's) off; the root colour from the
  Xanadu layers; the plume card from the Vale's grasses (`biomes/xanadu`'s, or `card.grass.thatch`). Tuned on the slice's
  route stops, inside the route's frame budget.
- **`KInteriorsLight`** and `library_interior.gdshader`: Erewhon's citadel's `interiors.json` v2 (XS2's room graph, XP2's
  export), `INDOOR_LAYER = 2` sun and sky mask, the room table's daylight and lamp bounce, the room-gated `OmniLight3D` pool
  with 2 shadowed hero lamps, the corner AO. The Pleasure Dome's open oculus and the jali screens are the new cases
  Longsong did not have: a skylight portal (`KROOMLIGHT.buildTable` takes skylights) and a pierced screen counted as a window
  of reduced aperture (*proposed*).
- **Tests**: `wrelief_test.gd` v2 goldens; `route_harness.gd` with the `xanadu` stops; `stage7_interiors_test.gd`'s probes
  extended to the citadel (section 8); `m1_slice_test.gd` for the glazed swatches.

## 8. Routes and gates

**The `xanadu` route** (`tools/route_harness.py` track, `route_harness.gd`), four stops at 12:00, 16:20, 22:00 (the stack's
hours); XS1 wrote them as data, keyed to site ids, the pages' named views and the kit's blocks
(`tools/route_tracks/xanadu.json`; `XS1-CLASSES.md` section 7):
- `city_block`: Erewhon's citadel, the Golden Way;
- `water_ground`: Phish-Mārkiṭ's quay (or Māuṭh's until the west round is built), across the lake to the caldera wall;
- `forest_edge`: Gārḍan's walled orchards (or Phēr's rim plain until then);
- `door_transition`: through the Vizier's palace door into its hall (the interiors track's stop).

**Gate 5 for the citadel** (XP2): three probes, as Longsong's: the Vizier's audience hall, a harem room off the Dome, a
kitchen in the citadel's service court; the paired negative (`mask_sun = false` must leak). The Dome's oculus: a fourth
probe that **must** see the sky under the opening and none of it a metre outside it.

Each session's gates: XS1 gates 1 and 3 on the classes; XP1 gates 2, 8 and the route; XP2 gate 5; XP3 gates 1, 3, 7; XP5
gates 2, 8 per region.

## 9. The sessions, interleaved with `BUILD-PLAN.md`

**Before Stage 8** (beside phase A; data only, no page's bytes change but new builds'):

| # | Session | Brief | Waits on | Est. |
|---|---|---|---|---|
| **XS0** | Measure | On a test branch off `claude/vertical-stack` (not committed to pages): every Xanadu page's linked-program samplers, video memory and bytes with the stage 1 harness; which pages are within 3 samplers of 16; the glazed families each page draws | nothing | 1 (small) |
| **XS1** | Material classes and the Xanadu S4 table (**done 2026-11-23**, `XS1-CLASSES.md`; XS0's reconciliation open) | The classes of section 5 for every Xanadu `materials.json` (or the sidecar), proven byte-neutral; the `xanadu` layer set in `pack_ground_layers.py` (Godot data only); the route's stop definitions | XS0 | 1 |
| **XS2** | The citadel's room graph | Erewhon's citadel rooms as `[G data]`: rooms, doors as portals, windows, the oculus as a skylight, the jali as reduced windows, the lamps, each with its room id; `KROOMLIGHT.buildTable` run on it in a node test with negatives (the oculus lights its room only, a vault-like store stays dark); no page change | nothing (the Erewhon session's re-seat does not move rooms) | 1: **built 2026-11-23** (below) |
| (phase A) | the settlements | `BUILD-PLAN.md` A1-A10 continue: layouts, records, sheets | | |

**XS2, built (2026-11-23, branch `claude/citadel-room-graph`).** `core/interiors/` from the stack: its module as fixed on
`claude/roomlight-fixes` (below), its `test-roomlight.js` the stack's own (the fixed one needs that branch's Longsong). The graph:
`settlements/xanadu/citadel/rooms/89yr-xa-citadel-rooms.js` (`XACITR`, `[G data]`), read only by its node test
`settlements/xanadu/tests/test-citadel-rooms.js` (with `citadel-load.js`): `build.py` takes every digit-named file in `src/`,
so the fragment stays out of it until XP2 wires it in beside 89y. Rebuilt with and without it, `erewhon.html` and `xanadu.html`
are the same bytes. (Both already differ from the committed pages and `PORT-BASELINE.json` on this branch's base: the kit's
sources, 78b, 78m, 78n, 84, 85b among them, moved after the pages of 2026-11-16. XS2 left them as committed.) Derived from the records the page builds: the ten buildings of `CIT_SITES` from the citadel's interior set
(windows on `xcPlan`'s own rule, 78n), the Pleasure Dome from `xdomePlan()` with 78o's patch, and 78d's clerestory, drum,
gored-dome eyes, stair-hall skylight and chandeliers; the test checks each against what 78d and 78n draw (run under a
recording stub), so the data cannot drift from the page unseen.
- **Counts:** 163 rooms (150 roofed, 13 open courts and terraces; the Dome 31, the Sultan's palace 46, the Vizier's 13, each
  dar 13, the temple 5, the kitchens 3); 215 portals (164 with a leaf, 51 open: arches, voids, flight heads, rails, the open
  balcony windows); 823 windows (256 jali, aperture 0.44 to 0.55 with the proposed jali open fraction 0.35); 6 skylights (the
  oculus, the rotunda's and the pool's three gored eyes, the stair hall's); **26 lamps** (the Dome's 20 chandeliers; the
  palace forecourt's 4 and the Vizier's garden's 2 lamp posts). The furniture's lamps come from `KFURN`'s `plan.lights` at
  export (XP2): they are built by the catalog, which needs THREE.
- **The table (leaves shut, core/door's default):** 141 roofed rooms lit by day, 9 dark, each named with its reason
  (`XACITR.DARK`): the west range's upper store, the barracks' store, the ice house; the Ramp of the Sultan's tower and its
  two landings; the palace's service stair and its head; **the Court Temple's prayer hall** (rooms on every side, its dome on
  a solid slab: no opening in the page). The oculus alone lights the hall at 0.85 (by its open area) and only the nine rooms open portals join
  to it. Every room is reachable on foot.
- **Lit since (2026-11-23, branch `claude/citadel-furnishing-cb5e01`; the owner: "we should give the ramp and the stair some
  kind of light source; same for the temple areas"):** the six are no longer dark. The citadel's set gives a room its own lamps
  (`room.lamps`: wall lanterns, niche lamps, mosque lamps, polycandelons; 78n draws them through 78m `xmLamp`) and windows set
  by hand where the rule draws none (`room.wins`: the Ramp's three slits, the service stair's two lights and its head's one
  over the east range's roof, the prayer hall's clerestory of 22 jali lights over its side rooms' roofs); XACITR reads both. Now
  851 windows (278 jali), **50 lamps** (24 set in rooms: the Ramp 4, its landings 1 each, the stair 2, its head 1, the hall 12,
  the kora 3), and 3 rooms dark, the three stores. `test-citadel-rooms.js` section 7 holds it (23 checks);
  `settlements/xanadu/citadel/FURNISHING.md`, "Light", has the room-by-room table.
- **The stack's module, fixed (2026-11-23, branch `claude/roomlight-fixes` off `claude/vertical-stack`; this branch carries
  the same `10-core-roomlight.js`):** a window and a skylight take an `aperture` (the jali's 0.35, *proposed*), in the table
  and in `pickPool`; a door takes `shut` (or `o.shut(room, door)`, core/door's live state), so a leaf is a wall to the light;
  a room takes sized `skylights`, and `pickPool` reads a `sky: true` window as a column of light down from its opening (the
  oculus 41 m up lights the hall's floor; the Godot twin `pick_pool` the same); Longsong's two skylit rooms are named in
  its own `40g` (outside `40c`, whose text keys its interiors bake) instead of the module naming them; `STAGE-6-7-REPORT.md` 2.1 describes the code; `test-roomlight.js` is on
  `tools/ktest.js`. Without the new fields every table is what it was: Longsong's, byte for byte. Still open there: the
  Godot `pick_pool` was already apart from the JS before (a window's energy 1.25 against 1.35; the night factor), left as
  it was: looks, after Stage 8.
- **Owed to the owner, looks for after Stage 8:** the Ramp of the Sultan and the service stair dark by day (a window, a lamp,
  or as built); the prayer hall's light (a lantern under its dome, or its doors open at prayer).

**Stage 8** (the owner's all-builds rebuild): takes XS1's classes into the packing, turns `relief.micro: 2` on for the three
Xanadu regions, re-bakes Phēr, Kirstabal, Viridian, the Azure Dream, the Flashing Eye and the lake towns' entries, and
carries phase A's ride-along items (`BUILD-PLAN.md` phase C).

**After Stage 8:**

| # | Session | Brief | Waits on | Est. |
|---|---|---|---|---|
| **XP1** | The slice: Lake Shore + Erehwon | Godot export of `xanadu-lake-shore` (S1 horizon, S3, S4 Xanadu layers, grass, the lake), Erehwon and the built lake towns as places; the `xanadu` route's baselines on the Arc, the RTX and in Godot; shots at the three hours; the report (`XANADU-SLICE-REPORT.md`) | Stage 8; Erewhon re-seated | 2 |
| **XP2** | The citadel's interiors | `interiors.json` v2 for the citadel; `KInteriorsLight` on it; the web's room-gated lamp pool; Gate 5 with the oculus probe | XP1, XS2 | 1-2 |
| **XP3** | Surfaces | The Xanadu and Qiblai kits as `v2_two_maps_oct8` packs in Godot; M2-M4 on the citadel's walls and the forts' rubble; the swatch gallery for the glazed families (Gate 7) and the handedness probe (Gate 3) | XP1 | 1 |
| **XP4** | The other two regions | `xanadu-north-shore` and `xanadu-oidong-highrift` exported (horizon, grass); Phēr and Thalaba as places | XP1 | 1 |
| **XP5** | The six province regions | Cut on world tiles and relief v2, exported with S1, S4, grass (`BUILD-PLAN.md` B3); then the held sites placed once (B4: Theodiga's ring, the mines, the Marches' forts, the countryside samples, and the owned places on them: Qiblai, Kirstabal, Gihon, Lāiṭwāl, Strongwall, the Tempest, the Beacon, Viridian, the Flashing Eye) | XP1 | 2 + the owned sessions' |
| **XP6** | Interiors rollout | The kit's room sets (`kits/interiors/sets/xanadu.js`, the lake rooms `87k1`) on the room table: the lake towns' temples and houses, Qiblai's monasteries, the Azure Dream's Hall, Phēr's and Kirstabal's interiors; Gate 5 on one of each kind | XP2 | 2 |

About **3 sessions before Stage 8 and 9-10 after** (est.), with the owned sessions' turns in XP5.

**How it interleaves.** Phase A builds every Xanadu layout before Stage 8 (the lake towns, the isles, the camps, the forts'
and mines' sheets, the owned sessions' pages). Stage 8 then rebuilds them all on the stack once. After it, the XP sessions
add only what Stage 8 does not (exports, interiors, Xanadu's tuning), and XP5 cuts the six regions and places what waited
for them directly on the stack: those are built once, on it. Nothing is re-laid; looks are tuned once, after Stage 8.

## 10. Textures

New (`core/materials/PROMPTS-NEEDED.md` section 70, 60 on the Xanadu plans branch): `ground.paddy.wet` (S4 layer 3) and `tile.dome.bannai` (the glazed
brick of the domes: the M1-M2 case of a curved glazed surface, the Pleasure Dome and the temples' drums). Owed and wanted
here: section 59 (`stone.ghat.wet` for S4's shore), 54 (`wall.rubble.limewash`: M3's fort walls), 41 (the citadel),
`patterns/xanadu/jali` (the citadel's screens, owed in `settlements/xanadu/materials.json`). Each lands in today's
packing; Stage 8 packs it with the rest.

## 11. Open, for later (each with the default the sessions take)

- The Pleasure Dome's oculus: is it open to the sky? *Default:* open (a skylight portal), as the probe in section 8 assumes.
- The grass card for the Vale: *default* `card.grass.thatch` until `biomes/xanadu`'s own grasses are packed as cards.
- `xanadu-oidong-highrift`'s horizon bake at 1 km cells: *default* bake it last and measure; drop it if its WebP is over
  its export's budget, the province regions carrying the horizon instead.
