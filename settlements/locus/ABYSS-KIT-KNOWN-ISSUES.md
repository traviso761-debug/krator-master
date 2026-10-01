# Eastern Abyssal kit — known issues (first pass, Oct 2026)

- [ ] **The eight reference images were not available** to this pass (`abyss.zip` was not in the repo or the upload);
      every form follows the brief's written description of the image. Compare against the pictures and list mismatches.
- [x] **Stuck on "Laying out the abyssal kit…" in Claude's viewer** — fixed. The viewer (an about:srcdoc frame) injects
      the page's scripts one by one after the document has loaded, so three.js arrived first, readyState already said
      'complete', and the loader called BUILD() before the BUILD script existed ('BUILD is not defined'). The error was
      also hidden under the loading screen. Now three.js's onload and the BUILD script's tail (`window._krGo`) hand off,
      whichever comes second starts the build, and ERR() takes the loading screen down. Reproduced and checked with a
      page that re-injects the scripts after load. Headless runs take the FAST path (`navigator.webdriver`); mask it to
      test the full path.
- [ ] **The ruler's title** is a placeholder: "the Headman" (palace and plaza names).
- [ ] **Hospitality lighting is a judgement call:** the inn, tavern and caravanserai burn lit oil lanterns (public
      houses open at night); the brief lights only rich, civic, sacred and palace buildings. Say if they should be unlit.
- [ ] `ind_oil_tank` variant C is "banco-clad in the Yuni manner" and sits on this sheet as the brief allows; it is not
      abyssal in style. Left unchanged.
- [ ] `locus.html --assert` crashes in `verify.py` (`A.GATES` is undefined: the Yuni-inherited world invariants), on the
      commit before this kit as well as after. The world was checked by its counters instead (identical).
- [ ] A long dark line can cross the sheet near the palace and plaza in high views: it is not geometry (nothing long
      stands there; checked by walking the instance matrices) — most likely the sun's shadow-map edge on the large sheet.
- [ ] Swoop roofs, sails and cone shells are vertex-coloured merged meshes with their own smooth normals; the ridge tube
      and horns are 8-sided, so a horn reads faceted up close.
- [ ] The cone shell's arch is cut cleanly, but the reveals are single quads per row, so a very low `arch.h` on a steep
      cone shows a stepped edge.
- [ ] `ABYSS.vessel` windows on tanks and silos are flat panes on a curved wall (they stand 0.02 m proud at the centre);
      at a raking angle their corners float a hand's width off the wall.
- [ ] Drum houses' end doors stand ~0.75 m above the deck (inside the drum's curve), reached by a plank step.
- [ ] The windpump blades are flat (no twist): a real wheel's blades are pitched. The rim rings are static (they are round).
- [ ] The tin-mirror family is Phong; under the night volume it lights like the Lambert families but its specular
      glint follows only the sun and moon, not the lamps.
- [ ] The amphitheatre's aisle stairs are stacked blocks (one per tier), not individual treads.
- [ ] The palace and plaza are 92 m wide; the sheet's whole-sheet view shows them small. Use the row button.
- [ ] Wall pieces are a straight-line system only (segments on one line, 90° corners); there is no angled joint piece.
- [ ] The citadel's corner towers stand partly over the edge of the mound's top (the mound's top is 55 m, the circuit
      48 m plus tower radii).
- [ ] No interiors: houses, inn rooms and containers are closed volumes with doors and windows (shops, the library, the
      tavern and the temple are open and furnished).
- [ ] Furniture has no sheet of its own; it is seen where buildings place it (and in the helper demo for the altar pair).
- [ ] The `abyss_helpers_demo` and `abyss_wall_run` assets are sheet-only demos (tag `demo`); the world must not place them.

## Found in review (Oct 2026), not yet fixed

Geometry checked against the source; file:line as of 36e1afb.

- [ ] **Warehouse roof pitched upside down** (`65-abyss-90-farm.js:100`): the front half is tilted by `s*-0.32`, but in
      this kit a positive pitch lowers the front, so the eave rises 1.21 m and the ridge sinks into the shed (a V roof
      with the gable triangles at :101 standing out of it). `ABYSS.corrRoof` uses the correct sign.
- [ ] **`ABYSS.trim` frames sit half their height low.** The helper centres the frame on `y` (`00-core.js:223`), but 4 of
      5 callers pass the opening's bottom: `70-palace.js:30` (the great door: frame half in the plinth, gilded top bar
      across the door), `70-palace.js:28` (lattices), `30-housing.js:167` and `:177`, and the demo at `00-core.js:367`.
      Only `40-shops.js:52` passes the centre.
- [ ] **Tower-house windows buried** (`30-housing.js:166`): the window radius is a straight lerp 4.6→2.5 against a
      four-point profile, so all 7 windows sit 0.1–0.23 m inside the plaster and tin-mirror skin.
- [ ] **Inn stairs miss the galleries** (`50-civic.js:26`, `:38`): lower flights at x ±5.2/±4.8, galleries start at
      ±5.9/±5.5 (lands ~0.2 m beyond the rail); the second flight starts in mid-air at gallery height.
- [ ] **Citadel stair stops short** (`80-military.js:84`): ends at z 29.4, the mound top ends at 27.7; the last tread is
      1.7 m short and ~1.3 m above the slope. Start it at about z 32.3.
- [ ] **Wall system** (`80-military.js`): the walkway over the gate (:53–54, 6.25–6.4 m) is inside the 6.5 m opening;
      it runs into the solid 10.5 m gate towers (:51); tower doors sit on the wall's centre line, z 0, not over the
      walkway, z −1 (:38), half buried in the parapet.
- [ ] **Stairs that don't land:** the tavern's upper flight ends 0.57 m short of the deck (`50-civic.js:73`); the
      stacked-container house's outside stair lands outside the balcony rail (`30-housing.js:61–63`).
- [ ] **Interpenetrations:** loggia outer front masts inside the front corner towers (`70-palace.js:43` vs `:38`); back
      pavilions cut the great hall's plinth (`:49` vs `:25`); the temple's front covered walk starts inside the gate
      pylons (`60-temple.js:24` vs `:47–48`); second-floor containers overlap ~0.6 × 1.4 m (`30-housing.js:57–58`);
      the cone variant's cone floats 0.9 m over the deck and overhangs its back edge by 1.1 m (`30-housing.js:127` vs
      `:117`); the library's small cones are centred on the plinth edge (`50-civic.js:140–141`); the granary catwalk
      runs inside the silos (`90-farm.js:49`); the blue tarps' back corners have no support (`90-farm.js:52–53`).
- [ ] Minor: the alchemist's flue starts ~0.18 m above the tank roof (`40-shops.js:110`).
