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
- [x] **The temple's sky dome was a canvas stand-in.** The owner's painting arrived (2026-10-07): the library's
      `patterns/zeijani/sky-dome` (`patSkyDome`; processed with `--seam-axes x`, so it wraps round and keeps its gilt band
      at the rim). Wrapped once round a hemisphere a 2:1 sheet looked warped (2x wide at the rim, pinched at the crown), so
      `tools/textures/dome_sheet.py` reworks it: its own sky continued to twice the width, sky added above so the sun and the
      planet sit in the dome's lower half, the crown starless. The canvas in `ZK_SKY` is the procedural fallback.
      **Review 3 (2026-10-08):** it still looked distorted, so the owner painted the sky as a disc: the dome now maps it polar
      (the disc's centre at the zenith, its gilt band at the rim: nothing stretched; batch `zeijani-skydome-disc-2026-10.json`,
      `process.py --seam-axes none`), painted inside only, with stone (`zfDome`) over it outside. The sanctum lamp's halo is a
      small one (the big one filled the view from the podium's top, a pink disc). The procedural fallback is still the old wrapped
      canvas and reads stretched on the polar map.
- [x] **The temple's podium stair stopped a walker at its head** (the owner: trouble on the ramp in walk mode). The walk map's
      blocks are upright boxes on the world's axes; a carved site's block was the box round two of its corners, so at Dhelv's
      temple (turned 60 degrees) a podium side's 24 m block lay across the stair. A turned block is now cut into 0.8 m pieces,
      each the box round its four corners (`40-zj-cave.js`, `cvFromItem`'s blocks); and the terrace's slot for the stair now
      overlaps its head by 0.15 m (an exact abutment had left a hairline with no floor).
- [x] **The temple's lattice glows only in the dark.** (Historical: the lattice is gone from the temple; see the sky dome.) On the kit sheet night barely darkens the stone (see the underground's
      light above), so the lamplit shell behind the jali shows little; Dhelv's light (P5) is where it reads.
- [x] **The council's flank stairs broke out under the frieze** (the owner: the opening and the relief badly placed; the side
      exit blocked). The flanks' moulding, frieze and pilasters left the wrong stretch; they now leave the stairs' (local x 4 to
      6.6 west, -6.6 to -4 east, `49-zj-civic.js`).
- [x] **The fountains showed no water**: the water was a disc inside the solid basin. The basin and the bowl are rims round a
      floor now, the water under the rim, the streams pale (`54-zj-square.js`).
- [x] **The stone door's lintel fought the masonry wall Dhelv adds round it** (their soffits shared a plane): the wall's pieces
      stand clear of the jambs and over the lintel (`53-zj-additions.js`).
- [x] **The cut-away's boxes had no top**: a box now stops over its site's height when the world gives one (`CV_BOXCUT`, uBoxB.w).
- [ ] **Stale words in headers and the plan** (found writing API.md, 2026-10-08): `36-def.js` documents a def field `carve`
      no def uses and leaves out `originFront`, `sunk` and `note`; `verify.py`'s docstring speaks of tents (from Scyvoi) and
      its footprint check's message says + 0.8 m where the threshold is 1.6 m; `build.py`'s docstring leaves `core/sockets`
      out; `91f-furnish.js` and `91n-night.js` still say tents. PLAN.md section 4 names a `kit_bundle.py` (`KratorZeijani`)
      that was never made, and 6.5 an export from the kit sheet (only Dhelv's page exports). `zjLife` and `ZJ_LIFE` are
      defined but no def calls them, so the `life-records` check has nothing to check.
