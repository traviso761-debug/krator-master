# settlements/pher: Phēr, the north shore's fair

The town of 6,000 on the north shore of Erewhon's caldera lake: the lake's northern hub and the seat of Nōrth-Shor (P7),
held by the Sultan's heir. `PLAN.md` is the plan and the owner's answers. This folder is the town on `core/city` (steps P3-P8),
drawn with the Xanadu kit on Xanadu's page, as Qiblai's city is.

- `targets/town/89zp-ph-site.js` (`[G data]`): the ground and the plan (step P8, the owner's fifth round, 2026-11-17:
  "something more like santa cruz la laguna, but with dense alleys"):
  - **The ground** (`phH`): near the town a closed form (`phNear`): the lake and the beach shelving into it, the slope
    rising 21 % behind the strand and 10 % on up to meet the range; the Swīṭ Siṭrīm's delta round the cove's head, its
    gorge (its own bed at 8.5 %, 70-200 m deep), the town's spur east of it, the west spur behind the headland, a gully
    east of the town, a shelf on the town's spur; the cove, the headland and the east point. From 3.4 km round the town
    it gives way to the scale model's ground (`phFar`, the far grid `build.py` bakes into `gen/89zf-ph-far.js`, after
    `tools/scale-model/edit_517_vale_ring.py` ringed the lake with mountains), ribbed by a ridged field on the page.
  - **The plan**: one `core/city` instance. **The delta**: the quays, boat sheds, warehouses, the generator, the grain
    office and six granaries, the fair ground and its stalls, **the caravanserai** (the kit's new piece) and its mule
    yard, the pilgrims' house, the teahouse, the bath, the Two Horns' factor house; the strand street over the stream on
    a bridge (`xa_bridge`). **The hillsides**, on core/city's `hillside` strategy (`core/city/37-city-hillside.js`): paths
    up the town's spur and the west spur, contour alleys off them, stairs down the fall line, the kit's smallest houses
    packed along both sides. **The shelf**: the plaza, the temple of the Decree, **the heir's seat** (the palace, its
    gate, garden court, watch and the barracks of the Sultan's own guard); the water-stair on the cove with the heir's
    barge; the watch and the harbour light on the headland.
  - **The road** (`PH_ROAD`): from the plaza in 22 hairpin legs up the town's spur, east of the gorge, no houses on it,
    to the Thalaba road's first guide point (`PH.THALABA_GUIDE`, the region's link starts there).
  **The podiums and basements**: every building's record carries its footing's depth (`o.drop`), so the kit draws its
  rubble podium to the ground; the hillsides' houses carry their carved basement and, where the slope fits a whole storey,
  its door from the podium (`basement`, core/city `KCITY.hillside.basement`: never on the front, before a stair, a path or
  another podium, or on ground that does not fit), which 90r draws in the podium's face after the entry flights, dropping
  any door near a flight, a kit door or its house's own outside parts (`window._pher.basements`).
  About 930 houses for about 5,400 people, and about 110 stalls on the fair ground (the kit's new `xa_stall`). The flora mask comes from the records.
  **The boats** (`PH_BOATS`, step P4): the launches and cargo barges at the quays, 30 dugouts on the beach, 48 out fishing,
  and the runs from the tune (the cross-lake run's six carriers, the two market rounds, the pilgrims' launch).
- `targets/town/90q-ph-world.js` (`[web]`): the sky (the camera to 90 km), the painted ground with the library's sets over
  it (the biome pack's detail, the shore's sand and pebbles, the stream's gravel, the slopes' rock), the road's ribbon, the
  mid ground (40 m cells round the town), the far ground (300 m cells to the lake's far shore), the lake.
- `targets/town/90r-ph-build.js` (`[web]`): every record drawn with `VERN.place`, chunk by chunk, with the runtime LOD.
- `targets/town/90s-ph-boats.js` (`[web]`): the boats built once each and moved with the page's clock.
- `targets/town/91z-views.js`: the views.
- `kit.json`: the core/city bundle, the Xanadu kit's opt-in pieces (`kits/xanadu/extra`: the caravanserai, the lake craft,
  the caravanserai's rooms), and **the interiors** (step P5): `?interiors=1` plans and furnishes every house, the factor
  house, the inns, the barracks and the caravanserai's ranges, and the heir's palace walks in (the kit's hollow citadel
  palace).

## Build and verify

```
python3 tools/build.py settlements/pher
node settlements/pher/tests/test-pher-site.js
KRATOR_GL=gpu python3 settlements/pher/verify.py settlements/pher/dist/pher.html --assert --interiors --views "Overview,From the cove"
```

The node test checks the plan: the delta, the shelf and both hillsides laid; the road's hairpins clear of the gorge and
the gully, none over 8 %, no house on it, joined to the Thalaba road; no overlap; nothing on a street, in the lake or on the stream; about
6,000 people; the civic pieces; the boats afloat and the runs on open water; the same twice. Each check has its negative. The verify runs Xanadu's page checks and the
town's own (`verify.py`'s docstring).

## The frame

The page is in metres, x along the shore, z toward the lake, y over the lake's level (the world's height is y - 520). The
open world's region (`openworld/xanadu-north-shore`) holds the ground round it and, since step P7, the page's own ground
inside its footprint (`core/world/bake_towns.py pher`, `openworld/towns/pher`): `phWorldFrame` turns the page by the
shore's bearing (`PH.TURN`) and stands its cove head on the scale model's (842.5,1492), the lake at -520 m. Its stream
runs in the world at its own height (`core/world` 41t `over`), joined to the model's `r_pher_swit` on the plain the
scale model raised behind the rim (`tools/scale-model/edit_517_pher_rim.py`, PLAN.md question 17).
