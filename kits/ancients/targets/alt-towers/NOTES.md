# alt-towers — arco alternates, towers group (queue item 3)

Target `alt-towers` (`dist/alt-towers.html`). Six from-scratch builders, one
fragment each, `src/8aj-alt-*.js`. None reuses an existing builder; they share
only kit helpers (`lathe`, `gridSurface`, `holeFn`, `windowsOnLathe`, the
salvage/fire kit) and a few helpers of their own at the head of
`8aj-alt-a-bole.js` (`altBox altTube altSweep altWin altRope altSag altLadder
altReclaim`, kdefs `altPortI/altPortD`, `ALT_STATE`).

## Contract

`buildAltX(scene,gx,gz,d)`, local to its own group at `(gx,0,gz)`, opens with
`reseed(N+d)`. Decays: **0 intact, 1 ruined, 2 reclaimed** (the ruin, lived in:
shanties, tarps, gardens, ropes, ladders, fire cards that show at night),
**3 rehabilitated** (the whole form in ruin materials; the scene loop sets
HOLES=.55 and runs repairPass). In each builder `brk = d===1||d===2` drives
structural loss, `dd = d>0` drives materials, `rec = d===2` the reinhabitation.

**Decay 2 is NOT toppled here.** In the kit's skyscraper rows `d===2` means
toppled; these builders read it as reclaimed, as the coordinator asked. When
integrating into `targets/kit`, give each row a `t` (the reclaimed x) as this
target does, and note that the kit's own toppled presets do not apply.

| key | builder | fragment | seed (claims) | budget class |
|---|---|---|---|---|
| `altBole`  | `buildAltBole`  | `8aj-alt-a-bole.js`  | 9802 (9802-9806) | sky |
| `altStack` | `buildAltStack` | `8aj-alt-b-stack.js` | 9815 (9815-9819) | sky |
| `altHotel` | `buildAltHotel` | `8aj-alt-c-hotel.js` | 9825 (9825-9829) | medium |
| `altFlat`  | `buildAltFlat`  | `8aj-alt-d-flat.js`  | 9830 (9830-9834) | sky |
| `altPerch` | `buildAltPerch` | `8aj-alt-e-perch.js` | 9835 (9835-9839) | mega |
| `altCult`  | `buildAltCult`  | `8aj-alt-f-cult.js`  | 9840 (9840-9844) | medium |

The allocated range 9800-9849 already held Library (9800-9801), Campus
(9810-9814) and Gate (9820-9824); the seeds above are the free blocks in it.

Rows (`89z-rows.js`): one per type along +z; intact x=-s, rehabilitated 0,
ruined +s, reclaimed t=2s. Views (`91z-views.js`): `The rows`, then per type
`<name>`, `<name> ruined`, `<name> reclaimed`, `<name> rehabilitated`,
`<name> by night` (the reclaimed one, night), `<name> close`,
`<name> reclaimed close`.

Shared-file edits (additive, one line each): `build.py` TARGET_OUT gains
`'alt-towers'`; `src/91-probe.js` BUDGET.type gains the six keys.

## Verification

`build.py --target alt-towers` -> `jscheck.py` PARSES OK. The machine was at
load ~50 (nine agents), and the full page did not finish loading inside
verify.py's 300 s `goto` timeout twice, so the shots and asserts were taken on
lighter copies of `dist/alt-towers.html` (same script, `DECAYS` and the row
list cut down to 2-3 types; see "Scratch pages" below). Every type/decay pair
was asserted that way: error panel clean, registered-volumes-non-empty, no-nan,
per-type budget all PASS. Draw calls 37-90 per view.
A final full-target run (all 24 pairs, views `The rows` + `The Bole by night`)
then loaded at lower load: error panel clean, every invariant PASS, 2 594 346
scene triangles, 124 registered volumes, 78 892 instances, 184 draw calls at
the overview.

Scratch pages: copy `dist/alt-towers.html`, replace `const DECAYS=[0,1,2,3];`
and add `if([...keys].indexOf(k)<0)continue;` at the head of the `ALT_ROWS`
loop. The whole target is ~2.6 M triangles, 24 type/decay pairs.

## Triangles per decay (scene content, verify --assert)

| type | d0 intact | d1 ruined | d2 reclaimed | d3 rehabilitated | ceiling |
|---|---|---|---|---|---|
| Bole (altBole)          |  72 548 |  79 932 |  90 668 |  69 324 | 400 000 sky |
| Pierced Stack (altStack)| 114 472 |  98 556 | 100 856 | 105 532 | 400 000 sky |
| Attraction (altHotel)   | 241 132 | 187 332 | 194 782 | 241 428 | 250 000 medium |
| Undulant (altFlat)      | 178 820 | 146 588 | 145 562 | 197 978 | 400 000 sky |
| Rig (altPerch)          |  29 532 |  36 372 |  52 412 |  37 010 | 700 000 mega |
| Bloom (altCult)         |  33 748 |  46 818 |  53 306 |  39 638 | 250 000 medium |

## Per builder

### The Bole — alt skyscraper (`8aj-alt-a-bole.js`)
Six swept ribs rise from a root-foot 88 m out, twist a third of a turn into a
30 m waist and branch at 210 m into three off-axis canopy saucers (R 70/56/46)
round a fluted core to 340 m. Seven planted trays with glazed drums of rooms
under them, narrowing upward. Ruin: top saucer down on the plain (its two ribs
torn stubs with hanging cable), middle saucer dropped at one edge, core snapped
at 296, decks holed, drums dark with floors showing, trays overgrown.
Reclaimed: shacks/fires/gardens on trays and saucers, hoists, plank ladders up
two ribs, a tarp market on the plinth.
Refs: arco1 #18 (tree arcology on splayed legs), #111 (twisted trunk under
stacked rings), arco2 #42 (desert tree tower), arco1 #16 (balconied drum tower).
Weak: reads more "ribbed tower" than "tree" from the side; the saucers carry no
branching struts beneath; trays are plain circles; the drums' window grid is
regular.

### The Pierced Stack — alt skyscraper (`8aj-alt-b-stack.js`)
Eight-lobed waisted shaft (hyperbolic waist, cusped bays), 34 m up on eight
trumpet pilotis round a glazed lobby; a porthole per bay third per storey
(own 28-tri `altPortI/D`); storey bands every 12 floors; a lined oculus 38 m
across at 272 m with collars and a spoked wheel; eight crown turrets and a mast.
Ruin: crown burst (jagged cut at 326, floors open), a 70 m breach on the SE
showing floor plates, one piloti sheared and lying on the plain, wheel mostly
gone. Reclaimed: homes and fires on the breached floors, a village inside the
oculus, hoists, a market between the pilotis.
Refs: arco2 #0 (Goldberg's lobed tower on flared legs), #26-28 (Soleri Babel
IID), arco1 #20 and #5 (desert towers pierced by a round opening).
Weak: the breach reads weakly at hero distance; the oculus lining overshoots
the bay valleys by a few metres (hidden by the collars from most angles); the
pilotis are slight against the shaft.

### The Attraction — alt hotel (`8aj-alt-c-hotel.js`)
Thirteen fluted parabolic spires on an arcaded superelliptic podium: a 206 m
central spire with ring balconies under a six-point star, four 128 m spires
fused to its foot, eight 66 m turrets; arched windows in every flute trough;
roof garden; a great parabolic porch. Ruin: centre snapped at 124 m, its top
third lies east on the plain; one great spire and two turrets broken; balconies
dropped; arcade holed. Reclaimed: shacks round the surviving balconies, plank
rope bridges spire to spire, a market under tarps in the arcade.
Refs: arco2 #47 (Hotel Attraction), #43 (Craglorn tower's stacked balconied
stages), arco1 #6 (the hotel's fins).
Weak: at 96% of the medium ceiling (windows are 60-70% of it); no entrance
court or drive; the balcony rail is a fat torus.

### The Undulant — alt flatiron (`8aj-alt-d-flat.js`)
A filleted 38-degree wedge, 34 floors (145 m). Every floor edge waves on two
wavelengths, out of phase floor to floor (white metal lips over a swelling
board-formed wall); iron balcony tangles where the edge reaches out; an arcade
of piers on a recessed dark-glass ground floor; rolling parapet; roof of
twisted helmeted chimney stacks and three tiled stair domes. Ruin: the prow is
down to ~50 m with the floors stepping back from the break and the facade torn,
most chimneys fallen, iron dropped. Reclaimed: terraced homes under tarps on the
broken floors, ladders and lines down the break, roof gardens.
Refs: arco2 #40-41 (Casa Mila), #57 (sci plate blocks), arco1 #6.
Weak: at hero distance it reads as a window-dense block; the undulation only
reads from close (see "The Undulant close"); the windows are uniform boxes.

### The Rig — alt perch (`8aj-alt-e-perch.js`)
A two-deck platform 124 x 84 m, 100 m up on four splayed lattice legs (chords,
X-bracing, ties), a town of stacked and cantilevered blocks, two capped stacks
and a crane on top, rooms hung inside the inter-deck truss and off its edges,
pods and cables beneath; a cup 80 m across on a stem at 122 m with slung pods;
a truss bridge deck-to-rim. Ruin: NE leg buckled at mid-height (deck dropped
there), crane over the edge, one stack snapped, bridge broken with both halves
hanging, dish holed, two pods on the plain. Reclaimed: shanty town on both
decks and the cup, a sagging plank bridge where the truss was, ladders up two
legs, hoists, a ground camp.
Refs: arco1 #3 (rig town on lattice legs), #8 (disc on a stem with pods),
arco2 #43 (Craglorn bridge), arco1 #0 (stacked rig with capped towers).
Weak: light (30-52k) — room to add deck detail; the deck is a plain box; the
leg chords are open tubes.

### The Bloom — alt cultural centre (`8aj-alt-f-cult.js`)
Four 2 m-thick cupped concrete petals from one stem, 85 m, opening over a
14-step ring of seats; a ring wall whose top swells and dips and rears at two
gates; six white drum halls out through the wall, each ending in a round window
with ring, hub ring and twelve radial mullions; platform and causeway; kiosks.
Ruin: one petal snapped at half height and its blade lies across the precinct,
the others holed, wall breached, two halls fallen in with their window frames on
the grass. Reclaimed: market stalls on the seat treads, lean-tos and fires
against the inside of the wall, lines between petal tips, a ladder up a petal.
Refs: arco1 #51 (Stone Flower, Jasenovac), #46 (Ilinden, Krusevo), arco2 #9
(Kavadarci ossuary precinct).
Weak: the fallen blade's placement is approximate (dropFragment of a nested
rotation); the petals have no fold ribs; seats are one lathe with no aisles but
the axis gap; light on triangles.
