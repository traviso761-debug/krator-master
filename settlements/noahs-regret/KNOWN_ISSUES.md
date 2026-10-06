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

- [ ] The bridge house's four storeys and the terraces' insides are closed volumes: glass bands on white, no rooms yet; only
      the bridge is a room. The cabins on the inboard side of the bow (D1-D4) now look into the terraces' solid.
- [ ] The stair cores do not reach the bridge: it has no stair drawn up from the top deck (the walk floors stack it).
- [ ] Ruephus's headquarters moved from the top deck to the head of the forecourt plaza (quay level) when the bridge house
      took the bow; one Lens office was dropped and a Drum tower moved aft for the same reason.

- [ ] The two hulls meet at the bow in a tight V: the inboard skin bends at about 10 m there, and the liner mole's root
      follows that curve. Cabins on the inboard side of the bow are too narrow for a template and are stores.
- [ ] The finger piers' columns go down to the keel's depth, not to the sea floor; where the basin is shallow (the sand bar
      off the starboard quay) they stand in sand. The mole is a pontoon like the hulls.
- [ ] The forecastle is a closed void between the bulwark and the main block's D1-D2 walls (stripped decks): those cabins'
      windows look onto its inside.
- [ ] The rounded sterns' insides (D1-D4 behind the end walls, the half-round galleries) are empty and closed off by the
      end walls; the terraces have no door onto them. The screws and rudders are simple (a hub, four flat blades, a slab).
- [ ] The scalloped balcony fronts are cosmetic: the balcony dividers stand on the frames (where the scallop is nil) and the
      walk floors still end at the slab's edge (20 m), not at the scallop.

## Interiors

- [ ] Cabins are furnished by **template** (width class, door side, kind, deck): two cabins of one template have the same
      furniture. The template room is the class width x the cabin depth, inside the real (slightly trapezoidal) cabin, so the
      outboard few centimetres of the wider cabins stay empty. Records exist per cabin.
- [ ] Deck buildings of one type (four Ribbon terraces, three Drum towers, two barracks offices) are furnished alike.
- [ ] The grand dining room, the bridge, the engine rooms, the crew messes, the greenhouse and the atrium are furnished
      piece by piece, not by the placer (a 2,000 m2 hall is not a room the placer's programmes fit); they are registered as
      zones, not as ROOM()s. The brig's cages are placed by hand too (the catalog's cages are yard pieces).
- [ ] The ship's rooms are furnished on a rectangle the width of the room's narrow end: on the bow's curves (the chart room,
      the wardroom, the strongroom) the wide end of the room stays bare. The ship's room kinds (sick bay, chart room,
      strongroom, armoury, brig, sail loft, laundry) are programmes added by this page (70-nr-interiors.js), not by the
      interiors kit: the sail loft gets looms and benches, the laundry quench tubs and goods rails (no laundry pieces in the
      catalog yet).
- [ ] The small Reliquary's stairs are steep (0.21 m risers on 0.23 m treads: a ship's stair). Its 12-gon walls are short.
- [ ] The cabins on D1 and D2 are stripped and empty by the brief; their doors are gone. They are not rooms in the data yet.

## Look

- [ ] The cut-away's section colour (dark red-brown) fills every cut solid, including the service core's long dark
      blocks: legible as a plan, heavy as a picture.
- [ ] The terrain is one warped grid (2.5 m cells over the hull): where the dune banks against the starboard pontoon, a
      cell's slope can show inside the starboard holds as drifted sand along the wall.
- [ ] Glass is one flat transparent tint; at grazing angles the interiors behind it are hard to see from outside (the
      deck cut is the way in).
- [ ] The atrium's glass balustrades read milky when looked through from above (the gallery view): one flat glass tint.
- [ ] The halos (lamp glows) draw by day at a quarter strength, as in the Scyvoi kit.

## Performance

- [ ] Under software GL (the headless verifier) the page takes minutes to load and a screenshot ~30-60 s: about 0.5 M
      triangles of hull, 0.16 M of batched furniture, and up to ~1 M of instanced furniture near the camera. A GPU loads
      it in seconds. The furnishing pass is ~9 s under SwiftShader (~120 template rooms).
- [ ] The page is about 6 MB, 3.5 MB of it the inlined texture pack (26 families at 512 px).
