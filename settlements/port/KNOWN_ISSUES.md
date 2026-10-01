# Known issues

Open items start with `- [ ]` (build.py prints them after every build).

- [ ] Polygon stamp edges are not grid-aligned: a wall standing on a polygon edge shows the ground's cliff as a slope up to one grid cell (~10 m) wide. Use rects under walls.
- [ ] `port-clearance` tests REGISTER circles, so a long building registered as one circle overhangs the 8 m band on paper. `portShed` registers a row of circles; do the same for long things. It is a soft check.
- [ ] The ancients' `trees()` and `figures()` are unusable here (local/world mix-up and y=0 respectively). Use `portTrees` / `portFigures`. Fixing them belongs in kits/ancients.
- [ ] Materials created inside a builder (`new THREE.MeshStandardMaterial` at build time) do not get the underwater fade. Put them in `MAT` at top level.
- [ ] Rail tracks do not join across an offset junction (each segment lays its own at its own z) and have no buffer stops at a run end.
- [ ] Natural-coast trees (`portNatureScatter`) are the ancients' leaf-card trees and read as dark blobs from high above.
- [ ] Water is a single transparent sheet with a fresnel rim: at very low grazing angles it goes milky-pale rather than mirroring the sky.
- [ ] The dry-pit fade mask is per rect (a polygon `dry` stamp masks its bounding box) and holds 16 rects; more dry stamps than that fade normally beyond the 16th (reported on the error panel).
- [ ] Vessels moored by the layout (`portMoor`: the showcase's Panamax and feeder alongside the platform chain) float free at d=1 in deep water - the ruined vessel's own list and settle only; nothing grounds them.
- [ ] The segment-boundary labels are screen-sized sprites: at showcase overview distance neighbouring labels overlap.
- [ ] A coastal segment does not finish its N (land) edge: with no land block behind, its apron meets natural ground through its stamp's soft ring, as before; with a block behind, the two decks are flush (nothing needed).

## Level of detail (core/lod)

- [x] No LOD: every triangle was drawn at every distance. `core/lod` now takes over the scene (README, "Level of
      detail"): 9.06 M to 1.08 M triangles at the showcase overview, 8.98 M to 1.97 M at eye level on the quay.
- [x] LOD cut the terrain's 29 strips into chunks, each its own draw: up to 110 more draw calls at eye level. Fixed in
      core/lod: a split mesh draws its chunks combined, one draw per level in view. Eye level on the quay is now 659
      calls with LOD (693 without), the overview 777 (879).
- [ ] The first zoom-out builds the terrain's proxies, one strip per frame (tens of ms each on a normal machine, about
      10 s in all on the shared SwiftShader box). A verify count should call `LOD.flush()` first.
