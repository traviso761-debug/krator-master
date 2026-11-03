# Station 5, the Rift floor (`python3 build.py --station floor` -> `dist/xanadu-floor.html`)

The owner (2026-11-03): "we may also need a hyperjungle/abyssal station for the region of hyperjungle adjacent to the easternmost rift lake";
"here, we would have native rift flora and tall versions of xanadu flora competing for dominance". Built 2026-11-03 in the xanadu rebuild turn
(pair 6) on the base page's land contract (`src/45b-host-land.js`).

## Files

| File | What |
|---|---|
| `45b-host-land.js` | the land (`FLOORLAND`: the salt lake, its shore and flats, the floor rising south-west, two dry creek beds, the front's field), the five fields, `LAND` |
| `89-host-sky.js` | the shared sky at old px 637,1226, 1.9 atm, wet; **the cataract on the skyline** as the sky's landmark layer (band and plume at az 146) |
| `89w-host-water.js` | the salt lake: `WATER.open` at 0, still (`surf:false, breakers:false`), shallow, a tint of the salt crust's white and a faint yellow; breakup; the reflections switch (`LAND.mirror`, off at load) |
| `87-host-floor.js` | the two floras, the front, their impostors, the check and its negative; no lotus on the salt lake |
| `98-host-views.js` | 11 views (the front from above and in the stands, each flora's end, the mixed middle, the shore at the front, the cataract on the skyline, a creek bed) |
| `station.json` | the Rift's species and trees read in place (`kin`), its tree families in the pack; drops the Vale's fountain and dome ruin |

## The ground (scale model 5.1, `basins.json`)

The easternmost lake of the Rift's floor: a salt lake at 5.1 px 909,1556 (old canvas ~637,1226), -1,362 m, 176 km², XV, with two hypertropic (XA)
salt lakes just west (869,1558 at -1,645 m; 883,1552 at -1,150 m). The page's datum is the lake (page y = model m + 1,362). It sits at the north-west
corner of the SE cataract step (old px 635-670, 1230-1265), so the cataract stands south-east of it, off the page: on the sky at az ~146.
**Note:** the descent station's own floor lake ("the sunless sea", -1,706 m, old px 663-687, 1263-1293) is a different, lower lake, the one Ālph
enters below the step. This page does not read `descent/45a` (its datum and axis are the descent's); it takes its own ground on the same model.

## What grows

- **The kit's own tree pass is off** (`LAND.mask`), as on `ranges`; its floor planters run on the hypertropic fields (litter, ferns, moss, cobra lilies).
- **The Vale's flora, tall** (`BIO.kin('xanadu.<key>')`, keys `tall<key>`, scaled 1.35-2.2 in height for the dense air): dawn redwood, Caucasian
  wingnut, haze blossom, lotus trumpet, wisteria, agate tree, chestnut-leaved oak; under them the cloud tree-fern, cacao, violet plantain.
- **The Rift's own** (`biomes/rift` in place, `BIO.kin('rift.<key>')` on `RIFT.make/grow`; its station 2's jungle list): bell palm, lobe tree, trumpet
  tree, pagoda tree, the odd frill tree, the maw trumpet on the shore; under them the croton, curl succulent, prism bush, carrot frill, anemone stalk,
  the thornwhip in the wet.
- **The front** (`FLOORLAND.front`): a noise-warped line north-east to south-west; each cell's flora by a weight crossing over ~900 m. Measured on
  SwiftShader: the Vale's share of the canopy 99% on its side (4,497 trees), 51% in the middle (1,132), 0% on the Rift's side (8,542).
- **Owed:** the Rift's **parasol tree** and **violet dome tree** (their crowns' `broad` cards floated, 112 of 578: the Rift's turn holds them with
  `BIO.holdTo`, then they are added back here).

## Numbers (SwiftShader, 2026-11-03)

15.8 M tris held, 513 k instances, 1,305 heroes (within 230 m of the spine; the understorey 160 m), 13.6 k far trees as octahedral impostors
(two sets: the Vale's, the Rift's; each impostor registered in its own kit's registry). Attach audit 0.54% (broad 7/298, urchin 5/85, blossom 4/77).
The card guard passes; the error panel is clean. Not run on the GPU.

## Checks

The station's: both floras hold their ends and mix in the middle (negative: the front read backwards fails). The base's: fruit, the water's edge,
the card guard, the attach audit and the LOD key pass; **the feet** pass only on `feetOwed` 508 (below).

## For the base (src/)

1. **`HELD_ITEMS` in `src/99-host-take.js` should list `biome:frond` and `biome:mushroom`**: 457 fronds and 37 mushrooms are the kit's floor pass's
   ferns and mushrooms on its fallen logs' backs (`60`, `log()`), held by the log, so the feet check counts them as floating. With them listed,
   `feetOwed` here falls to ~14.
2. **`lilypad`, `cup` and `lotuspod` want `{free: true}`** in `src/50` (on water by design: the attach audit's class 6). Here the lotus pass is kept off
   the salt lake instead (87: the flow field reads 1 over it while the kit builds).
3. **The "no whorl olives drawn" negative passes on a station with `LAND.fruitAll: false`** (the undrawn test is skipped, so the negative cannot fail):
   skip that negative when `LAND.fruitAll === false` (ranges and gills have the same).
4. The edge check reads `XANADU.TREES` (empty here: the kit's tree pass is off), so it audits no tree on this page; the station's trees are in `FLOOR.trees`.

## Open, for the owner's eye

The front's width and line; the tall Vale trees' scale against the Rift's (the frill tree's column still out-tops both); the salt lake's colour; the
cataract as a sky landmark rather than geometry.
