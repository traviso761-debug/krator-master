# settlements/pher: Phēr, the north shore's fair

The town of 6,000 on the north shore of Erewhon's caldera lake: the lake's northern hub and the seat of Nōrth-Shor (P7),
held by the Sultan's heir. `PLAN.md` is the plan and the owner's answers. This folder is step P3: the town on `core/city`,
drawn with the Xanadu kit on Xanadu's page, as Qiblai's city is.

- `targets/town/89zp-ph-site.js` (`[G data]`): the ground (a closed form of the survey's profile: the lake, the beach
  shelving into it, the caldera wall at 7 degrees, the rim plain; the cove, the headland and the east point; the Swīṭ
  Siṭrīm's channel and ravine) and the plan, as three `core/city` instances (the owner: two levels, and houses along the
  lower switchbacks):
  - **Lower Phēr** on the strand round the cove and the wall's foot: the strand street, three terrace streets along the
    wall's contours, the cross lanes and the stair avenue (the lit avenue's foot); the quays, boat sheds, warehouses, the
    generator, the pilgrims' house, the teahouse, the bath, the Two Horns' factor house; **the heir's seat** above the top
    terrace (the palace, its garden court, its gate, the barracks and watch of the Sultan's own guard) and its water-stair
    on the cove with the heir's barge; the watch and the harbour light on the headland.
  - **Upper Phēr** on the rim round the fair ground: the temple of the Decree, the grain office and six granaries, **the
    caravanserai** (the kit's new piece) and its mule yard, the barracks, the bath.
  - **The wall:** the lit avenue's switchbacks, its three lower legs lined with houses on their lakeward side, a teahouse
    or a stall row on each turn.
  The blocks are filled by `core/city`'s frontage-courts with the Xanadu kit's houses (a quarter the Andean set). About
  1,190 buildings for about 6,300 people, and about 110 stalls on the fair ground (the kit's new `xa_stall`). The flora mask comes from the records.
  **The boats** (`PH_BOATS`, step P4): the launches and cargo barges at the quays, 30 dugouts on the beach, 48 out fishing,
  and the runs from the tune (the cross-lake run's six carriers, the two market rounds, the pilgrims' launch).
- `targets/town/90q-ph-world.js` (`[web]`): the sky, the painted ground with the library's sets over it (the biome pack's
  detail, the shore's sand and pebbles, the stream's gravel, the wall's rock), the far ground, the lake.
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

The node test checks the plan: both levels laid; no overlap; nothing on a street, in the lake or on the stream; about
6,000 people; the civic pieces; the boats afloat and the runs on open water; the same twice. Each check has its negative. The verify runs Xanadu's page checks and the
town's own (`verify.py`'s docstring).

## The frame

The page is in metres, x along the shore, z toward the lake, y over the lake's level (the world's height is y - 520). The
open world's region (`openworld/xanadu-north-shore`) holds the ground round it. Placing the page there is a later step
(PLAN.md step P7): the page's frame turns by the shore's bearing (`PH.TURN`).
