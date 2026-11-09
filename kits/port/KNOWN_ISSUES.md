# Known issues

Open items start with `- [ ]` (build.py prints them after every build).

- [ ] Polygon stamp edges are not grid-aligned: a wall standing on a polygon edge shows the ground's cliff as a slope up to one grid cell (~10 m) wide. Use rects under walls.
- [ ] `port-clearance` tests REGISTER circles, so a long building registered as one circle overhangs the 8 m band on paper. `portShed` registers a row of circles; do the same for long things. It is a soft check.
- [ ] The ancients' `trees()` and `figures()` are unusable here (local/world mix-up and y=0 respectively). Use `portTrees` / `portFigures`. Fixing them belongs in kits/ancients.
- [x] Materials created inside a builder (`new THREE.MeshStandardMaterial` at build time) do not get the underwater fade. Put them in `MAT` at top level. - 2026-11-08: audited `src/` and `targets/`: every lit material is a top-level `MAT.*` (patched by `portUnderwaterPatch`, 90-scene.js) or a deliberate unpatched twin (82-dd-dock.js's `DDM`, the dry pit); no builder makes its own `MeshStandardMaterial` any more, so nothing was moved. The rule stands for new code (71-port-terrain.js's comment).
- [ ] Rail tracks do not join across an offset junction (each segment lays its own at its own z) and have no buffer stops at a run end.
- [ ] Natural-coast trees (`portNatureScatter`) are the ancients' leaf-card trees and read as dark blobs from high above.
- [x] Water is a single transparent sheet with a fresnel rim: at very low grazing angles it goes milky-pale rather than mirroring the sky. — 2026-10-13: the sea is core/water's (`71w-port-sea.js`): it reflects the page's sky through core/atmos's skylight.
- [ ] The dry-pit fade mask is per rect (a polygon `dry` stamp masks its bounding box) and holds 16 rects; more dry stamps than that fade normally beyond the 16th (reported on the error panel). Since 2026-10-13 the sea (core/water) is cut out of the pits by the same rects, so a polygon `dry` stamp also loses the water over its whole bounding box (the old sheet was cut cell by cell).
- [ ] Vessels moored by the layout (`portMoor`: the showcase's Panamax and feeder alongside the platform chain) float free at d=1 in deep water - the ruined vessel's own list and settle only; nothing grounds them.
- [ ] Nothing rides the sea. It is core/water's open water since 2026-10-13 (`WATER.heightAt`, `WATER.ride`), but the vessels and boats are baked (`pbFlush`, `kbake`), so the sea is kept calm (`PORT_SEA_FIELD` .25: at most 14 cm from y=0) and they keep their waterlines. A vessel that rides needs its own group.
- [x] The segment-boundary labels are screen-sized sprites: at showcase overview distance neighbouring labels overlap. - 2026-10-20: `portBoundsDeclutter` (92-camera.js, called from `frame`): every 4th frame the labels are projected, nearest first (ties by build order), and one overlapping a kept label eases out (opacity), so neighbours no longer pile up. Hook takes the same fragment.
- [ ] A coastal segment does not finish its N (land) edge: with no land block behind, its apron meets natural ground through its stamp's soft ring, as before; with a block behind, the two decks are flush (nothing needed).

## Real doors and real glass (2026-11-03, core/door)

The owner's "remove all dark voids ... actual doors or windows that have transparency". Before: the dead window cells
(`cellD`) and dead panes (`paneD`) were near-black plates (this fork's `MAT.winDead` is core/materials' opaque 0x07090c), the
iron doors (`pkDoor`) and the kit's `archOpen` plates with no record. Now `build.py` reads core/door (10, 20, 90) and the
Ancients kit's `kits/ancients/src/8zo-anc-open.js` in place (`DOOR_FILES`, which Hook and the Dam Basins read too), and
`src/8zp-port-open.js` adds the iron door to it:

- [x] A dead cell or pane is a room card behind its glass (a dusty pane in two of five, an empty hole onto the room in the
      rest); an intact window item is a pane before a card, two in five lit at night.
- [x] Every `pkDoor` and `archOpen` is a locked KDOOR record (`<type>/<decay>.pkDoor.<n>`): the buildings are solid bodies;
      a door the ruin threw down flat is not recorded. `window._openings` gives the counts.
- [ ] The lit windows (`dot`, an unlit warm box) and the curtain glass (`pane`, MAT.glass) are as they were: lit cells and
      real transparent glass. The terminals' and the authority's own glazing (their fragments' MAT.glass bands) likewise.
- [ ] No walls in core/walk and no interiors: no reachability audit here.

## Level of detail (core/lod)

- [x] No LOD: every triangle was drawn at every distance. `core/lod` now takes over the scene (README, "Level of
      detail"): 9.06 M to 1.08 M triangles at the showcase overview, 8.98 M to 1.97 M at eye level on the quay.
- [x] LOD cut the terrain's 29 strips into chunks, each its own draw: up to 110 more draw calls at eye level. Fixed in
      core/lod: a split mesh draws its chunks combined, one draw per level in view. Eye level on the quay is now 659
      calls with LOD (693 without), the overview 777 (879).
- [ ] The first zoom-out builds the terrain's proxies, one strip per frame (tens of ms each on a normal machine, about
      10 s in all on the shared SwiftShader box). A verify count should call `LOD.flush()` first.
- [ ] **The shared Ancients MAT takes library sets** (`KMAT.bindMat` with `KMAT.ANCIENT_TILES`; materials.json), except `rust`,
      which stays procedural: the library rusts smear into stripes on the stretched beam and tank UVs. ?mat=proc shows the old look.
- [x] **The Port kit takes the material library** (2026-10-06): containers (pkCont, metal.container) and paving (pkPave, concrete.slab), at
      their metre UVs (tiles 3 and 16 in the bind). The paving set's joints read fainter than the procedural 4 m grid; pkContR and pkPaveR stay procedural.

## Voth census trades (2026-10-19)

The table `PORT_TRADES` (`src/89x-port-trades.js`) says which building carries each of the Voth city's 44 trades (`tools/trades_census.json`); `verify.py --assert` checks it (`voth-trades`). 13 carried, 1 partly, 6 gaps, 24 na of 44.
The kit's segments and vessels house only the harbour rows (the town trades are `na`: Hook's town buildings carry them).

Missing buildings (gaps) and partly carried trades:

- [ ] innkeepers and grooms: a travellers' hostel by the passenger terminal (tmPass)
- [ ] town guard: a watch house on the quays (the Port Authority's gatehouses exist only in its reclaimed state)
- [ ] shopkeepers and assistants: a chandlery or harbour shop
- [ ] innkeepers and servers: a harbour tavern or seamen's mess
- [ ] power-house stokers and engineers: a port power house or substation (the tank farm holds fuel only)
- [ ] ferrymen: a ferry landing (hbHaven has a small landing pontoon, tmPass the liner berth; neither runs a ferry)
- [ ] granary keepers and millers: no mill: the board-formed silos with their elevator tower store bulk goods only
