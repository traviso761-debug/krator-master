# Verge: known issues

What is still open, as of 2026-10-05. Each item says what it is, where it lives and what would close it.

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
- **Doors without a link.** About 10 to 20 doors find no street within reach (`window._sim.unlinkedDoors`). Citizens
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

## Cost

- **About 10 M triangles with everything on.** The biomes take about 4 M of it; the ground takes 2.3 M (with the 2 m
  switchback tiles), and the rest is the cities and the life layer. `?flora=0` drops it to 5 to 6 M.
- **Headless loads are slow.** Under SwiftShader a full load takes 2 to 4 minutes; with `flora=0&interiors=0`, about
  40 s.

## Vendored files

`src/81-verge-sky.js` and `src/82-verge-daynight.js` are verbatim copies of `settlements/locus/src/21-sky.js` and
`82-daynight.js`. Fix them upstream, then copy them again.
- [ ] **Takes the material library from the builds it assembles** (build.py, no materials.json): the Iziz vernacular's seven
      families (IZV binds them), Locus's pack (YKIT's 47-texture.js) and the sedesert biome's. Iziz's Ancients rows and the eastabyss
      biome's pack stay out for size (12.7 MB; all of them would pass 19 MB), so those surfaces are procedural here. ?mat=proc shows the old look.
