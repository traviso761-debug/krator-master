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
- [ ] **Metal copper reads black on large surfaces.** `copper` (the library's `f_bronze`, metalness .75) has no environment
      map to reflect, so a dome or a disc draws near black; small finials and burners read. The scouts' tower takes a stone
      dome and the light-well mirror a matte bronze colour (`plain`) until the page has an environment (P5's light).
- [ ] **The fields' crops are cards** (two crossed planes of the library's cut-out sheets, `zfCard`): they read from the
      sheet's distance, flat close up. Fine for P5's terraces seen from the wells' rims.
- [ ] **The temple's sky dome is a canvas stand-in** (`ZK_SKY` in `48-zj-sacred.js`: the sun, the ringed gas giant, four moons,
      stars, a gilt band at the rim). The owner replaced the lattice there (underground it showed only rock); the lattice is
      the outpost's shrine now (`zj_shrine`). A painted texture would replace the canvas: save it as `patSkyDome` (a pattern
      sheet, 2:1, its bottom edge the dome's rim), add it to `materials.json`, and map `MAT.skyDome` from the pack. The prompt:

      > A seamless equirectangular painted sky, 2:1 (2048x1024), for the inside of a temple dome, in the manner of a flat mural on
      > lime plaster: a deep indigo sky shading from midnight blue (#0b1030) at the top edge to dusky violet-blue (#3d4f8c) near
      > the bottom; scattered small gold and white stars; in the left third a stylised golden sun with alternating long and short
      > rays; right of centre a large banded gas giant in ochre, rust, cream and brown bands, a tilted pale ring passing in front
      > of and behind it; four small moons of different sizes and tints (pale grey, sand, pale blue, peach) across the sky; along
      > the bottom edge a band of gilded zigzag ornament. Flat even light, no perspective, no landscape, no text; the left and
      > right edges meet seamlessly.
- [ ] **The temple's lattice glows only in the dark.** (Historical: the lattice is gone from the temple; see the sky dome.) On the kit sheet night barely darkens the stone (see the underground's
      light above), so the lamplit shell behind the jali shows little; Dhelv's light (P5) is where it reads.
