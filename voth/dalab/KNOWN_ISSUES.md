# Known issues — Dalab

Open items are `- [ ]`; `build.py` prints them. Close one by ticking it and
saying what fixed it.

## Building kit (round 1)
- [x] The mound is a real mesh, one draw call each. **Round 3:** every mound and
      ring bank goes into `DMOUND_GEOS` in world space and `94-dalab-light.js`
      merges them into ONE mesh (`window._mounds` counts them).
- [x] Mural frieze facets proud at their ends. **Round 3:** facets every 1.5 m
      (was 2.1) and 3.5 cm off the wall; not visible at eye level.
- [x] Windows and doors on a drum sink at the corners. **Round 3:** openings on
      a round house stand 6 cm out from the wall face.
- [x] `dnGiant` arms are tilted cylinders. **Round 3:** hands added (a ball at
      each wrist); the life layer still replaces the figures.
- [x] The Halls' pylon cables are straight. **Round 3:** `dnCable` — six
      segments of a parabola with sag.
- [x] The ring bank's lathe has no end caps. **Round 3:** the revetment blocks
      are 2.2 m thick and 6 % wider than the bank; nothing shows.
- [x] Night: The God's light and the fires do not light the ground. **Round 3:**
      every God-post and God-lamp lays a radial glow card on the ground (the
      fire pits already did); the hemisphere light is blue at night.
- [ ] The Ancient lab dome (`../ancients/src/64-dalab.js`) is not in this repo;
      the settlement pass vendors it. (Deliberate: this kit is the buildings.)

## Round 2
- [x] Palace mound stair ran through the terraces. **Round 3:** rebuilt — each
      terrace has its own landing with a balustrade; an axial flight to the
      first, paired side flights on solid stone walls between the rest, and up
      to the plateau (`dnFlight`, `dnBalustrade`).
- [x] Halls wing pipes unsupported. **Round 3:** iron trestles under each run.
- [x] Windmill sails static. **Round 3:** the sails are two merged meshes in a
      group (`DWIND`) that the frame loop turns; two draw calls per windmill.

## Round 3
- [ ] Garden beds are flat turf boxes cut into the turf lathe: at the bed's
      inner edge the mound surface rises through the box, which reads as the
      cut, but from directly above the two turf textures meet at a hard line.
- [ ] The biome's garden plants are placed at an explicit height; on a world
      with real terrain the palace builder still hands them the mound profile,
      so they will sit right, but a bed on a slope steeper than the mound's
      would need its own retaining depth.
- [ ] Biome draw calls: +22 for the lowlands items and buckets, paid once per
      page whether one palace or a whole settlement is planted.
