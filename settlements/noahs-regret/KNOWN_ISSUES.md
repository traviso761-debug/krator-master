# Noah's Regret: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

## Scope (the brief)

- [ ] **No life layer.** The brief asked for furniture and no people yet. `NR_FACTION` (36-def.js) holds the pirates'
      faction, sub-faction and activities for it; the cabins and rooms are data (`window._interiors`), and the walk graph
      is still to write (the stair cores, the atrium's flights and the corridors are where it goes: `NR.CORES`, `NR.ATRIUM`).
- [ ] **The beach settlement is not built.** The shanties, lean-tos and grog halls that spill down onto the beach come
      with the settlement; the pirates' stair towers, the steps down the dune and the floats are where it will attach.
- [ ] **No ships in the harbour.** The basin is empty water: the liner mole's two berths, the finger piers and the inner
      quay are ready for them. The Ring Sea kit's vessels (`kits/ringsea`) could lie at the
      inner quay and the floats once that kit has a bundle for other worlds.
- [ ] **Nothing rides the sea.** The sea is core/water's (2026-10-13) and `WATER.ride` would pose a hull on it, but the
      floats off the inner quay are baked into the hull's buckets, so they stay put while the field lifts the basin by up
      to 0.41 m; for that reason the Ring Sea kit's trochoid swell (`swell:'ringsea'`, the geyser's and the kit's sea) is
      not on this sea yet. Ships in the harbour (above) should be groups that ride it.
- [ ] **The park trees are placeholders** (two species, tagged as such): no biome kit is named for the Ring Sea's south
      shore. Replace them with that kit's flora, placed by the parks' beds (`NR.PARKS`).

## The hull and the piers

- [ ] The screws and rudders are simple (a hub, four flat blades, a slab rudder).
- [ ] The inboard cabins at the bow look through their glass into the forward halls (the terraces' insides), not out to
      the harbour.

## Interiors

- [ ] Cabins are furnished by **template** (width class, door side, kind, deck, and one of two variants by the cabin's
      hash): neighbours differ, but every fourth or so repeats. The template room is the class width x the cabin depth,
      inside the real (slightly trapezoidal) cabin, so the outboard few centimetres of the wider cabins stay empty.
- [ ] The halls (the grand dining room, the bridge, the engine rooms, the crew messes, the greenhouse, the atrium, the
      forward halls, the bridge house's open decks, the plaza, the chain locker, the stern lounges) are furnished piece by
      piece, not by the placer (a 2,000 m2 hall is not a room the placer's programmes fit). They are rooms in the data
      (`window._interiors.halls`: outline, deck heights, pieces), not ROOM()s. The brig's cages are placed by hand too.
- [ ] The master catalog has no sail-making or laundry pieces yet: the sail loft gets looms and benches, the laundry quench
      tubs and goods rails. (The ship's room kinds themselves moved to `kits/ancients-interiors`, 2026-10-07; the
      arcology's deck and harbour fittings went to the catalog's Ancients block.)

## Look

- [ ] Glass is one tint (lighter since 2026-10-07; the balustrades nearly clear); at grazing angles the interiors behind
      it are still hard to see from outside (the deck cut is the way in).

## Decisions (not issues)

- Ruephus's headquarters moved from the top deck to the head of the forecourt plaza (quay level) when the bridge house took
  the bow; one Lens office was dropped and a Drum tower moved aft for the same reason.
- The cabins on D1 and D2 are stripped and empty by the brief (rooms in the data, kind `stripped`, no furniture). The
  stern galleries behind them and the chain locker hold the pirates' stores.
- Along the starboard hull the ground is scoured a little outside the skin, so no sand shows inside the holds (the
  terrain grid's step lies outside the hull).

## core/host

- [x] (2026-10-15) Noah's Regret on core/host (ROADMAP.md section 10, step 5; core/host/README.md; host.FULL without
      core/edits): the camera, the controls, the walk (F), the frame loop, the panel, the probe's frame, the inspector (I
      or T hover, a click: the core/tags record, the words 92-camera.js gives, the deck cut's hidden hits skipped), marks
      (P, they replace the polygon tool), the minimap (M) and the cutaway (X: the nine deck buildings' planned storeys and
      the bridge house's four storeys and the bridge, in world coordinates from the hull frame) are core/host's.
      `src/92-camera.js` keeps the world, the views, setView (a view's {cut, night}, also through the take's onView), the
      inspector's words, the deck cut (C), night (N) and shadows; `src/99-start.js` is the take: the clamp (under the dune
      only inside the hull), the walk floors as a KWALK-shaped adapter over nrFloorsAt (a step of 1.95 m and no ledge
      guard, as the page's walk had; F stands on the deck under the eye, Q / E a level down or up), FRAME_HOOKS, the
      sun's shadow box, the sky camera and core/atmos after the camera is placed (the old order), and the two-pass draw.
      Proof: verify.py --assert unchanged (15 PASS: 9446 records, 0 unknown; 9394 pieces); a scene census (every mesh's
      name, visibility and triangles, the camera, the draw calls) at four views (the opening, the bridge's plan with its
      cut, the night port, a D3 cabin) matches the old page within its own run-to-run noise: two old runs differ at the
      night view (242 calls and 918,540 triangles of unnamed meshes in one, 54 and 863,882 in the other); both new runs
      read 54 and 863,882, every other view equal to the call. The cutaway, the walk floors and the keys exercised headless.
- [ ] (2026-10-15) core/host's marks (94-host-marks.js) fetch `marks.json` beside the page; absent, it is a 404 that
      Chromium logs as a console error, which `verify.py` counted as a failure: it now skips that one URL. The motion
      clock's dt reaches core/atmos's wave clock, so `?t=` (verify.py's `t=4`) also stops the waves, where the old loop
      ran them on real time (the smoke and cloth were pinned by `ANIM.pin` before and still are).
- [ ] (2026-10-15) No editor: the catalog pieces are merged into the hull-frame batch and its instanced templates, so no
      world adapter can move one piece live yet (core/host's 98 needs one).

## Performance

- [ ] Under software GL (the headless verifier) the page takes minutes to load and a screenshot ~30-60 s: about 0.5 M
      triangles of hull, 0.16 M of batched furniture, and up to ~1 M of instanced furniture near the camera. A GPU loads
      it in seconds. The furnishing pass is ~9 s under SwiftShader (~120 template rooms).
- [ ] The page is about 6 MB, 3.5 MB of it the inlined texture pack (26 families at 512 px).

## Voth census trades (2026-10-19)

The table `NR_TRADES` (`src/63-nr-trades.js`) says which building carries each of the Voth city's 44 trades (`tools/trades_census.json`); `verify.py --assert` checks it (`voth-trades`). 11 carried, 5 partly, 9 gaps, 19 na of 44.

Missing buildings (gaps) and partly carried trades:

- [ ] bakers: a bakery: the galleys cook but no ovens are drawn
- [ ] butchers: a butchery or smokehouse
- [ ] brewers: a still or brewhouse: the grog is only served (the forward hall)
- [ ] tanners: a tannery
- [ ] teachers and scholars: a school or a reading room: the Reliquary (nr-anc-reliquary) is the pirates' headquarters, not a library
- [ ] lighthouse keepers: a keeper's room at the harbour-mouth beacons (drawn in 40-nr-hull.js, unmanned)
- [ ] fishers: a fishing dock and drying racks on the inner quay
- [ ] granary keepers and millers: a granary or mill: the forward store holds loot, not grain
- [ ] ferrymen: a ferry stage on the pirates' floats (nr-pirate-float is a boat landing only)
- [ ] weavers and dyers: no dye works; the sail loft stands for the cloth trade
- [ ] shipwrights and boatbuilders: a slipway or boat yard: the harbour has no ships and the carpenter's and cooper's shops only repair
- [ ] town guard: a watch house: the brig is the only guard post
- [ ] smiths and craftsmen: a forge: the engine room holds only a pirates' workshop
- [ ] priests and undertakers: no burial ground or undertaker
