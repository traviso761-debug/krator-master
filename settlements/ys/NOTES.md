# Ys — notes, round by round

## Phase 0 (Oct 2026): the harness and the empty world
The folder on the Ancients-lineage contract (PLAN.md §0): `build.py` from Iziz (targets discovered the port's
way, vendoring recorded in `VENDOR.json` with the adapted set, the union seed check over every upstream, node's
syntax check), `verify.py` from the port (`--hour`, `--marks`, the hidden `#viewbtns` list drives the camera, a
`VERIFY_CHROME` override), `jscheck.py`, `run.sh`.

Vendored byte-identical: the Ancients core (`10 12 30 32 34 36 38 50 54 69 99`, `core/materials` through the
resolver), the port core/kit/edges/dress (`70 72 73 74`), the Iziz vernacular materials and helpers (`69b 69c`,
needed by the ported Voth Embassy and the chapterhouse later), the Krator sky (`81`) and the labels (`93`).
Adapted: `71-port-terrain` (two lines), `92-camera` (the Ys pack with the compass). New: `00-head` (a clean shell
with the polygon tool's DOM and the compass canvas), `60-ys-registries` (MARKS, ROOMS, SPOTS, HOSTS, BERTHS,
FERRY_STOPS, WET_DOORS, NAV_EXTRA and the `HYK.def` registry, declared before any pass exists), `91-ys-probe`
(the six Ancients invariants with the port's merged-mesh sampling, the tag audit, the coast check, the door and
residence-spot checks that will bite from phase 1).

`targets/city`: `84-city-geo` (CITY constants, the bay shoreline as a polyline from the south-middle edge to
the NE corner, `ysShoreDist`, `YS_NAT`: beach, hinterland rising ~18 m per km, seabed to −30 m), `89z-rows`
(TITLE, an empty port layout), `90-ys-scene` (renderer, named lights, `KratorSky` with the clock `YSCLOCK` and
`setHour`, night hooks for the sea and the fire kit, the port's stamp → terrain → builders → `kbake` order),
`91z-views` (five presets, the night one at 22.2 h), `93-ys-ui` (hour slider, `_api.city`).

Tooling in this container: `pip install playwright==1.56.0 pillow`; the pre-installed Chromium 1194 matches.

### Verified (Oct 1 2026)
`verify.py dist/ys.html --assert` on the empty world: error panel clean, 8 draw calls, 126 k triangles
(all terrain and sea), all ten invariants pass (the six Ancients ones, the coast as designed: bay head +3.5 m,
SE corner -29.6 m, NW corner +43 m; tags, doors and residence spots trivially), `_api.setCompass(true)` lights
the button and the gizmo, `--marks` writes an empty list. A run of five views takes about a minute here.
What the shots said: the bay bites north-west as drawn; the sea's glitter and fresnel read; night has stars;
the rose and the ground gizmo agree with the geometry (looking NW puts N at upper right). Fixed from them:
a preset without an hour had inherited the previous preset's night (now: no hour means the default day); the
bake invariant failed on a world with nothing to bake; the first opening camera stood too low to see the bay.

## Phase 1 (Oct 2026): the Hykkousoi mockup
Three fragments carry the vocabulary (PLAN.md §1): `60-hyk-mat` (the shell/barnacle/bone/mosaic/crust/weed
textures, the vertex-coloured material pairs, the nacre hook, the small kdefs: lips, reveals, discs, lenses,
pearls, drips, treads, posts, weed cards), `61-hyk-shell` (merged buckets per material per side, the parametric
surfaces: lathe with lobes/flutes/twist/growth rings/noise/tilt, pod, conch, tube, rib, flare, disc, deck, and
holes cut by a boolean-free op list), `62-hyk-helpers` (`HYK.place`, openings that MARK themselves, rooms and
spots, floors, pads, the spiral stair, the span). `64-hyk-accrete` cuts an Ancients host at `YS_CUT.cutY` through
the builders' own `y1` path (`52-sky-abc` adapted, three lines), raises its tideline and grows pod colonies on it.

`targets/mock`: a sandbar at (−330 … −160, z) with three houses (barnacle hut, pod house, conch house), two
Scallop Stack hosts cut at 110 and 94 m (seven floors kept on A), an L1 colony with a landing and a stair to a
wet pad and a skiff, an L2 colony on each tower and the span between them; 14 presets, inside presets use the
ninth element.

Rounds (what the shots said → what changed): the barnacle texture read as planks → plates of uneven width
with growth lines, a lighter grey-white; open cone tops → domed lids with a vent; the conch coiled flat and its
mouth read as a cave → `apexLift`, shoulder knobs, a septum wall with a real door; drips floated → placed on
the pod underside; one pod per host → a colony of a main pod and two satellites with a pad and a rib; three
bedroom spots overlapped → the sleeping pod grew to r 2.3 and the spots spread; the nacre banded orange at
grazing angles → the sheen halved and the rainbow slowed.

### Verified (Oct 1 2026)
`verify.py dist/mock.html --assert`: error panel clean, 0.55 M triangles, 47–87 draw calls across six views,
all ten invariants pass (5 registered volumes, 55 marks, 7 residence rooms, 30 spots inside their polygons and
clear of doors and of each other). The gate sheet is the fourteen presets of `targets/mock/91z-views.js`.

### Round 2 (Travis's notes on the first sheet)
Agreed reads fixed: the barnacle colony crowds unevenly (four cones of four sizes, each leaning its own way); the
conch's annex moved to the back of the whorl and shrank, the spire rose again (`apexLift` 5.2), the forecourt
shrank and darkened, and the rich preset looks from the south-east so the spiral owns the frame; the span is a
backbone now (a spine with a knuckle every 2.6 m, vertebrae every other sample, knuckled edge ribs).

Added: **small podiums** (`YS_CUT.podium` shrinks the kit's plinth; the kit has no small-podium variant of its
own, its plinths were already "the smallest circle that carries the struts", so Ys cuts below that and lets the
struts and legs stand in the sea), the two hosts 160 m apart instead of 188. **Branches and runners** on
`hykBridge`: the A–B span forks to a perch on A's strut head 17 and sends a runner to each of the two strut heads
it passes (`host.members`, mirrored from the kit's constants). **Ways in**: a pod per host sits on a floor plate
with a back door onto it; the adapted builders cut its hole through the skin and the lining, the plate is a
`hostfloor` deck, and `every-host-has-a-way-in` is the eleventh invariant. The hosts were re-sunk for it (A −36,
so its first plate is the L2 datum and its cornice collar a 110 m walkway at +31; B −25, plates at 12 + 5k).

Found on the way: the port's `REGISTER` already applies the group transform, so `ysPlaceHost` had been moving
every host volume twice (280 for 140); the kit's full decay eats most of a tower's skin (the inside of A looked
out to the sea), so a host now builds with `HOLES` .4; `ysHostInhabit` marked the nearest floor however far it
was. Logged in the kit: the towers have no stairs between their plates (`kits/ancients/KNOWN_ISSUES.md`).

### Verified (Oct 1 2026, round 2)
`verify.py dist/mock.html --assert`: error panel clean, 0.49 M triangles, 43–85 draw calls across sixteen views,
all eleven invariants pass (5 volumes at their true positions, 59 marks, 2 hosts each with a way in, 7 residence
rooms, 30 spots). `_mock`: 4 pods, 4 landings, 2 ways, 2 runners, 1 branch, 42 members on A.

### Round 3 (Travis's notes on the second sheet)
Railings meet now: the parent's rail opens over a branch's width with a knuckle at each end and the branch's rails
start on those ends; runners grow out of the edge rib. The perch is a 3.4 m railed pad with the rail open toward
the branch. Beside a way-in pod the satellites sit further round, clear of the wall hole, and are hollow, so the
inside of the host sees their inner skin and not their culled back faces (the "inverted geometry" in Travis's
shot); a bedded pod's fillet is shallower (its lip had shown as a torn collar round the pod). Host volumes shrink
to their caps: the kit's 130 m radius had B's volume reaching A's pod, and the inspector named it after B.
The runners' far ends had floated (Travis's second shot): a strut head was a vertical capsule whose crown stood
above the kit's box, and the flare lay on a plane across the runner. A member is now a capsule or a box with its
axes, `hykSegNearest` returns the surface point and its normal, the rib ends half a metre inside the member and
the flare lies on its face: runners land on the strut heads' tops.
Then (Travis's third note: end caps off centre, the fork a blob): a runner is a cubic that arrives along the face
normal and goes straight in, so the flare is centred on the rib; a box is landed on a face, never an edge or a
corner (the nearest point inside the face rectangle shrunk by the flare's radius, the top face preferred from
above); the fork is a crotch tube from the parent's spine to the branch's spine through a knuckle, no ball.
Travis's two viewpoints are presets now ("the way-in pod from above", "the landing from above").
Fourth note (caps a little high, one curb clipping the parent and the other short, the branch clipping the
landing): the flare is set .3 m into the face; a branch's start is mitred, its corners slid along its own
direction onto the parent's edge line, one cut back and one extended by the same amount (Travis's "rotate the
clipping piece and staple it to the other side"), and the parent's rail opens exactly between those corners;
the branch leaves further along the span and the perch sits on the head's outer half, clear of the landing.
Fifth note (the perch inside the wall, a runner's open end showing): "outer half" had been sideways along the
head, at the same radius, so the pad stood mostly inside the skin; the perch now cantilevers out along the
strut's radial axis on a rib from the head's outer face, 2.5 m clear of the wall, and every runner's buried end
carries a ball.
Sixth note: the ball moved to the flare's lip, centred on it at the lip's diameter, so the rib enters through a
knuckle and the flare-to-rib step is gone. Seventh: a second ball at the flare's rim, the rim's diameter, half in
the face: the root. (A concave fillet always lies inside the sphere on its rim, so the bell is now the hidden
transition between the two balls; the look is rib, knuckle, root.) Eighth: the flare slid half its length up the rib,
the root ball fixed by q and n alone, so the bell's lip end stands out of the root; rib, knuckle, bell, root.

## Phase 2 (Oct 2026): the fan-out
The gate passed. Before the agents: `targets/kit` (the sheet: every `HYK.def` by row with generated presets, grown
defs on Scallop Stack hosts in the sea, a Furniture row), `HYK.placeOn` and the G frame (62), `35-furn-frame.js`
(the Ancients-lineage `F` adapter, `FURN`, `placeFurn`), a grown-on worked example beside the three mock houses on
the sheet, and two of Travis's notes fixed in the shared code: the accreted pod's lamp on a bracket, the drips read
off the pod's own surface. The mock's seeds moved to 31950–31979 so the agents' blocks are free. Eleven agents in
worktrees: A housing, B shops, C hospitality/sacred/markets, D Amphitriton and Citadel, E Tides, Winds, Pharos,
F spans and harbour, F2 industry, G military and agriculture, H library, treasury, prison, I furniture, and the
biome agent on `biomes/nwbay`.

## Phase 3 prep (Oct 2026, while the agents build): the layout as data
Prototyped in Python first (a map drawn with ImageMagick, judged before any code): one 200 m lattice rotated 12°
anchored on the head of the bay, blocks from 820 m inland to 800 m offshore; the sink is the old city plane by signed
shore distance (1.5° plus a 4 m step past 260 m: awash to 85 m out, canals to 270, open water beyond, −17 m at the
Amphitriton, −22 at the seaward edge); the Amphitriton is the drowned block nearest 450 m offshore on the head's
seaward line (it lands at 539 m), the Tides toward the shore from it, the plaza along the shore, the Library between,
the Winds and the Pharos on the seaward edge either side of its line, the Citadel three blocks along the southern
flank, the military harbour and the Wet Cells on the shore side to the south-west; on land the market block at the
head, the civilian harbour and fishing docks along the shore south-west, the river mouth and the headland beyond, the
foreign quarter two rows inland north of the market, industry either side, the pens in the shallows north-east; wealth
by distance from the Amphitriton (300/620 m at sea, 520/900 on land); drowned blocks 75 % hosts (tall in open
water, mid in the canals, low awash) and 25 % home-grown moles by a hash of the block. Ported number for number to
`targets/city/87-city-layout.js`, which builds no geometry: the sink feeds `YS_NAT` through `ysSinkMix`, the
overlay (`CITY.LAYOUT_DEBUG`) draws a quad per block with the named blocks labelled, and `_api.city.layoutCensus()`
counts. The terrain's 10 m cells now cover the city core (`PORT_LAYOUT_DEF.fine`).
Then the land–sea model (`84b-city-shore.js`: shore loops by arc length, the 12 m surface lattice classified once
after the build, `landDist` as a signed chamfer distance that sees decks, hosts as cantons with `hostEdge` and the two
margins) and NAV (`87b-city-nav.js`: 6 m grids per layer, ground/L1/L2/boat/swim, classified once from the lattice,
the bucketed deck records, the host caps and the placed footprints; A* with a heap and line-of-sight simplification,
flood-fill connectivity). On the empty city: 36 800 lattice cells (17 154 land, 1 762 shallows, 3 499 canal, 14 385
open), the head 76 m from the real waterline, the Amphitriton block 508 m under it; a foot path 860 m inland in 17 ms,
a boat path across the bay, the head connected to the far shore on foot. Nobody walks it until P5.

## Phase 2 merge (Oct 1 2026): finishing the fan-out from HANDOFF.md
Ten of the eleven agents had been stopped by the rate limit before reporting; their fragments were committed as they
stood. The merge, in HANDOFF's order: `--assert` on the whole sheet failed only on agent A's spots (the Scallop court's
hall spots were written in the house frame, not about the hall pod's centre; the Conch stair house's hearth and table
sat too close along the chamber) and reported the seven sheet hosts over the medium budget, which was an accounting
artefact (the probe summed every copy of a type): a host type is now budgeted per placement under the host class, and
a def says it is a landmark with `cls:'landmark'` (the Amphitriton's load-time `setTimeout` is gone). The shared-helper
bugs the agents had reported and worked around: `hykPad` and `o.landing` double-applied the builder frame (fixed at the
source, with `hykBridge` and the pontoon, records marked `world:true` so agent C's fixer leaves them alone);
`hykLatheAt` ignoring the lathe's modulation is recorded, not yet fixed. The look-round showed the sheet's row presets
looking through the Spans row's 28 m pylons and the landmarks hiding their neighbours: the free-standing rows start at
z = -75 and each row camera backs off with the row's width; hosts got two close pod views each. Read at row scale the
kit holds together: distinct silhouettes in every row, nothing floating, the civic pieces at landmark grade.
The Citadel (agent D's unwritten half) is written to the brief: it crowns the stack the city's terrain already makes
(r 95 m, 62 m) as a ring arena-fortress, 84 k triangles; the one defect the shots found (the gate's wall seen through
from inside: the lathe is one-sided) is fixed with an inner face across the cutting. The three mock houses left the
sheet. Kit, mock and city all pass `--assert` with a clean error panel.
