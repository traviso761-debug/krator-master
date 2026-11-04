# Sea platform (prefix `sp`, seeds 20900-20999): hand-back notes

## Files and keys
| file | registers | seed | W x LAND x SEA |
|---|---|---|---|
| `src/89y-sp-1-yard.js` | `spYard` (`place:'sea'`) | 20900+d | 110 x 0 x 110 |

Dev target: `targets/spYard`. It has a local grid layout, `spDevGrid(cells)`:
the pier, then A off the pier head, B east of A and C south of A, with one
run per decay. Fragment name: `89y-` sorts after `87-`/`89-` and before
`89z-rows.js`. (`8a-` would sort AFTER `89z` and miss the target's
registry read.) Seeds used: 20900-20904. 20910-20999 are free.

## Design
* **A reclaimed-land mole, not a deck on piles.** Long Beach's piers are
  fill. The stamps give real ground contact. Two moles that abut merge
  flush through the stamp edge rule. The d=1 subsidence is a `ramp` stamp.
  There are no columns to pay for.
* **Frame.** Local z is [0,110]. N = the z=0 edge (toward the pier/land),
  S = z=110, W = -x, E = +x.
* **Joins** (`spSides(opt)`, later rules win):
  1. Geometry from `PORT_LAYOUT.items`. Another `place:'sea'` footprint
     abutting a whole side joins that side. For N only: the `pier` whose
     head (`PP.END`) ends 0-12 m short of our z=0 and covers at least half
     our width joins through a LINK SPAN.
  2. A four-sided `opt.nb.{N,S,E,W}`, when the grid layout supplies one:
     `kind 'seg'` joins and anything else is open. A two-sided coastal
     `{W,E}` nb is ignored.
  3. `opt.join={N,S,E,W}` booleans override both.
* **Open side:** quay wall with coping, fenders, ladders, bollards, tide line
  and lamps, plus a heavy bollard at each open corner.
* **Joined side:** fill and paving run to the edge. A plain wall stands below
  the deck: it is buried against a mole neighbour and gives a finished face
  under a piled one.
* **Pier join:** for an exact fit, place spYard at `gx = pier.gx +
  (PP.X0+PP.X1)/2`, `gz = pier.gz + PP.SEA`. The 8 m gap gets a link span:
  a slab at DECK, paved, white fascia and guard rail on its ends (the pier
  deck's own finish), and steel joint plates over the pier head's fascia lip
  and over our wall.

## Per decay (triangles per platform; shot names in `targets/spYard` views)
* **d0, 12-19 k:** two white warehouses, three blocks of 40' boxes, a
  rail-mounted gantry, a reach stacker, the office lit cyan, trucks, lane
  marks, people. Shots: `Intact`, `Intact A-B-C seam`.
* **d1, 18-25 k:** an open-water corner block subsides into the sea, with
  walls sunk and leaning and the paving awash. Stacks are toppled into the
  sea and slid on the slope. The warehouse roof is down. The gantry has
  collapsed onto the stacks. Weeds and trees. Shots: `Ruined SE corner of B`,
  `Ruined warehouse`.
* **d3, 38-48 k:** a container village with two container towers, a market
  in the lanes and the warehouse, solar, a house on the gantry, floating
  gardens and a house raft at the ladders, skiffs, string lights. Shot:
  `Reclaimed`.

## Weaknesses
* Cheap: well under the 60-150 k aim. There is room for more detail.
* The slump block tilts along z only, so its scarp is a straight
  rough-concrete face.
* The pier deck is 120 m wide and the platform 110 m, so the join has a 5 m
  step at each corner of the pier head. This is by design and reads as a
  stepped head.
* `spBasin` (a platform with an inner slip) was drafted and then withdrawn
  unverified when asked to stop. It is in git history at commit 31b5402
  (`src/89y-sp-2-basin.js`).

## Shared-change requests
1. **Pier:** skip the head's guard rail, fenders (and ideally the fascia lip)
   over `[x0,x1]` when a sea platform abuts its seaward end. Until then
   spYard filters `pkGuard`/`pkFender` out of `KIT.items` in the join band.
   That works only if the pier is built before spYard in layout order.
2. **Grid layout:** give sea platforms `nb.{N,S,E,W}` with N = -z. Place the
   pier's platform at the deck centre, as above.
3. **Showcase:** until grid placement lands, the coastal showcase lays spYard
   inline between coastal segments. It shows all four faces open, which is
   acceptable but not its intended use.
