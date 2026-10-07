# Noah's Regret: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

## Scope (the brief)

- [ ] **No life layer.** The brief asked for furniture and no people yet. `NR_FACTION` (36-def.js) holds the pirates'
      faction, sub-faction and activities for it; the cabins and rooms are data (`window._interiors`), and the walk graph
      is still to write (the stair cores, the atrium's flights and the corridors are where it goes: `NR.CORES`, `NR.ATRIUM`).
- [ ] **The beach settlement is not built.** The shanties, lean-tos and grog halls that spill down onto the beach come
      with the settlement; the pirates' stair towers, the steps down the dune and the floats are where it will attach.
- [ ] **No ships in the harbour.** The basin is empty water. The Ring Sea kit's vessels (`kits/ringsea`) could lie at the
      inner quay and the floats once that kit has a bundle for other worlds.
- [ ] **The park trees are placeholders** (two species, tagged as such): no biome kit is named for the Ring Sea's south
      shore. Replace them with that kit's flora, placed by the parks' beds (`NR.PARKS`).

## Interiors

- [ ] Cabins are furnished by **template** (width class, door side, kind, deck): two cabins of one template have the same
      furniture. The template room is the class width x the cabin depth, inside the real (slightly trapezoidal) cabin, so the
      outboard few centimetres of the wider cabins stay empty. Records exist per cabin.
- [ ] Deck buildings of one type (four Ribbon terraces, three Drum towers, two barracks offices) are furnished alike.
- [ ] The grand dining room, the bridge, the engine room and the atrium are furnished piece by piece, not by the placer
      (a 2,000 m2 hall is not a room the placer's programmes fit); they are registered as zones, not as ROOM()s.
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
