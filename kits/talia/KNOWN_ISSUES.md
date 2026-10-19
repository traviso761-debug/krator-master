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
- [ ] P4 (2026-10-18): the theatre's cavea stands on its own outer wall on flat ground; on the city's hill (PLAN.md 9b:
      "on the slope") the slope should carry the tiers and the outer arcade go into the ground.
- [ ] The P4 interiors are owed to P6: the library's well, the anatomy theatre's tiers, the odeon's cavea, the studios,
      the hospital's wards. Their bodies are vnBody, so a set in kits/interiors can hollow them later.
- [ ] To keep the sheet inside its budgets (the cloister came to 288k of 250k triangles, the sheet to 2.85M of 3M), P4
      made every column's base ring and capital volutes low-poly (`taRingMs`, `taRingGiS`, `taGiltNub`) and the baluster
      lathe eight-sided: P2 and P3 buildings changed with it (the sheet is now 2.36M). Judge the capitals at eye level.
- [ ] P5 (2026-10-18): the governor's palace (`tal_governor_palace`) is the heaviest type on the sheet, 228k of its 250k
      triangles (the sheet 2.59M of 3M): the 130 columns of the pavilions and the loggia, and the front balustrades, carry
      most of it. The sides, the back and the light courts take coped parapets, not balustrades, to stay inside. A sixth
      or seventh heavy type will want the pavilions' upper columns on a lower-poly lathe.
- [ ] The palace's outside stair is one straight flight of 22 steps (0.30 m risers, as Pylon's): the blueprint's three
      runs of at most 16 steps with landings (`SKILL.md` 5j) do not fit its 10 m footprint as a straight flight. The
      front pavilions' inner columns stand inside the hall block's corners, where the round pavilions overlap it (as
      the sheets draw the pavilions as squares). Its rooms (the blueprint's B, G, U and L sheets) come with P6.
