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

- [ ] The terraces (the inner bow built up to the top deck) are solid inside. The 74 inboard cabins on D3-D4 whose glass
      faced them are windowless stores now; the D1-D2 cabins behind them are stripped anyway.
- [ ] The bridge house's four decks are open-plan halls furnished piece by piece round the spiral stair (no partitions,
      not ROOM()s); the spiral stair is the only way up from the top deck.
- [ ] Ruephus's headquarters moved from the top deck to the head of the forecourt plaza (quay level) when the bridge house
      took the bow; one Lens office was dropped and a Drum tower moved aft for the same reason.

- [ ] The two hulls meet at the bow in a tight V: the inboard skin bends at about 10 m there, and the liner mole's root
      follows that curve. Cabins on the inboard side of the bow are too narrow for a template and are stores.
- [ ] The forecastle is a closed void between the bulwark and the main block's D1-D2 walls (stripped decks): those cabins'
      windows look onto its inside.
- [ ] The rounded sterns' D1-D2 galleries (inside the glazed shell) are empty and have no door (those decks are stripped);
      D3 and D4 open onto theirs from both corridors. The screws and rudders are simple (a hub, four flat blades, a slab).

## Interiors

- [ ] Cabins are furnished by **template** (width class, door side, kind, deck): two cabins of one template have the same
      furniture. The template room is the class width x the cabin depth, inside the real (slightly trapezoidal) cabin, so the
      outboard few centimetres of the wider cabins stay empty. Records exist per cabin.
- [ ] Deck buildings of one type (four Ribbon terraces, three Drum towers, two barracks offices) are furnished alike.
- [ ] The grand dining room, the bridge, the engine rooms, the crew messes, the greenhouse and the atrium are furnished
      piece by piece, not by the placer (a 2,000 m2 hall is not a room the placer's programmes fit); they are registered as
      zones, not as ROOM()s. The brig's cages are placed by hand too (the catalog's cages are yard pieces).
- [ ] The ship's room kinds (sick bay, chart room,
      strongroom, armoury, brig, sail loft, laundry) are programmes added by this page (70-nr-interiors.js), not by the
      interiors kit: the sail loft gets looms and benches, the laundry quench tubs and goods rails (no laundry pieces in the
      catalog yet).
- [ ] The small Reliquary's stairs are steep (0.21 m risers on 0.23 m treads: a ship's stair). Its 12-gon walls are short.
- [ ] The cabins on D1 and D2 are stripped and empty by the brief; their doors are gone. They are rooms in the data (kind
      `stripped`, no furniture) but nothing is drawn in them but the debris.

## Look

- [ ] The cut-away's section colour (dark red-brown) fills every cut solid, including the service core's long dark
      blocks: legible as a plan, heavy as a picture.
- [ ] The terrain is one warped grid (2.5 m cells over the hull): where the dune banks against the starboard pontoon, a
      cell's slope can show inside the starboard holds as drifted sand along the wall.
- [ ] Glass is one flat transparent tint; at grazing angles the interiors behind it are hard to see from outside (the
      deck cut is the way in).
- [ ] The atrium's glass balustrades read milky when looked through from above (the gallery view): one flat glass tint.

## Performance

- [ ] Under software GL (the headless verifier) the page takes minutes to load and a screenshot ~30-60 s: about 0.5 M
      triangles of hull, 0.16 M of batched furniture, and up to ~1 M of instanced furniture near the camera. A GPU loads
      it in seconds. The furnishing pass is ~9 s under SwiftShader (~120 template rooms).
- [ ] The page is about 6 MB, 3.5 MB of it the inlined texture pack (26 families at 512 px).
