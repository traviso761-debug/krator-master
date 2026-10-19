# kits/talia: known issues

`build.py` prints the open ones (`- [ ]`) on every build.

- [x] No `materials.json` yet. **2026-10-18:** `materials.json` binds `taMarble` (stone.marble.ashlar), `taGilt` (metal.gold)
      and `taTile` (roof.clay_roof_tiles) (src/88yt-tal-matlib.js, packed into tex/); the honeycomb mosaic, meander, jali and
      rose window were owed in core/materials/PROMPTS-NEEDED.md.
- [x] **Delivered and wired 2026-10-18** (owner-tex2b batch): `taMosaic` (mosaic.orange.honeycomb: the paving medallions'
      disc, `tanMosaicRing`; the item `taVaultMo` is ready for the interiors' trumpet vaults), `taMeander` (the border band,
      the paving and terrace borders of `tanMeander`), `taRenderW` (render.orange.worn: the tenement's walls), `taJaliA` /
      `taJaliG` (the two jali cut-outs, chosen by place: the jharokha bays' front openings, `tanJali`), `taRose`
      (`tanRoseWindow`, ready for the temple). All full colour (keep 1). With `?mat=proc` the old strips, rings and bars draw.
- [ ] The wired sets leave the neighbours on the procedural look: the tenement's turret shaft and corbel stay burnt-orange
      plaster (a round post, the render set is on boxes), so the turret reads redder than the walls; the medallion's boss
      and the meander's colour are the sets' own (not the kit's `or`). `taRose` has no caller until the temple (P4), and
      the `taVaultMo` / the trumpet vault wait for `taliaint3`. The jali card repeats each metre (one tile a metre), so a
      wide screen shows the lattice's own edge bars as lines every metre.
- [ ] A loggia (`tanLoggia`) is a real recess only up to the arch's springing; the round head above it is a dark disc on
      the front plane, so from a high angle the head reads as a plate. A hollow body (the interiors set) would cut it.
- [ ] Arched windows elsewhere (`tanArch`) are fills on the wall plane, as the Vernacular's windows are, not recesses.
- [ ] The hill stack stands on a white retaining mass so it builds on the flat sheet; `o.slope` is not read yet. On the
      city page the site's terrain should carry the tiers (PLAN.md section 9: Talia is on a hill).
- [ ] `verify.py --assert` ends FAILED on `WebGL: CONTEXT_LOST_WEBGL` in the console: the same as Iziz's own pages and
      Pylon's (settlements/iziz/KNOWN_ISSUES.md, 2026-10-05). The harness's teardown, not the page.
