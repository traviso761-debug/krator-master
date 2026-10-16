# Known issues

- Vendored drift from `settlements/reedlake/src`: `93-labels.js` also labels `cls:'vessel'` and shrinks the font before truncating a long name; `92-camera.js` starts with the Labels button off. `00-head.html` has its own title. 2026-10-01: re-vendored after Reedlake's re-vendor from Highlands: `30-kit.js` verbatim (adds `KIT.meshes`), and `93-labels.js` is Reedlake's new one (with the label declutter) plus the same two vessel changes.
- Walk mode stands on a 0.4 m heightfield of each vessel's flat surfaces and is stopped by anything in a 0.4 m-round
  body 0.5-1.7 m above its feet (masts, walls, rails, crew, cargo). It boards from the water over the side without a
  climb, and leaves by flying over the rail (E). Narrow gaps between crew or cargo (under ~0.8 m) do not pass; a
  covered deck (the turtle ship's shell, the chitin bireme's carapace) is reached only from its roof. Ladders and
  stairs between deck levels are not modelled: a step up of more than 0.65 m stops the walker.
- The swell's displacement fades out 570-680 m from the roadstead's centre (the sea grid is too coarse beyond); the
  normals and whitecaps continue per pixel to the horizon. The wake strip is straight astern, so it does not curve
  through a turn.
- Trim: a sail's rig turns about its mast as one; a link whose far end is on deck stretches with it (a sheet) and
  any other piece moves whole only if a quarter of it lies on the cloth. Artemons, the tug's jib and the dhoni's
  mizzen do not trim. The Xanadu carrack's fore course (0.7) and mizzen (0.5) and the rookery's claw (0.6) trim less
  so they clear the next sail or the tower (`sails-clear-trimmed`). The flutter is zero on every sail edge, so the leech
  no longer flutters.
- Under way: every vessel makes the same speed (1.8 m/s): a row is one train on one racetrack, which is what keeps the
  courses clear. The half-turns are 19.5 m in radius (a quarter of the row spacing), tight for the 56 m flagship and
  the 55 m hexareme. Turned off, a row runs home along its course at up to ~60 m/s for a few seconds.
- The drua is built on one tack: shunting (carrying the tack to the other end and re-raking the mast) is not animated.
  Trimmed, her crab-claw turns about the raked mast like every other rig, so the tack swings off the bow instead of staying
  in its socket. The tanja rigs (kora-kora, lanong) trim about their tripods' apex while the tripods stay put.
- [ ] **Overview is over the draw-call budget**: 284 / 260 since the three Islander vessels (2026-10-12; it was 253 / 260
      with 28 vessels). The gate (`showcase-draw-calls`) is measured at the Opening view (223 / 260) and passes; `verify.py
      --strict-budget` with `--views Overview` would fail. Each vessel costs one draw call per material key; the fix is
      either a higher showcase budget for a 31-vessel sheet or merging the per-vessel paint/cloth/rope buckets.
- [ ] **Takes the material library** (materials.json, src/45y-rs-matlib.js): hull wood, awning cloth, thatch, hull tile, hex plate, chitin
      and the Ancient white and bronze. The painted grain (`paint`, 91 pieces) and the per-vessel sails stay procedural: the one painted-wood
      set runs its planks across the rails. Judged at about 15 m on five vessels. ?mat=proc shows the old look.
