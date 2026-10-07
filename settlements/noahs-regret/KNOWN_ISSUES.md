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
- [ ] The ship's room kinds (sick bay, chart room, strongroom, armoury, brig, sail loft, laundry) are programmes added by
      this page (70-nr-interiors.js), not by the interiors kit: the sail loft gets looms and benches, the laundry quench
      tubs and goods rails. The master catalog has no sail-making or laundry pieces yet (a change to the shared catalog).

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

## Performance

- [ ] Under software GL (the headless verifier) the page takes minutes to load and a screenshot ~30-60 s: about 0.5 M
      triangles of hull, 0.16 M of batched furniture, and up to ~1 M of instanced furniture near the camera. A GPU loads
      it in seconds. The furnishing pass is ~9 s under SwiftShader (~120 template rooms).
- [ ] The page is about 6 MB, 3.5 MB of it the inlined texture pack (26 families at 512 px).
