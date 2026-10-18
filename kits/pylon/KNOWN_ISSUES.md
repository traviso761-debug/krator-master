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
