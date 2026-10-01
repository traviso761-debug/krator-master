# Known issues

Open items start with `- [ ]` (build.py prints them after every build).

- [ ] Polygon stamp edges are not grid-aligned: a wall standing on a polygon edge shows the ground's cliff as a slope up to one grid cell (~10 m) wide. Use rects under walls.
- [ ] `port-clearance` tests REGISTER circles, so a long building registered as one circle overhangs the 8 m band on paper. `portShed` registers a row of circles; do the same for long things. It is a soft check.
- [ ] The ancients' `trees()` and `figures()` are unusable here (local/world mix-up and y=0 respectively). Use `portTrees` / `portFigures`. Fixing them belongs in voth/ancients.
- [ ] Materials created inside a builder (`new THREE.MeshStandardMaterial` at build time) do not get the underwater fade. Put them in `MAT` at top level.
- [ ] Rail tracks do not join across an offset junction (each segment lays its own at its own z) and have no buffer stops at a run end.
- [ ] Natural-coast trees (`portNatureScatter`) are the ancients' leaf-card trees and read as dark blobs from high above.
- [ ] Water is a single transparent sheet with a fresnel rim: at very low grazing angles it goes milky-pale rather than mirroring the sky.
- [ ] The dry-pit fade mask is per rect (a polygon `dry` stamp masks its bounding box) and holds 16 rects; more dry stamps than that fade normally beyond the 16th (reported on the error panel).
- [ ] Vessels moored by the layout (`portMoor`: the showcase's Panamax and feeder alongside the platform chain) float free at d=1 in deep water - the ruined vessel's own list and settle only; nothing grounds them.
- [ ] The segment-boundary labels are screen-sized sprites: at showcase overview distance neighbouring labels overlap.
- [ ] A coastal segment does not finish its N (land) edge: with no land block behind, its apron meets natural ground through its stamp's soft ring, as before; with a block behind, the two decks are flush (nothing needed).
