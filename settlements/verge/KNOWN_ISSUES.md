# Verge: known issues

What is still open, as of 2026-10-05. Each item says what it is, where it lives and what would close it.

## The host (core/host)

- [x] (2026-10-15) **Verge is on core/host** (ROADMAP.md section 10, stage 3 step 5; `core/host/README.md`). `build.py` takes
      the whole interface less `core/space` (core/biome's `40-core-place.js` takes its grid when it is on the page, which would
      move the scatter) and `core/edits` (no editor world yet). `src/90-verge-camera.js` is gone; `src/99-start.js` is the take:
      the views, the ground, the draw (the Krator sky's scene, then the city), the sky and the light in a 'view' subscriber,
      TICKS in a 'view' subscriber too (after the camera, as before: the interiors' queue and the life layer read the camera),
      the inspector's words for a creature, a place, the trail or the terrain (a building or a piece is its core/tags label),
      and the probe (`window._api`, handed over as `api`). **One clock:** `CLOCK`'s fields read and write the host's clock and
      its methods call it, so the host's speeds, hour slider and run / hold reach the sky, the lamps and the life layer, and
      `CLOCK.set` / `CLOCK.run` (verify.py) reach the host's. Proof: `verify.py --assert` 15 PASS, RESULT PASS, as before
      (the old page from its own folder); the scene census at four views equals the old page's exactly with the furnishing
      flushed (`?furnishMs=100000`; old against old 0 differences too); with the default 28 ms a frame the first view's
      furniture differs by how far the queue got, old against old as well; the inspector names a tavern (`bld_00312`) from its
      record, the minimap draws 1580 records, a mark measures, 0 unknown tags, no errors; the host's clock and CLOCK agree.
- [x] (2026-10-15) What changed with the host: the polygon tool and its panel are gone (the host's marks, P); the Inspector box is
      the hover button (I, on as before); the HUD's camera line is the stats panel (the day there, the hour in the time row);
      the hour slider and run / hold are the host's (`#clk-hour`, `#clk-run`). The keys are the host's (W A S D, Q / E, F walk,
      G and double-click the pin, I, P, M minimap). The 'Sky panel' button is a host control (81's own button found no `#ui`
      at load). - 2026-10-20: description of the port, nothing open.
- [x] (2026-10-15) The marks file: core/host (94) reads `<build>/marks.json` only on a page served by `tools/edits/serve.py`
      (GET `/__file`, 204 when none was saved); anywhere else the browser's draft, so no 404 reaches the console. The take passes
      no `marksUrl`.

## The world

- **The trail does not use the funicular's track.** The brief allowed the path to use parts of the ruined track. It
  doesn't: the ruin's line (z -140) runs along the spur's north edge above the gorge, clear of the switchback, so the
  trail never passes through its cuttings or piers (the `the-trail-is-clear` check). On the line down the middle of
  the spur that it had first, the trail crossed it 26 times, through walls and piers. To share stretches of the deck, the kit's plan would need
  crossings: a gap in a cutting's walls, and no pier within reach of the trail
  (`kits/ancients/src/8ap-funicular.js`).
- **The ground is a vertex-coloured heightfield.** The trail and its 8.5 m bench read at 2 m cells. The cities' paint
  (streets, yards, plazas) is at 4 m cells, so a street's edge is soft from close up.
- **The spur's profile is analytic.** Its ledges are a stepped function of height, and its outcrops are painted, not
  modelled. There are no carved overhangs on the spur (core/terrain carve patches would add them).
- **Each Lower Verge run can miss a landmark.** One or two of its nine warehouses can find no spot near the trailhead
  (`window._place.failed`). The porters need only one warehouse on each level, so the timetable stays full.
- **Upper Verge does not cross its river.** Its avenues may bridge the river (`routeAvenues`' `cross`), but none of its
  landmarks lies north of it, so no route does and the north bank of the canyon floor stays empty. Lower Verge's one
  bridge opens its north bank. A landmark or an avenue target across the river would open Upper Verge's.
- **Doors without a link.** Two doors (10 to 20 before the move onto core/city) find no street within reach (`window._sim.unlinkedDoors`). Citizens
  whose home is behind such a door start from the nearest node.

## Interiors and furniture

- **Variants follow each kit's rule.** An Iziz Vernacular variant has variant 0's rooms (its variants differ only in
  colours and picks). A Yuni or Abyssal variant with no `#n` item in its set is not furnished. None is placed today:
  the `every-building-has-its-interior` check fails if one appears.
- **Skipped buildings.** Some buildings are skipped by their set, with a reason: open stalls and tents, the palisades,
  the mustering ground, the temple's open precinct, and Abyssal drum houses with no flat floor.
- **Furnishing is progressive.** Interiors are planned near the camera first, within 320 m (`?furnishR`), at most
  28 ms a frame (`?furnishMs`). A far building is furnished only once the camera has come near it.

## Life

- **The rigs belong to Verge.** The person, camel and lizard rigs are in `src/77-verge-rigs.js`, not in a shared kit.
  Another build that wants caravans should lift them into a kit first.
- **Godot does not replay the citizens.** They decide at run time (`SIM.decide`, logged), so `godot/tests/verge` checks
  the timetabled groups only: caravans, porters, nomads and patrols. The spike draws stand-ins (capsules and boxes, no
  gait).
- **Dispersal waits for time.** At a caravanserai a member walks to its slot only when the stop is long enough to go
  and come back; otherwise it waits in the column on the road.

## Lighting

- **Night reads as deep dusk under the giant.** The lighting is Locus's, vendored unchanged (81, 82), with its
  planetshine. A night with the giant up keeps a cool fill, and a darker night is a change to Locus's
  `82-daynight.js`, not to Verge.
- **The night light volume covers Lower Verge only.** The Yuni engine's volume is sized to the lower city. Upper
  Verge's lamps get their halos and glow, but the volume's fog light does not reach the canyon.

## The biomes

- **Dynamic meshes drop out of the export.** `BIO.dynamic` never sets `userData.kit`, so `BIO.export({kit})` drops a
  dynamic mesh. The new fauna sets it itself; sedesert's older fauna (kites, swifts, striders) is still dropped. The
  fix is one line in `core/biome/20-core-kit.js`. It is recorded in both kits' `KNOWN_ISSUES.md`.
- **The pink lake hides the flamingos.** Against the eastabyss kit's default pink lake (hue 0) they are hard to see.
  Verge's salt lakes are turquoise (`EASTABYSS_LAKE.hue` 0.52), so this does not apply here.

## Determinism (2026-10-15)

- [x] **The sim's rest-stop picks were shuffled with a random comparator.** `src/74-verge-sim.js` chose a through
      caravan's one or two rest stops with `RESTS.slice().sort(()=>R0.next()-.5)`. A random comparator is inconsistent,
      and V8 can order the same array under the same draws differently between loads (Roketstad's town changed from load
      to load for this: `settlements/highlands/KNOWN_ISSUES.md`). Replaced with `shuffle(a, R)`, a seeded Fisher-Yates on
      the stream. Four loads in a row give the same groups, stops, dwells and phases. The shuffle draws differently, so the
      timetable moved once (same rules). Never shuffle with a random comparator.

## Cost

- **About 12 M triangles with everything on** (since the move onto core/city, 2026-10-15: 2,661 buildings, from 1,572).
  The biomes take about 4 M of it; the ground takes 2.3 M (with the 2 m switchback tiles), and the rest is the cities and
  the life layer. `?flora=0` drops it to 7 to 8 M. Lower Verge's edge (`zoneR`, `corridor`, `landR` in `lower()`) is the
  knob if it is too heavy.
- **Headless loads are slow.** Under SwiftShader a full load takes 2 to 4 minutes; with `flora=0&interiors=0`, about
  40 s.

## Vendored files

`src/81-verge-sky.js` and `src/82-verge-daynight.js` are verbatim copies of `settlements/locus/src/21-sky.js` and
`82-daynight.js`. Fix them upstream, then copy them again.
- [ ] **Takes the material library from the builds it assembles** (build.py, no materials.json): the Iziz vernacular's seven
      families and its Ancients rows (IZV binds them), Locus's pack (YKIT's 47-texture.js) and both biomes' packs. The maps are in
      dist/verge.tex.<key>.js beside the page (tools/textures/matlib_pack.py), so the page stays 2.6 MB and no file passes the
      gallery's 16 MB. ?mat=proc shows the old look.
