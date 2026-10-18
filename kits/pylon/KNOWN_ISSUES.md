# kits/pylon: known issues

`build.py` prints the open ones (`- [ ]`) on every build.

- [x] No `materials.json` yet. **2026-10-18:** `materials.json` binds `pyConc` to `concrete.board` (src/88yp-pyl-matlib.js,
      packed into tex/); the hex tile, hex grille and worn orange render were owed in core/materials/PROMPTS-NEEDED.md.
- [x] **Delivered and wired 2026-10-18** (owner-tex2b batch): `pyHexTile` (tile.hex.ceramic, grey, tinted by the instance
      colour: the hex villa's court and the palace forecourt, `pynHexPave`) and `pyGrille` (patterns/pylon/hex-grille, a
      full-colour alpha card: the hex villa's porthole grilles, `pynPortCluster(..., true)`; the flat panel `pynGrille` is
      ready; `pyGrilleD`, the porthole's disc, takes the same family by alias). The worn orange render went to Talia
      (`taRenderW`). With `?mat=proc` the old slab and six radial bars draw.
- [ ] The Ancients' hex-lattice dome (the palace's great dome and pavilion caps: `acLatticeDome`, the Ancients core's) is
      geometry, not a card, so the hex grille is not on it; the hex pods' glazing, and the other courts (`vnPaving`
      flags) stay on the Vernacular's flags.
- [ ] The folk house's balcony front is a scalloped wall in 15 straight segments, not a curve; it reads as a curve from
      the street, but steps show close up.
- [ ] `verify.py --assert` passes every invariant but ends FAILED on `WebGL: CONTEXT_LOST_WEBGL` in the console: the
      same as Iziz's own pages (settlements/iziz/KNOWN_ISSUES.md, 2026-10-05; checked on `iziz-vernacular.html`
      2026-10-18, same result). The harness's teardown, not the page.
- [ ] The rich villas' court walls are board-formed concrete in PYPAL.formwork grey; beside the Vernacular's sand they
      read heavy at eye level. A lighter formwork (or white render on the walls) is the owner's call.
- [ ] The hex cells' honeycomb has its plank walks and stair at the back (a front walk would cut the offset pods), so
      from the street the pods show no access.
- [ ] The Monolith is read in place (`kit.json` "external"), but two helpers it needs at load live inside other
      arcologies' builders: `krShard` in the Arcube (all four parts, 93 KB) and `plymQuadGeo` in Plymouth (61 KB). So
      the page carries about 150 KB of builders it never calls. The fix is upstream: move the two helpers into a shared
      fragment in kits/ancients (every Ancients page then rebuilds; check its hashes), and read only that.
- [ ] On the sheet the Monolith's view looks past the edge of the ground plane (Iziz's showcase ground, 3 km); the
      city page will have terrain to the horizon.
