# Station 2, the cloud slopes (`python3 build.py --station cloud` -> `dist/xanadu-cloud.html`)

Built 2026-11-03 (pair 6, the final rebuild). Fold into `PLAN-STATIONS.md`.

## The ground

Scale model: Cfb at old px 669,1263 (5.1: 941,1593), ~2.2 km, ~1,300 mm, +11 degC, 1.21 atm; Csb and BSk on the leeward shoulders.
The page is the Vale's 7 x 6.6 km square on the land contract (`45b-host-land.js`), x east, z south:

- **South-east, the windward face**, 1,450 m at the SE corner up to the crest; seven ravines cut down it, the main one (G0) with **the cloud
  stream** (`89w`: a `WATER.flow`, three falls with spray by drop; no still, so no breakers, no mirror).
- **The fog belt**, 1,900-2,650 m on the face (`LAND.belt` -> `ATMOS.fogBelt`, windward [.71,.71], density .0016), where the kit's `mist`
  field puts its `cloud` zone (the kit's tree-ferns, cloud frills, beard trees).
- **The crest**, SW-NE, ~2,750-2,950 m: rock and crag pines.
- **North-west, the leeward shoulders** falling to ~2,250 m: the kit's `dry` zone (garrigue, maquis), and **terraces** in patches (3.5 m benches,
  `CL.terraceK`).
- Far field: the face running on down SE, the ridge NE/SW, the lee falling NW. The sky at px 669,1263, 1.21 atm, humid, 62% cloud; the Vale's
  cataract band and plume are off (out of sight).

## New species (keys), all by `BIO.kin`, keys and indices of the sources untouched

| key | source | where | what |
|---|---|---|---|
| `cloudtrumpet` | `xanadu.lotustrumpet` | the belt | H x1.3, bole x1.1; beard moss and moss mats on the bole (8 a tree) |
| `cloudhaze` | `xanadu.hazeblossom` | the belt's lower half (< 2.45 km) | H x1.25, crown x.8; beards on the bole (5) |
| `mistfern` | `xanadu.cloudfern` | the belt and the wet ravines (< 2.7 km) | H x1.35, crown x1.15 |
| `cloudcherry` | `oidong.cherry` (EXCHANGES.md) | terraces and the face's clearings, 1.5-2.6 km | a cousin, the blossom a deeper rose (`OIDONG.PAL.blush` swapped while it grows, procedural blossom card) |
| tea | oidong's `lobe` + `teabush` (EXCHANGES.md, read in place) | the wet face below the belt, 1.5-2.15 km, in drifts | oidong's teaBush recipe on KRAND numbers |

Every placement is a KRAND lattice cell (`87-host-cloud.js`); a hero within `XANADU.LOD.tree`, its far blob past it. `?kin=0` grows none.
Counts at `?q=.5` (kit) / full (station): trumpet 415, haze 441, mistfern 8,298, cherry 464, tea 1,060, epiphytes 2,054; 22.1 M tris held at q .5.

## Checks (SwiftShader, `?q=.5`)

Pass: the station's band check (and its negative), the wet band / edge audit, the LOD-key check, every negative.
Fail, **all from the kit's own code or the base, not this station's** (the same items fail on the Vale's page):

- fruit: `lotus` not drawn (no lake). `LAND.fruitAbsent=['lotus']` is set; 99's fruit check must read it (base change, below).
- feet: 2,552 of 74,489 off the drawn ground (1,303 floating, 744 buried, worst 4.3 m down): the kit's floor items on slopes .35-.5 (grass 722,
  frond 596, trunk 443, clubmoss 229, cushion 209, mushroom 114), and `trunk` floats at terrainH - drawnH .38 m (placed on terrainH, not drawnH).
  The station is steep by nature (mean slope at the feet .44). `feetOwed` is left 0 so this shows.
- attach audit 3.4%: `whorlolive` 125/230, `feather` 76/347, `broad` 65/2164, `catkin` 37/85: kit crowns.
- card guard: `feather` (card.acacia) draws its whole sheet (needs a `cell`), `ginkgo` a crown with no `stems`: xanadu's materials.json.

## For the owner's eye

The fog belt's density (.0016) and height; the cloud cherry's rose (is it deep enough, too deep?); the terraces' pattern on the shoulders; the
mist tree-ferns' density (8k at half quality: the belt is a fern forest).
