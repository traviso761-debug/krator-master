# kits/pylon: known issues

`build.py` prints the open ones (`- [ ]`) on every build.

- [ ] No `materials.json` yet: the kit draws in the Vernacular's library sets (Iziz's pack). Pylon's own (Ancient white
      shell panel, board-formed concrete, hex tile, hex grille, worn orange render) wait for the owner's agreement on
      the list (PLAN.md section 8).
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
