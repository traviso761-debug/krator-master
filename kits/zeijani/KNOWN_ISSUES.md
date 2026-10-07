# kits/zeijani: known issues

- [ ] **One cell size per cavern (0.5 m).** PLAN.md section 7 asked for 1 m cells in the tubes and 0.5 m near the rooms; two
      sizes meeting at a chunk seam crack it (surface nets has no stitching), so the cavern meshes everything at 0.5 m and Dhelv
      will draw its chunks near the camera only. About 2M triangles is the estimate for Dhelv.
- [ ] **Non-manifold edges where a sliver is thinner than a cell** (a light well's lip on sloping ground: 8 of 56,000 edges in
      the module's test block). Surface nets puts one vertex in a cell that holds two sheets; no hole results. Budgeted in
      `test-cavern.js` (under 0.1%).
- [ ] **The underground is lit like the surface on the kit sheet.** The cave's own light (the sky faded under rock, a lamp
      that follows the camera, the wells' shafts and motes) is Dhelv's (P5), after the tube station's.
- [ ] **`core/walk`'s polygon floor is new.** Godot's walk importer (`godot/`, Verge's) reads `rect` and `strip`; `poly`
      needs adding there (P7).
- [ ] **The sockets example sheet does not build from today's sources** (`core/sockets/example`: Post-Apoc's geometry now
      calls `KMAT`): pre-existing, not this kit's; its committed page predates it.
- [ ] **The two-storey house's roof terrace is drawn, not planned.** No stair reaches it and it has no walk floor; the
      interiors planner has no roof storey. Its pieces stand on the slab (`46-zj-built.js`).
- [ ] **Windows are open holes** (no shutters, grilles or jali). The `jali` cut-out is on the page now (the temple's dome);
      windows could take it.
- [ ] **The temple's lattice glows only in the dark.** On the kit sheet night barely darkens the stone (see the underground's
      light above), so the lamplit shell behind the jali shows little; Dhelv's light (P5) is where it reads.
