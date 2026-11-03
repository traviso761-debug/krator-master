# Station 4, the descent (`python3 build.py --station descent` -> `dist/xanadu-descent.html`)

PLAN-STATIONS.md station 4, narrowed by the owner (2026-11-03): the Vale's lake's outlet, **the cataract** (owed by the kit as geometry) and Ālph's run down
its valley to the floor, ending where the river reaches the floor's lake. The floor's own flora (the Rift's natives competing with tall Xanadu forms round the
easternmost Rift lake) is the coming `floor` station's. Built 2026-11-03 in the xanadu rebuild turn (pair 6) on the base page's land contract
(`src/45b-host-land.js`).

## Files

| File | What |
|---|---|
| `45a-host-descent-land.js` | **the reusable ground** (`DESCENT`): the axis, the heights settled, the step and its amphitheatre, the cataract's foot (`RIV.pool`), the valley, the floor strip, Ālph's line, bed, water and mouth. A `floor` station reads it in place: `"reads": {"45a-host-descent-land.js": "biomes/xanadu/stations/descent/45a-host-descent-land.js"}` in its station.json |
| `45b-host-land.js` | this station's fields (the kit's zones) and `LAND` |
| `89-host-sky.js` | the shared sky at px 652,1248, 1.9 atm, wet; no painted cataract (it is on the page) |
| `89w-host-water.js` | the Vale's lake at its outlet, Ālph with its falls (the cataract with the tall-falls options), the plunge pool, the floor's lake with Ālph's plume |
| `87-host-descent.js` | the station's checks and negatives |
| `98-host-views.js` | 13 views from the land's records |
| `station.json` | drops the Vale's fountain and dome ruin; no kin |

## The ground on scale model 5.1 (sampled from `tools/scale-model/model/data/h.png`, `wl.png`, `rivers.json`; old-canvas px)

| Where | 5.1 | Page |
|---|---|---|
| The Vale's lake (wl at 591,1173) | -717 m | +989 (`LAKE_Y`) |
| The SE rim beside the step (609-621, 1195-1210) | +985 to +1,536 m | the plateau and side ridges, +990 to +1,330 |
| The cataract step (tranche3 sculpt: px 635-670, 1230-1265, a -240 m step on the normal (.72, .69)) | cells at -1,234 to -1,461 m | the escarpment, a 265 m face, a horseshoe amphitheatre round the falls; the cataract draws as one 250 m fall into its pool |
| The floor's lake (663-687, 1263-1293) | -1,685 to -1,706 m | the page's datum, 0 |
| Ālph (`r070`, frozen name): -232 -> -1,646 m, 59 km, into the lake at -1,706 m ("the sunless cavern sea") | | the river below the Vale's lake, over the cataract to the floor's lake |
| Alph's chasm amphitheatre (575, 1198; tranche3's -195 m sculpt) | +286 to +1,285 m round it | not on this page: it is the base page's chasm (the river's source in the vale's south-west), which agrees in direction |
| The `floor` station's lakes (5.1 px 909,1556 salt lake XV; XA lakes 869,1558 and 883,1552) | -1,362 m (the salt lake) | +344 on this datum |

The model's 2 km cells are noisy at this scale (neighbouring cells swing by 2 km), so the page takes the levels (the two lakes, the step's drop) and the
step's direction (the page's axis runs south-east), not the shape. **The outlet has no record of its own** in `outlets.json`; the river below the lake is named
**Ālph**, the model's frozen name for the sacred river's course to the sunless sea. PLAN-STATIONS.md's -1,400 m floor (survey 4.23) is -1,706 m on 5.1.

## How the drop is compressed

989 m of drop and about 60 km of the model go into one axis 6.8 km long (the square turned 44 degrees): the lake and its outlet in the north-west corner, the
step at s ~ -1,750 (the amphitheatre cut back to s ~ -1,980 where the river goes over), the valley falling 640 m in 3.6 km (17%: rapids all the way, and a
second step, the lower falls, which draws as 65 m), then a strip of floor at +80 to +3 and the floor's lake in the south-east corner. The datum is the floor's
lake (page y = model m + 1,706), so the kit's own rules (`minY` .8 above the water, the shore zone under 10 m, 45c's water mask) read the floor as the Vale reads
its lake shore.

## What grows

The kit's own passes only (`XANADU.zones` on this land's fields): the Vale's species on the plateau and the lip, the chasm's (tree ferns, cobra lilies, frills)
in the cataract's spray (`mist`), the crag's on the step's faces, the garrigue (whorl olives, pitaya, cloud pines) on the dry side ridges in the lee, the river's
banks all the way down (46,966 trees on SwiftShader's load).

## Water

The lake (`WATER.open`, +989, the shore grid kept to the lake's side by `land`, no surf, no breakers), Ālph (`WATER.flow`: the outlet a hand under the lake's
level to the lip, flat through the pool, `chute` .3, spray at the rapids), its falls by `WATER.fallsOf(fit)` with the tall-falls options (`plungeR`, `footK`,
`lipK`, `margin`, `spray:'drop'`): 250, 65, 11 and 22 m; the floor's lake (`WATER.open`, 0, still) with Ālph's milky plume (`tintFlow`, `?plume=0`), breakup on
all, the reflections switch on the floor's lake (off at load). The fog belt sits on the step's south-east faces (the cataract's mist).

## Checks on SwiftShader (2026-11-03)

Pass: the cataract (one 250 m fall, its foot 63 m from the pool's middle, the pool's water over all of its bowl), Ālph reaches the floor's lake (-.06 m at its
mouth), the water's edge (no tree in the water, the env's fields in their units), one LOD key per tree; every negative fails as it should. Not passing, all the
kit's or the base's, not this ground's:
- **fruit**: whorl olives 0 although 10,014 whorl olives grow: the fruit check counts instances the runtime LOD shows from the camera, and the olives hang on
  heroes far from the default view. A base change: count the olives as placed, or name them per station.
- **the feet**: 1,226 of 60,906 (2%), all the kit's floor items (grass 542, trunk 294, frond 178, star 86) floating 2-4 m on the steep valley; `feetOwed` holds
  that number as a ratchet. The kit's floor pass seats on a height that is not the drawn mesh there.
- **the card guard** (the kit's feather/card.acacia, ginkgo, blossom, needle/card.pine, raceme) and **the attach audit** (6.64%: blossom, raceme, catkin, frill):
  the base page's own items; this page has more of them.

## Open

- No GPU verify here (the parent's), no look by the owner.
- 45c reads `LAND.mask` as yes or no; a weight would allow a smooth fade (a one-line base change).
