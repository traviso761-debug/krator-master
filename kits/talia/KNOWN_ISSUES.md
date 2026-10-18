# kits/talia: known issues

`build.py` prints the open ones (`- [ ]`) on every build.

- [x] No `materials.json` yet. **2026-10-18:** `materials.json` binds `taMarble` (stone.marble.ashlar), `taGilt` (metal.gold)
      and `taTile` (roof.clay_roof_tiles) (src/88yt-tal-matlib.js, packed into tex/); the honeycomb mosaic, meander, jali and
      rose window are owed in core/materials/PROMPTS-NEEDED.md.
- [ ] A loggia (`tanLoggia`) is a real recess only up to the arch's springing; the round head above it is a dark disc on
      the front plane, so from a high angle the head reads as a plate. A hollow body (the interiors set) would cut it.
- [ ] Arched windows elsewhere (`tanArch`) are fills on the wall plane, as the Vernacular's windows are, not recesses.
- [ ] The hill stack stands on a white retaining mass so it builds on the flat sheet; `o.slope` is not read yet. On the
      city page the site's terrain should carry the tiers (PLAN.md section 9: Talia is on a hill).
- [ ] `verify.py --assert` ends FAILED on `WebGL: CONTEXT_LOST_WEBGL` in the console: the same as Iziz's own pages and
      Pylon's (settlements/iziz/KNOWN_ISSUES.md, 2026-10-05). The harness's teardown, not the page.
