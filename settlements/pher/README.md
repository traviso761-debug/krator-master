# settlements/pher: Phēr, the north shore's fair

The town of 6,000 on the north shore of Erewhon's caldera lake: the lake's northern hub and the seat of Nōrth-Shor (P7),
held by the Sultan's heir. `PLAN.md` is the plan and the owner's answers. This folder is step P3: the town on `core/city`,
drawn with the Xanadu kit on Xanadu's page, as Qiblai's city is.

- `targets/town/89zp-ph-site.js` (`[G data]`): the ground (a closed form of the survey's profile: the lake, the strand, the
  caldera wall at 7 degrees, the rim plain; the cove, the headland and the east point; the Swīṭ Siṭrīm's channel and ravine)
  and the plan, as two `core/city` instances (the owner: two levels):
  - **Lower Phēr** on the strand round the cove and the wall's foot: the strand street, three terrace streets along the
    wall's contours, the cross lanes and the stair avenue (the lit avenue's foot); the quays, boat sheds, warehouses, the
    generator, the pilgrims' house, the teahouse, the bath, the Two Horns' factor house, and the governor's house on its
    bench; the watch and the harbour light on the headland.
  - **Upper Phēr** on the rim round the fair ground: the temple of the Decree, the grain office and six granaries, the
    caravan yard (the caravanserai is owed), the barracks, the bath.
  - **The lit avenue's switchbacks** up the wall between them, with a teahouse or a stall row on each turn.
  The blocks are filled by `core/city`'s frontage-courts with the Xanadu kit's houses (a quarter the Andean set: the
  Palopó shop-houses and cholets of Atitlán's lake towns).
- `targets/town/90q-ph-world.js` (`[web]`): the sky, the painted ground, the far ground to the caldera's rim, the lake.
- `targets/town/90r-ph-build.js` (`[web]`): every record drawn with `VERN.place`, chunk by chunk, with the runtime LOD.
- `targets/town/91z-views.js`: the views.

## Build and verify

```
python3 tools/build.py settlements/pher
node settlements/pher/tests/test-pher-site.js
KRATOR_GL=gpu python3 settlements/pher/verify.py settlements/pher/dist/pher.html --assert --views "Overview,From the cove"
```

The node test checks the plan: both levels laid; no overlap; nothing on a street, in the lake or on the stream; about
6,000 people; the civic pieces; the same twice. Each check has its negative. The verify runs Xanadu's page checks and the
town's own (`verify.py`'s docstring).

## The frame

The page is in metres, x along the shore, z toward the lake, y over the lake's level (the world's height is y - 520). The
open world's region (`openworld/xanadu-north-shore`) holds the ground round it. Placing the page there is a later step
(PLAN.md step P7): the page's frame turns by the shore's bearing (`PH.TURN`).
