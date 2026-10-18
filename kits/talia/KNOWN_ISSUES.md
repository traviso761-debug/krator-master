# kits/talia: known issues

`build.py` prints the open ones (`- [ ]`) on every build.

- [ ] No `materials.json` yet: the kit draws in the Vernacular's library sets (Iziz's pack); its marble is the plaster
      map at a lower roughness and its tile the shingle map tinted terracotta. Talia's own (lime-wash render, white
      marble, orange mosaic, meander border, jali, the star rose, worn orange render) wait for the owner's agreement on
      the list (PLAN.md section 7).
- [ ] A loggia (`tanLoggia`) is a real recess only up to the arch's springing; the round head above it is a dark disc on
      the front plane, so from a high angle the head reads as a plate. A hollow body (the interiors set) would cut it.
- [ ] Arched windows elsewhere (`tanArch`) are fills on the wall plane, as the Vernacular's windows are, not recesses.
- [ ] The hill stack stands on a white retaining mass so it builds on the flat sheet; `o.slope` is not read yet. On the
      city page the site's terrain should carry the tiers (PLAN.md section 9: Talia is on a hill).
- [ ] `verify.py --assert` ends FAILED on `WebGL: CONTEXT_LOST_WEBGL` in the console: the same as Iziz's own pages and
      Pylon's (settlements/iziz/KNOWN_ISSUES.md, 2026-10-05). The harness's teardown, not the page.
