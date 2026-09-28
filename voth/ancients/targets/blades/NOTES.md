# The Blades — hand-back notes

`src/8ag-blades.js` · `buildBlades(scene,gx,gz,d)` · seed 9640+d (claims 9640-9641
for DECAYS=[0,1]) · target `blades` · intact at x=-2400, ruined at x=+2400.
Prefix `bl`/`BL_` (`BL_SITE`, `MAT.bl*`, `TEX.bl*`, kdefs `blBox`/`blDim`).

## PATH TAKEN: the arcology (NOT the skyI fallback) — the no-go test, first

The question: can one blade carry a double-loaded plan (rooms, corridor, rooms)
at a thickness that still reads as a blade?

* A double-loaded dwelling slab: 2 x 11.5 m room depth + 3.0 m corridor + 2 x
  0.4 m facade = **26.8 m** clear, call it 27 m.
* Blade thickness at the foot: **36-46 m** (six blades), tapering as
  `t(x) = t0 (1 - 0.6 x^1.5)` with x = fraction of the blade's length, so the
  double-loaded plan holds up to x ~= 0.64 (36 m blade) .. 0.75 (46 m blade) —
  the lower two-thirds to three-quarters of every blade. Above that, where the
  blade curls out and thins to 14-18 m, it is single-loaded (rooms + gallery)
  and then sky gardens in the upturned face of the curl.
* Does it still READ as a blade? Measured as ratios against the reference's own
  blades (by eye from the photo: ~1:3 to 1:5 thickness:width in plan, ~6%
  thickness:height):
  - plan, thickness : width at the foot: 46:205 = 1:4.5 (widest) .. 36:130 =
    1:3.6 (narrowest). Same band as the reference.
  - elevation, thickness : height: 46 m / ~850 m = **5.4%**; 36 / ~450 = 8%.
    The reference is ~6%.
  - from 2 km, a 46 m edge subtends 1.3 deg against 24 deg of height: a fin.
* **Result: GO.** At arcology scale the blade is thin RELATIVE to its height
  and width precisely because it is so large; 27 m of rooms is 3-5% of an
  800 m slab. The no-go the handover feared bites at TOWER scale (a 300 m
  skyscraper's blade would be ~10% thick at 27 m and read as a slab tower), not
  here. So this is the arcology, with the reference's blade proportions and no
  quiet thickening. The renders bear it out: edge-on the blades are fins, and
  the concave faces carry a full window wall with galleries.
* Population, as a sanity check that it is a city: six blades, mean width
  ~160 m x mean double-loaded thickness ~32 m x ~150 floors of 4 m over the
  inhabited height ~= 4.6 M m2 gross -> **~90 000 people** at 50 m2 gross each.

## Scale — and why not 1 000 m
Tallest blade ~850 m to its tip (profile length 900 m), lowest ~450 m. The
brief suggested 700-900 m and the common brief ~1 000-1 150 m. I kept the
tallest at ~850 m because the form is a GROUP: six blades stepping 450 -> 850 m
round the ring, and the spread of heights is what makes it a flame. Pushing
the tallest to 1 100 m either stretches every blade (and the no-go margin with
it) or leaves the low ones as stubs against one spire.

## What it is (intact, d=0)
* **Six blades** round a ring, unequal (w 130-205 m, t 36-46 m, L 480-900 m)
  and unevenly spaced (gaps 16, 21, 31, 50, 66 m and the 135 m south entrance).
  Heights spiral from the low south-east blade to the tall north-west one.
  Each blade is a profile in (r,y) integrated from a lean angle (a slight
  inward belly, then the outward CURL, 58-80 deg at the tip), swept across a
  leaf-shaped tapering width, with a slanted tip (one edge 16-30% shorter) and
  a small sideways drift. Point function `P(u,s,o)`: across, along, through the
  thickness along the profile normal, so the thickness stays true in the curl.
* **Concave face = the city**: a 32 m window-wall texture (4 m storeys and bays,
  loggias, ~30% lit, own emissive mask, board-formed concrete between); a
  continuous gallery deck every six storeys (deck, parapet, painted-dark soffit,
  end caps), fins between decks, warm strips under alternate soffits, planting
  and people on the decks; **columns of real balconies** (5 414 intact) on the
  texture's own bays; gardens in the upturned face of each curl.
* **Convex face = the monument**: board-formed concrete, a 0.5 x 2.8 m slot
  window per 4 m bay per storey (~30% lit), and a **keel** fold along each face.
* **Covered plaza**: a 7 m coffered canopy at 118-125 m spanning blade to blade
  and across every gap (a 135 m lintel over the south entrance), buried in each
  blade to its mid-surface, radial ribs + ring beams + lights under it, a
  108 m oculus. Paved floor, reflecting pool, planters, lamps, ~260 people.
* **Stairs and portal**: the south stair (80 steps, 84 m wide) from a planted
  avenue through the widest gap; inside, the **portal stair** climbs 36 m on the
  north axis in three flights narrowing 44 -> 13 m into a slot portal between
  the two tallest blades (lintel 106-134 m, dark jambs, lit) and out onto a
  **bastion** over the north plain with a beacon.
* Nine **sky bridges** (box girders with windows) across the narrower gaps.
* Two-tier plinth (12 m each) with copings, lit slots, a planted lower terrace,
  trees on the plain.

## Ruin (d=1)
* **North-west blade (the tallest) snapped at 410 m**; its upper ~490 m lies on
  the plain NNW in three pieces — built with the SAME `piece()` between jagged
  break lines, rotated flat about the hinge, yawed/rolled, settled into the
  ground; moss, trees, vines and talus on and round them.
* **South-west blade snapped at 280 m and fell INTO the plaza**, through the
  canopy (the canopy is removed along its footprint).
* The other four blades have **lost their curls** (tops cut to 86-93% with a
  jagged line) — the silhouette goes from a flame to a broken crown.
* Both faces holed (fbm, denser near the top) onto a mid-thickness **section
  sheet** of floor plates/columns/partitions, built only where a face is holed.
* Dead windows, darker streaked concrete, stains; galleries in broken runs with
  slabs hanging; balconies 55% gone, some hanging; bridges left as stubs with
  the rest on the ground; canopy ~50% down in slabs on the plaza; plaza choked
  with talus, blocks, moss and trees; vines down the plinth; avenue broken.

## Measured (verify.py --assert --all-views, 16 views)
| | triangles | instances | meshes |
|---|---|---|---|
| blades/0 | 413 160 | 17 013 | 6 |
| blades/1 | 409 986 | 13 226 | 7 |
All six invariants PASS, error panel clean. Draw calls 18-25 over all views.

## Views
The Blades (hero) · The silhouette · Up between the blades · The stair and the
portal · The south stair · A concave face · The crowns · From above · Night ·
The plaza at night · Ruined · The fallen blade · Across the plaza · The choked
plaza · The broken crowns · The ruin from above. All derived from `BL_SITE`.

## Known weaknesses
* Sunlit convex faces still read quite pale at hero distance (the kit's lighting
  is strong and the haze lifts everything); greyer and heavier than the white
  stone, but not Darco-dark. The keel fold is subtle except raking.
* The fallen north-west pieces read as curved plates lying on the plain rather
  than as a massive shattered slab; no crater or scar where they hit.
* The fallen SW piece is legible from above/inside but hard to see from the
  hero (it is inside the ring).
* Ruin holes show the section as a pale lattice at distance; reads as exposed
  structure but is a painted section, not real floor plates (only the breaks
  have real plate fragments and bars).
* The window-wall texture repeats every 32 m; visible as a regular lit pattern
  on a large face close up.
* Hole edges in the faces are open (no reveal between the two skins); from a
  grazing angle you can see the gap.
