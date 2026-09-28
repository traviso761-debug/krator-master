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
- [x] The Ancient lab dome is not in this repo. **Round 7:** vendored into the city
      target as `63-anc-dalab.js` and placed at scale .4.

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

## Round 7 — the settlement
- [x] The lab's own hypertree overgrowth. **Round 8:** the wrapper sets
      `BIOME.lush=0` (no kit trees or moss) and the biome mask lets the lowlands
      species root inside the ruined wall at .55, with the domes as obstacles
      (`LAB_OBST`).
- [x] Roads paint-only. **Round 8:** a centre-wear stripe and a rut line on the
      highway and avenues, a wear stripe on streets. Still paint: no kerb
      geometry (the roads are packed earth, so none is wanted).
- [x] Channels straight. **Round 8:** every channel is resampled every 25 m with
      a sinuous offset (the main channel up to 18 m).
- [x] Agents through buildings. **Round 8:** verified — footprints are painted
      into the mask after placement and the audit reports 0 overlaps and no
      house corner on a street; agents stay on the road graph.
- [x] Night. **Round 8:** verified from the night plaza shot — the terrain and
      the biome's floor are lit materials and go dark with the hemisphere.
- [x] The horizon. **Round 8:** an annulus from the map edge to 9 km painted with
      clearings of strip fields in forest, and ~1 900 far-tree blobs in one
      mesh; the KratorSky dome above it (giant, rings, sun, stars, moon).

## Round 8
- [ ] `targets/city/63-anc-dalab.js` deliberately drifts from
      `../ancients/src/64-dalab.js`: a wall gap where the oak avenue enters
      (`LAB_WALL_GAP`) and a narrower, higher bite in the great dome (w .11,
      y0 .10). Both lines are marked DALAB; `--vendor-check` says so.
- [ ] The oak corridor rule keeps plots 22.5 m off every oak road's line, so
      a town the highway passes through loses its highway frontage; the second
      ring street and the extra radials make up the count.
