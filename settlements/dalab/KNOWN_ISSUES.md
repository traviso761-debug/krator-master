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

## Round 9
- [x] The lab's ring of blocks. **Round 9:** a ruined wall of bays with gaps at
      the streets (`labWall`, `window._labWall`).
- [x] Buildings on the lab's apron. **Round 9:** the precinct covers the apron.
- [x] Live oaks hide the buildings. **Round 9:** madrone avenues; oaks sprinkled
      off the streets (`_oaks`).

## Round 10
- [x] Two overview shots showed a flat cream bar the width of a landmark label
      under the "Scribes' hall" label. **Round 10 (merge to main):** it was the
      misaddressed label-atlas cell that Iziz upstream fixed (whole atlas
      cells); `93-labels.js` re-vendored, the bar is gone (`shots/c16`).
- [x] The placed count differs by a few between runs of the same build (875 /
      882): something in placement or the biome reads an unseeded source. The
      audit is clean either way. **Fixed (Oct 2026):** not a PRNG — the GPU. The
      buildable / class masks are 2048 px canvases whose anti-aliased road and
      footprint edges `canBuild` thresholds at 235, and a GPU-rasterised 2D canvas
      draws those edges differently from Chromium's CPU rasteriser: forcing GPU
      canvas rasterisation reproduced 882 (main 528) against 875 on the CPU.
      `85-city-paint.js` now creates the ground, mask and class canvases (and the
      horizon map in `90a`) with `willReadFrequently`, which keeps them on the CPU
      rasteriser everywhere: CPU and GPU loads both give 875, the same placement
      hash and the same mask hashes. (34-kitdefs' leaf card still uses
      Math.random, but only for its pixels.) **Replaced (2026-10-05):** the mask and
      class grids are core/mask (`KMASK.canvas`, hard-edged, no canvas at all) and the
      far forest keeps off the fields by a list of field discs; placement went from
      3349 to 3378 records, the same on GPU and CPU canvas loads (`core/mask/README.md`).
- [x] `verify.py --views` splits on commas, so a preset whose name holds a comma
      (the set's row presets 'Town types — row, stacked house, well, tower' and
      friends) cannot be shot by name; the eye-level presets cover the types.
      **Fixed:** `parse_views` takes `|` or `;` as exact separators, and with
      commas rejoins pieces that spell a preset's name (every verify.py).

## The vendored biome (Oct 2026)
- [ ] The swlowlands biome is vendored as `src/86-bio-*`. Its core moved to `core/biome/` (one copy
      for every kit) and the kit gained `BIO.kit` hooks, so `--vendor-check` reports the core and the
      hooked fragments as drift. The kit's geometry is unchanged (mesh fingerprints, `core/README.md`).
      Re-vendor, or read `core/biome` through a `CORE_BIOME` list, when Dalab is next rebuilt and verified.
