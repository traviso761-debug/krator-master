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

## Travis's walk of the kit sheet (Oct 1 2026)
Five notes. (1) The Amphitriton's roof had holes: a shell of revolution under the petals' edges and a disc under the
calyx close it. (2) The barracks' doors were blocked; a ray probe through every door found 90 of 210 blocked the same
way (the shells cut their holes, their fillets and second skins did not), so the frame now clears each building's own
geometry from its doors' passages after the build, sampling seven points a triangle because a coarse fillet's triangle
spans a doorway with its corners outside it. (3) Pods on one host stand at different heights: the sheet steps them a
plate or two apart; they stay on plates, because the hosts' projecting plate rings cross a door set between two.
(4) and (5) are P3 requirements now (PLAN P3 step 5, DESIGN §5): at least three refurbished full-height towers, one
the Pharos; land-side reclaimed Ancients that are hosts too, with pods and roof growth at ground scale.

## Phase 3 (Oct 5 2026): the placement pass and the first draw
P3 step 5 as GODOT.md item 4 asks it: a data pass and a draw pass. `targets/city/88-city-place.js` writes the city as
records and builds nothing: `PLACE.blds` (a def at a point, its yaw, ground, variant and the pass that put it there),
`PLACE.hosts` (type, cut snapped to a storey, sink, plates in world y, ways in, pods with bearing and plate),
`PLACE.slots` (plots for what this build cannot draw yet) and `PLACE.moles` (fill stamps pushed onto `CITY_STAMPS`
before the terrain is built). Every draw is KRAND: a stream per pass, seeded per block by `KRAND.cell`. Occupancy is
oriented boxes on a 50 m hash: the streets, canals and highways are reserved first, then the landmarks by name (each with
one freedom, its facing), the hosts, the precincts, the shore runs, the land quarter and the home-grown moles, in that
order; a named piece that cannot stand at its spot tries a list of candidates (`ysPlSeek`), and every refusal is counted
by reason (`_api.city.place().refused`). `targets/city/88b-city-draw.js` reads the records and calls `HYK.place`,
`ysPlaceHost` (and the tideline) and `HYK.placeOn`; `93z-city-api.js` adds `_api.city.place()`, `_api.city.records()`
and the city's invariants to `--assert`.
What stands: 323 kit buildings, 31 hosts with 85 pods, 74 slots (60 foreign plots, the chapterhouse, 4 reclaimed land
hosts, 3 awash hosts), 18 moles; every def but the eight spans placed at least once; 11.85 M triangles of the 12 M
budget, 142 draw calls; `--assert` green on all three targets.
- **Hosts are Skyscraper A only.** B is off Travis's list, C carries its body 150 m up on legs, and D–K, the Pierced
  Stack, the Bole and the mid-rise types need the Ancients chain re-vendored (Ys's copies of eleven kit fragments have
  drifted; upstream's D needs `skyRooms`, `skyShards`, `skyHoist`, which Ys's `52-sky-abc.js` predates). The type table
  (`YS_HOST_TYPES`) is where they go. A is sunk so its plate 2 stands near the L2 datum (about −50 m); its cut is
  snapped to its 8 m storeys, 168–240 in open water and 128–160 in the canals. The Pharos and two more (farthest-point
  picks among the tall hosts) are Project A (decay 4): full height, 356 m to the crown ring. Pods start at plate 2 (plates
  0 and 1 stand among the strut heads) and step over the plates (poor 2 pods, middle 3, rich 4, full 6, every host on
  2–6 plates). An `into` def is always a way in: the Urchin pod's other layout puts its store in its door swing.
- **The awash blocks and a quarter of the land neighbourhoods are slots.** A on an awash block stands its struts on
  the beach beside the rich quarter; DESIGN wants a mid-rise there, and the land hosts are the small reclaimed types.
- **The land wealth rings moved** from 520/900 m to 740/1000 m (87): the nearest land block is 600 m from the
  Amphitriton, so the land quarter had no rich block and the rich houses were never placed.
- **Streets take their kind from the old plane at their own midpoint** (87c): a street between a land block and a canal
  block lay in the water but was classed dry, reserved as a street, and blocked every harbour piece along the shore.
- **The shore run** finds the natural waterline by marching in from the water (a low beach can stay under +0.3 m for
  60 m) and decides the water side from ±40 m: `shoreAt`'s ±9 m test flips on the flat beach at the fishing docks.
- **The budget is per placement now** (91-ys-probe `typeStats`): a type the city places many times is checked once per
  copy against its class, as hosts already were. The kit and the mock are unchanged by it.
- Densities were set by the 12 M budget, not by the look: the core land blocks are built on three sides, the rest on
  one, a third of each frontage is gardens, farms beyond 620 m have a farmhouse and no field, the home-grown moles
  are 88 m squares built on two sides. The look-round: the drowned quarter reads at city scale (stumps on the grid,
  the three full towers clear above them, the Amphitriton on its island, the temples and the Citadel on their stacks),
  but every host is the same Conocylinder; the market hall stands over its highways' junction with the shops round the
  block; the civilian harbour, the fishing docks and the pens stand on the real waterline.

## The Ancients chain re-vendored (Oct 5 2026, Travis: "bring it up to date")
Eleven vendored fragments had drifted from upstream. Taken as they stand upstream: `10-core.js` (the vnoise cache, same
values bit for bit; `tick()`), `32-surfaces.js`, `34-kitdefs.js` (near-black openings, the stone-block rubble),
`36-decor.js`, `38-helpers2.js`, `50-registry.js`, `69-mat-salvage.js` (the firelight now animates through `tick()`), and
from Iziz `69b-vern-mat.js`, `69c-vern-helpers.js` and `93-labels.js` (one label per building, decluttered on screen).
New: `42-offices.js` (the civic helpers the towers' shards and rooms need, and the offices), and the opt-in
`core/materials/opt/69a-world-uv.js` (`vWorldUV` moved there; Ys's `build.py` takes `CORE_OPT_FILES` as Iziz's does).
`52-sky-abc.js` is upstream plus Ys's hooks re-applied (the podium, the cut, the way-in holes on A, B and C), and
`54-mat-concrete.js` is adapted now too: `bodyGroup` takes the cut, so D, E, F and H can be hosts. The scene runs the
kit's `TICKS` each frame with `NIGHT` mirrored from the clock. Upstream's RESTAND moved A's strut feet in from r 98 to
r 60 and made B's legs single raked columns from r 42; `ysHostMembers` and the caps follow it. `--vendor-check`: no
drift. Kit, mock and city pass `--assert`; the kit's and the mock's hosts look different (plumber struts, raked legs).

## Three host types (Oct 5 2026)
`YS_HOST_TYPES` holds A, D and H with what the records need: the storey table, the face radius by local height and
bearing (`se` superellipses for D's rounded square and H's keep), the cut ranges, how the host stands (A sunk 50 m so
its plate 2 meets L2; D and H on the bed, their plates from 14 and 20 m up, pods from the L1 datum), the bearings pods
may take (A anywhere; D's three faces off its lift-core spine; H's four face centres) and what to avoid (H's setback
ledges and their turrets). Square hosts are squared to the old grid. The type is a KRAND pick per block by class (tall
and mid: A, D, H; awash: D or H, cut at 62–98 m); the Pharos stays A, the two other full towers came out D. The
tideline follows a shaped host's face (`host.shaped`; a round host keeps its lathe, so the kit and the mock do not move).
The Ancients builders draw a host as a dozen plain meshes and thirty hosts were two hundred draw calls at the overview:
`ysMergeHostMeshes` merges every host's static opaque meshes city-wide by material (139 meshes to 5), 236 calls to 102.
E (a glass lens behind a diagrid at decay 1, nothing to root a pod in) is left out; the Pierced Stack and the Bole wait
on the alternates' helpers.

## The land quarter's reclaimed Ancients (Oct 5 2026)
The four land-quarter plots are hosts now: Wardens and Monoliths at decay 3 (reclaimed), cut at 44–74 m (`ysCutY` takes
decay 3 as well as 1), standing on the ground with their podium colonnades, two or three pods on their lowest plates
above the colonnade (17 m), the decay-3 hoist hung from the cut top (D and H are adapted for it). They are the "low
blocks" of DESIGN §5 rather than the apartments and offices: the kit's single-building mid-rises fit the plots badly
(the hospital and the government are 240–300 m across) and the apartments and offices draw three variants side by side
in one call. The port's salvage dressing (`portRepair`) is not applied: it samples a group in its own frame and does not
handle a rotated host.
A bug of this round, fixed: the comment that marked `bodyGroup`'s hook was a `//` in the middle of a one-line function
and swallowed its `endGroupXF()`, so every D and H body left a frame on the transform stack and every host built after
the first one was misplaced (the inspector volumes and the instanced floors of thirty hosts stood in the hinterland).
The kit and the mock never build through `bodyGroup`; the city's two earlier commits of the day carried it.
`_XFSTACK.length` is 0 after the build.

## The city at two-thirds, the budget at 30 M (Oct 5 2026, Travis)
Travis: raise the triangle budget to 30 M for now, and make the city a third smaller. The span is two-thirds in every
direction from the head of the bay (`LAYOUT.K = 2/3`: inland 547 m, offshore 533 m, 1100 m either way along the
coast), the blocks stay 200 m (the hosts need them), so the city has 60 blocks where it had 124 (30 drowned). Every
distance of the layout is the first layout's times K: the sink plane is squeezed into the span (the same depths at
two-thirds the distance, so the awash, canal and open rings keep their proportions), the Amphitriton's target is 300 m
offshore, the wealth rings, the farm line and the highways scale, and the Citadel's and the Winds' karst stacks move to
wherever their blocks land (their shore loops with them). The drowned landmarks take the nearest free drowned block when
their rule-placed block is land or taken (`setWet`: nearer the shore, the military harbour had taken the civilian
harbour's block and the Wet Cells had landed on land). A scenery stack standing in a host block's cap leaves the block
to the water. The densities cut to fit 12 M are back (gardens, four-sided core blocks, two fields a farm, 124 m moles
built on two sides) and pods are richer (4, 5, 6 per host, 8 on a full tower). With eleven hosts a pass after them
gives every grown def a pod (it takes the place of a duplicate). The land hosts are a share (a third of the outer
neighbourhoods, at least three) tried in a cell-hash order, each anywhere in its block a clear spot fits it.
Result: 60 blocks, 11 drowned hosts with 52 pods, 4 land hosts, 243 kit buildings, 8.5 M triangles of 30 M, 77 draw
calls; `--assert` green.

## The karst on land (Oct 5 2026, Travis: "something a bit like Krabi"; "no streets on top of a stack")
`87d-city-karst.js` grows a karst field into `CITY.STACKS` at load, from KRAND: 26 clusters of towers and ridges 600–1500 m
inland (taller and denser with distance), a headland ridge at each end of the bay with islets off its tip, and a range of
tall towers along the north-west horizon; 53 stacks, every one kept off the city's land blocks, the river's valley and the
highways. Stacks may be ridges (`e`, `a`: stretched along a bearing, the crest broken into summits) and have domed
crowns, except the two that carry buildings (`flat`); a 200 m bucket keeps `terrainH` as fast as before. The terrain's
10 m cells now cover the field (`PORT_LAYOUT_DEF.fine` ±1550–1600). The painter takes a Ys hook (`ysGroundTint`, 71
adapted): jungle in patches on crowns and shoulders, pale limestone walls with rust-tan and grey streaks. After the field,
the roads go round it: a highway point inside a stack is pushed out along the stack's radial line, a street is cut where
it meets karst and keeps its clear runs, and only then is the road paint laid (`ysRoadStamps`, moved from 87c) and the
placer's street reservations made. Two streets were cut; no highway had to move.

## Five host-ready Ancient types (Oct 5 2026, from Travis's references)
A subagent built them upstream (`kits/ancients/src/8ap-host-*`, a `hosts` target sheet): L the Facet (a folded bronze
spire, verdigris in ruin) and M the Bastion (a battered rust-and-concrete base, stepped tiers, a shaft with a garden slot
up each face), and three mid-rises, the Arcades (stepped arched terraces), the Capsule Stalks (Metabolist cores studded
with sockets) and the Bell Hall (travertine drums, a concave wall, a slab campanile with its bell cage). Every one takes
the cut, the podium and the way-in holes behind `typeof` guards and carries a `HOSTSPEC_*` in `YS_HOST_TYPES`'s shape, so
Ys vendors them byte for byte, as `69h-host-*` (they must sort after `68-mat-v5` and before the placer:
`build.py`'s `VENDOR_RENAME` keeps the drift check pointed at the upstream names). One upstream bug fixed at the merge: a
`//` in the Arcades swallowed its collapse scar. In the city the Facet and the Bastion join A, D and H in the tall and
mid pools and as full towers; the mid-rises take the awash blocks and the land plots (on land they stand whole at decay 3,
pods from just over their terrace). A host whose wealth's way-in pod fits no plate takes the smallest one; a type whose
faces leave one usable plate (the Stalks' smooth band) keeps only its way in. The Stalks' sockets (`sockets(d)`) are
not grown into yet: `HYK.placeOn` frames a pod on the host's own axis, and the sockets are on three cores.

## Pods in the sockets, the courtyard rings, the lived floors (Oct 5 2026, Travis)
**The Capsule Stalks' sockets** take pods now: the placer plugs them onto all three cores on the row just above a plate,
off faces that look at another core, the bridges and the disc, clear of each other; the draw pass frames each on its own
core through a proxy host (`Object.create(host)` with the core's centre and radius); the builder leaves out the tubes a
pod covers (`ysSocketTaken`, typeof-guarded upstream and in Ys alike).
**The land quarter is denser**: every street of a neighbourhood block is built (three on the outermost), gaps and
gardens are tighter, and a courtyard ring of small houses and corner shops faces inward round each block's middle
(`PL_SMALL`, `inward`): 411 neighbourhood buildings where there were 170.
**The lived floors** (`88a-city-floors.js`): in every host with pods, the pods' plates and two floors above the top one
and two below the bottom one (never under the tide, never above the cut) are subdivided: a lift core, a corridor ring,
rings of sector rooms (two rings with the corridor between on a deep floor, one on a shallow one; the Stalks per core),
each a ROOMS record with a door to the corridor and its spots (living: bed, food, store, and a hearth and a table at
middle and rich; work: two benches; shop: a store and a counter), a hall where a way-in pod's back door opens. KRAND
draws the uses (about 60/25/15 living/work/shop, more shops on a floor with a shop pod). The partitions are thin shell
walls in the interior bucket; the host's floors table marks those plates `inhabited` with their rooms. 178 floors,
3240 rooms, 9900 spots; `spots-fit-their-rooms` and `residence-minimum-spots` pass over all of them.

## The bridge graph (Oct 5 2026, Travis)
`88-city-spans.js` runs after the placer and before the lived floors (so the pods it adds are lived round). **Host to
host**: every pair of 4-neighbouring drowned blocks that both carry a host is joined. Each host grows a way-in pod facing
the other, on plates within 8 m of each other, chosen by the cost |Δy|·3 + |mean − 28| (near the L2 datum); a plate
whose pod would clash with the cut, the type's `avoid` ledges or a pod already there is passed over, and a pair with
no plate face to face is left to the boats (`SPANS.refused`, none now). The draw pass runs the span landing to landing
with the rib bridge helper (`hykSpanBridgeL2` above +20, `L1` below). **The Amphitriton**: a walkway at the quay datum
from the shore to the Temple of the Tides' mole, 34 m to the side of the temple, and the drawbridge from the mole's
seaward edge up to the Amphitriton's port (+12), its one foot link to land. 6 bridges, the drawbridge and the causeway;
`bridges-built` checks every record drew. Views: *A bridge between two hosts*, *The drawbridge to the Amphitriton*,
*The L2 walk grid*.

## The connected bridge network, piers, lanes, quay walls, land stumps (Oct 5 2026, Travis)
**The network** (`88-city-spans.js`): the nodes are the drowned hosts, the walled moles, the Citadel, the Winds and the
Amphitriton; the lattice pairs are bridged pod to pod as before, then a spanning tree (Kruskal over the node pairs within
300 m, 450 m for a landmark, and each node's shore point) joins the rest until every node has a foot path to the shore;
the two or three hosts nearest the shore bridge straight to it. Host to mole, shore or landmark: a way-in pod grown on
the plate nearest the far end's height, the bridge from its landing to the mole's edge, to a lily pad on a stalk at the
shore, to the Citadel's bridge-head pad or to the Winds' stack top. Mole to mole or shore: a walkway on stalks at the quay
datum, or a pontoon with a flight up each end when a poor mole is on it. **Piers**: fluted stalks from the bed to the
underside of every bridge over 55 m, one per 40 m, none over a mole or the land. 24 spans, 40 piers, 22 nodes all on the
shore's component.
**The roads are ribbons** (`LAYOUT.roads`, drawn in 88b): the vertex paint on the 10 m heightfield read as a zig-zag; now
every street, lane and highway run is a plate of paving 22–30 cm over `terrainH`, sampled every 4 m, and the stamp under
it keeps the scrub off without painting. **The lanes**: a neighbourhood block with no reclaimed Ancient is quartered by
two 7 m lanes through its centre (`ysLanes`, made by the placer once its land hosts stand, reserved like streets); the
small houses and corner shops line both sides of each (the courtyard ring is gone). **The land hosts**: half the
neighbourhood blocks (the layout marks them, `b.landHost`, in a hash order; the first two are skyscraper stumps cut at
80–124 m), placed before the civic pieces so they find room: six, two of them stumps of 99 and 92 m with pods.
**The moles** have plates and quay walls (KNOWN_ISSUES has the mechanics); the **landmark stacks** are ellipses fitted
to the Citadel (with the Treasury) and the Winds, near flat on top.

## The new Archon's Citadel, the Arena, the stairs (Oct 5 2026, Travis)
Travis's two references for the Citadel: a Gaudí-like civic hall (a honeycomb of oval windows in cartilage surrounds with
mosaic infill, verdigris twisted spires and a green dome) and a monumental memorial (a terracotta mass sweeping down
in concave curves from a tall centre, relief-carved, a vast pointed arch with a gilded group, a crescent colonnade round a
reflecting pool). An agent built `hyk_citadel` anew in the shell kit (74b, 108 k triangles): one parametric loft for the
swept mass (a 45 m plateau sweeping to 12 m wings and the ground at x = ±38), its front a mosaic field in teal and gold
pierced by about sixty oval windows in knuckled bone surrounds, a blind arcade at the foot, the pointed arch 10 × 16 m
tunnelling into the audience hall (a ribbed vault, a nacre dais, three gilded figures) over a broad stair, a drum and
ribbed dome and four twisted spires in sea-green shell with gold tips, bone tendrils rooting the wings, the forecourt
with its oval pool, fountains and a twenty-column crescent colonnade, a domed pavilion, the lobed rampart with the
gate, and the west bastion with the Warden's lodge pod, the bridge door and the bridge-head pad the span graph lands on
(`own:'Citadel bridge head'`). The old terraced model is `hyk_arena` (74b2, seeds 30690–30697) on the nearest land block
with room for it (its middle levelled by a flat stamp), its gate to the head, the block lined with the market's shops. **Stairs**: a spiral stair down the
face of a Monolith, Warden or Facet from its lowest plate to a wet landing, four at most; such a host, and any host
whose bridge leaves a plate under sink + 30, stands without its restand plinth (`YS_CUT.noPlinth`, 52 `skyPlinth`).

## The Citadel's gate landing and cliff stair, the Amphitriton's coastal spans, organic moles (Oct 5 2026, Travis)
**The Citadel's span** lands on the stack top 9 m outside its gate (local +z), not on the west bastion's pad: it was
a flyover across the forecourt. A host behind the Citadel is refused as its partner (the span must come from the front);
the stack is 64 × 83 m now so the landing has ground. **The cliff stair**: from a pad beside that landing a spiral stair
hugs the karst wall (its plan radius at each height from ysKarstH's profile, 3 m off for the heightfield's facets) down to
a wet landing on a stalk, a stub deck between, then a walkway at the quay datum to the nearest walled mole within 320 m
(else the shore): the Citadel's second link, north to the home-grown mole. **The Amphitriton's coastal spans**: each of
its two L2 landing doors (74a, petals 1 and 4, 28 m up) takes an L2 bridge to the nearest host it looks toward (the
Pharos and the grown plaza), landing a metre outside the door mark. **The bridge to nowhere** was `edgeOf` given an
un-normalised direction (a mole's walkway ran on past its edge); it normalises now. **The home-grown moles are organic**
(`ysPlOrganic`: sixteen radii from KRAND smoothed round the ring, stretched along a random bearing, the centre pushed
10 m off the block's middle; star-shaped, so the fill is a pull toward the centre and the plate a fan), each with an
upper terrace 2.2 m up to one side (twelve points, its own ring of small houses) and a knoll on that half the time, a
flight between terraces on the side facing the mole's middle; the Hykkousoi line every edge facing the water
(`ysPlEdgeRun`). A home-grown block on a scenery stack is left to the water, and the karst field keeps off every block
of the grid, drowned ones too (a mole clipped a stack).
**Travis's moves**: the Pharos stands at the bay's south end on (1,5), the Project H tower that stood there takes the
Pharos's old block, the Facet stump off the harbour (1,4) moves south of the Project H to (1,6) (one block past the
span, admitted by name) and (1,4) is left to the water (the harbour approach). The road ribbons keep 40 cm off the sea
plane (the awash streets z-fought it). Each reclaimed Ancient on land gets a ring of small houses and shops about its
cap, fronts outward (`ysPlEdgeRun` with `land`).

## The material library on Ys (Oct 5 2026, Travis)
Travis generated every set in MATERIAL-PROMPTS.md (fifteen tiles; the kelp, vine and two jungle-clump sheets on magenta,
split by `tools/textures/sheet.py` into 36 cards) and they are in `core/materials/library/` (`shell.ribbed`, `.b`,
`organic.barnacle`, `organic.bone`, `shell.tideline`, `shell.nacre.ys`, `paving.shell.terrazzo`, `cloth.seaweed`,
`rock.limestone.karst`, `ground.jungle.canopy`, `stone.travertine`, `stone.sandstone.ashlar`, `metal.bronze.verdigris`,
`card.kelp.0-8`, `card.vine.hanging.0-8`, `card.jungle.clump.0-17`; batches `tools/textures/batches/ys-*.json`).
**Ys adopts them the Girder way**: `materials.json` names, per material family, the set and how it is used (scale in
world metres per tile, how much of its colour survives the vertex colour, the roughness lift, the break-up);
`tools/textures/pack.py settlements/ys` packs them into `tex/` (512 px WebP, 3.3 MB); `build.py` inlines `tex/` as the
generated fragment `26-matlib-pack.js` (`KMAT.pack('ys')`) after the record fragments it now takes from
`core/materials/record/` (`23-mat-record.js`, `25-matlib-host.js`; not `24-tex-def.js`, whose `TEX` would clash with the
lineage's texture table). **The adapter** (`79z-ys-matlib.js`) binds the packed maps onto the materials the earlier
fragments made, in place, before the first frame: the hyk pairs (`hkShell` the ribbed shell on every pod, house and
temple; `hkFloor`/`hkIn` the finer variant; `hkBarn`, `hkBone`, `hkMosaic` the shell terrazzo, `hkNacre` the nacre under
its play-of-colour hook, `hkCrust` the mussel tideline, and the new `hkVerd` pair, the verdigris bronze the Citadel's
spires and dome now wear), the terrain (`ground`: the karst limestone as grey detail under the vertex colours, 14 m
tiles), the Arcades' sandstone (`HAC_MAT`), the Bell Hall's travertine (`HBH_MAT`) and the core's `MAT.verdigris`. Each
set repeats over the fragment's own UV tile (hykSurf lays 4 m; the terrain 18 m; the towers 1:1). Every bound material
takes the library hooks (specular, the tiling break-up) after the hook it had, or the underwater tint (71's patch skips
a material that already has a hook, so the adapter calls `portUWsh` itself). **The cards**: the first kelp replaces the
weed ribbons' canvas texture (alpha-tested now); the vines and clumps dress the karst (88b: crossed clump quads on every
field stack's crown, vines hung over the rim facing outward, one mesh per card, positions from KRAND). `?mat=proc`
shows the procedural look; `window._materials` is the records table; the verifier waits for the packed textures to
decode (`window._texPending`).

## Travis's third batch (Oct 5 2026): the Citadel on the Sentinel, the harbour's piers, organic podiums, the band, no plinths
**The swap back**: the Project A tower stands on (2,1) again and the Pharos is built on a Project H at (1,5) (its crown
on the Warden's top). **The Citadel** stands on the Sentinel, the big stack south of the harbour (620, 930): its grid block
is water now (the harbour approach), `STACKS[0]` moves to the Sentinel's place (the scenery Sentinel is gone), the stack
an ellipse 70 × 88 m whose axis is the building's x, the gate facing the Pharos, the Treasury on the far side. Its one
link is the Pharos (the span graph refuses every other partner); the cliff stair still runs down to a wet landing but
sends no walkway on. **The podiums**: the Tides' and the Library's moles are organic (`ysPlOrganic`, sized so the
building's box lies inside the outline's narrowest radius; the drawbridge's foot is found on the Tides mole's real edge),
and so are the harbour moles (the headland a lobed round, the military harbour's two a stretched oval each) with **a large
round warehouse** (`hyk_warehouse_round`, 76b: a lobed drum 32 m across, three cart doors, a store room) at each one's
centre. **The piers**: along the water edges of the harbour moles every 34 m, a pier facing out wherever a 60 m square off
its head is clear of anything built (so a ship can work round the moles), then the harbour shore filled with piers in
the gaps; `harbour-piers` wants two dozen. **The z-fight on the moles**: the plate stood 18 cm over the fill, which the
depth buffer cannot hold apart at a kilometre; the fill is 70 cm under the datum now and the plate 5 cm. **The river**
runs from past the map's north-west edge to 100 m out in the bay. **The band** (`YS_BAND`): half-sunk mid-rise hosts
every 125 m along the middle of Travis's strip 50–200 m off the coast north-east of the head, sunk to the bed and cut
low, synthetic blocks (60+k, 0) so KRAND seeds them by cell; the span graph's tree links them. **No plinths**: every host
is drawn without its restand (`noPlinth` always; the Facet's apron ran over a street). **Rust**: the ruined concrete is
rust-stained (`MAT.concreteR`); a streaked-rust concrete set is the real fix (asked for). **The river has water**: each
pool of the terraced bed gets a sheet of the sea's material at its lip's height (11 pools); the mouth runs into the bay.
**The Pharos crown** stands on the highest plate that takes it. A pair of hosts with no plates within 8 m takes a
climbing span (18 m) rather than none, so the band's three link up.

## Eight more Ancients as hosts (Oct 5 2026, Travis: density)
An agent brought Sky B (the Scallop Stack), C (the Tripod), E (the Lens), K (the Sail), the Attraction and the Pierced
Stack in as stumps, and the office terrace (the Terrace Wedge), the Ancient Library (the Reading Star, worn) and the
Undulant house whole; the specs are `69i-host-ancients.js` (data only), the hooks in the vendored builders
(`build.py --vendor-check`: adapted on purpose). B's lobe bands are cut round every pod (`YS_CUT.pods`, which the draw
pass now hands over); E's pods root in the ruined lens's lining behind the diagrid; K keeps its porch and loses its
hoop, hall and campanile; the Attraction's podium shrinks to 54 so it fits a land block; the Stack loses its oculus over
a low cut; the Library is the builder at decay 0 re-skinned worn (its rust and weather passes read the structure in its
own frame, so they are left out). Sky J stays out: its plates stand 4.6 m apart far past the glazing, nothing to root a
pod in. The placer's land rule takes a type's own `lo` (the villa's floors start at 3 m); the two office terraces and the
Ancient Library take the first non-stump turns of the land pass (whole, on land blocks: a quarter is too small for
their caps), the Undulant villas stand in the laned blocks' quarters (the quarter's host before its lane houses, inset
clear of the frontage), and K and C stay out of the land pools (caps 88 and 68 fit no land block). The band's pool is the
sturdy stumps (the Arcades, the Pierced Stack, the Lens, D, H), cut low: the Stalks and the Bell Hall left no way in. The lived floors' corridor ring is bounded by the plan's inscribed radius
(K's flat back).

## Travis's fourth batch (Oct 5 2026): the inner quarter, the plates, the river, point hosts, the Wet Cells
**The inner quarter** (the foreign and industry blocks between the head and the river) had two sides built and nothing
in its middle: 60 reserved foreign plots drew nothing. Now every side of those blocks is lined, each block without a
host is quartered by lanes with the small houses on them (the lanes are reserved before the frontage, so no house
straddles a lane's end), and every foreign slot keeps its swap list but draws a Hykkousoi house of the middle pool inside
it until the foreign sets land (`standIn`): 311 buildings inside Travis's polygon against 219 in the coast quarter he
named (`inner-quarter-density`). **The mole plates** read as under water: the organic outlines wind either way, and a
plate whose faces point down is culled from above. `ysFaceUp` reverses the indices when the first faces' normal points
down. **The river** is one continuous strip now (`_river.pools` 1, 2.5 km): one pair of bank points per sample with the
tangent averaged over its neighbours, 62 % of the valley's width, at the bed plus 55 % of the rise, doubled at each
pool's lip, and never below 35 cm over the terrain mesh under it (the heightfield does not carve the valley everywhere);
before, each pool was its own flat sheet, and in fact none was drawn: the loop broke at the first sample under the sea. **Point hosts**
(`ysPlHostAt`): the Tripod (C) at (165, 117) and the Lens (E) by the river at (84, 459) as tall land stumps, and the
office terrace, which dwarfed the houses round it on land, stands in the ocean instead, whole and podded, at (875, 245)
and (1180, −869), each a node of the bridge graph (bridged to the Project A tower and to the north shore's hosts). The
land pass keeps the Ancient Library and, when `YS_HOST_OFFICES` is loaded, the original kit's offices and apartments.
**The Wet Cells** stand at the foot of the Needle (1294, 228), their rock a lathe from the real bed (28 m down there:
the record carries `sink`, the draw pass hands it over) with a 15 m top, the warders' cone 11.5 m and leaning, twelve
cells, eight drowned mouths, darker, and a ring of bone stakes leaning out over the water (none across the landing).
Their old block is a host's. The sheet still draws them on a 2.6 m shelf.
**The original offices and apartments** (an agent, `69j-host-offices.js`, `YS_HOST_OFFICES`): the kit's own Apartments
(the terrace stack: eight lobed trays on a stem, cap 36), Office B (the lobed tower on its colonnade, cap 20) and Office C
(the Comb, a brise-soleil bar on an arc, cap 40) stand whole among the Hykkousoi houses on land, pods from their first
floor; each is one building of a kit call that draws several side by side, so `82-apartments`, `42-offices` and
`66-office-c` take a Ys branch (`YS_CUT` present: alone, on the origin, slabs, the skin holed for the ways in; `ADAPTED`).
The land pass takes one of each first, then the Library; the land pool carries them too. Unusable: the Flatiron, the
Apartments' honeycomb wall and column variants, Office A's mushroom ring (nothing to root a pod in at pod height).
**The ruins** (`64b-ys-ruins.js`, `ysPlaceRuin`, `YS_RUIN_TYPES`; the civic and industrial builders vendored unchanged:
police, library, lab, bunker, hospital, hotel, government, data centre): the placer (`PLACE.ruins`, smallest first on a
25 m grid of Travis's east polygon `YS_RUINS_POLY`, clear of everything but the water lines, off the stacks, every corner
in the water, the middle 6 m deep or more, standing at the bed's lowest point under the footprint) and the draw pass
(`ysPlaceRuin`: the kit builder at its ruined state, holes scaled 1.3 for the city's decay 4, flat ground, no planting,
the registry re-tagged `ruin`). The bed east of the Amphitriton is 20–28 m down, so a 60–90 m ruin stands with its lower
half under the water. Not podded, no ways, no floors.

## The building editor (Oct 5 2026, Travis: "pick from a settlement's kits, place a building flush to the ground, rotate it, or delete")
A dev tool on the city page (API.md "The editor"): **Edit** opens a panel with every free-standing `HYK.def` by family and
row; a click on the ground stands the chosen one there flush to the ground, facing the camera, drawn at once
(`hykPlaceLive`: `HYK.place` after the bake, its buckets and kit items merged into their own meshes and the buckets
truncated back, so nothing leaks into later bakes); the slider or Q/E turn the last one in 15° steps, Shift+click moves it.
A click on a building selects it and Delete hides it: the baked meshes know their owner now (`HYK_OWNER` stamped on every
put geometry and kit instance while a building is built; `hykFlush` keeps per-owner vertex and index ranges on each merged
mesh), so its instances are scaled to zero and its shell vertices collapsed to its origin. The edits are data: Copy JSON
gives the `YS_EDITS` literal for `targets/city/86-city-edits.js` ([G data]), and `ysApplyEdits()` at the end of the placer
pass deletes and places the same on the next build, where the draw pass builds them like any record (the door cut, the
rooms, the labels). Live, the door cut runs on the building's own geometry before it is merged, so doors are cut live too;
what the live view cannot do is in KNOWN_ISSUES. Hosts and pods are selectable (named) but not deletable: they are
`PLACE.hosts` records. Verified: all three targets build, the port lint passes (86 touches no browser), `--assert` is green
with the scene identical to the build before (instances, volumes, triangles), and the headless API places, turns, deletes
and undoes with the registries back at their bake-time lengths.

## Travis's fifth batch (Oct 5 2026): the strip, the Trays, the Lens on its foot, the beam over the spire, the Comb mended, the river's meander, the editor
**The strip** between the inner quarter and the shore, (304, 36) to (163, 603) and 70 m wide, was open ground: it takes
small reclaimed Ancients every 52 m along its middle (the Undulant villas and the Office B towers, the only podded types
under 45 m across), each with a few houses round it (`ysPlHostAt` with `noHome`, so the block the point falls in keeps its
lanes; check `strip-hosts`). **Sky F**, the Trays (an agent: `58-sky-f.js` adapted, `HOSTSPEC_SKYF`: a tray every 12 m
with the glass band's lining where a pod roots, the cut snapped to a tray top, the core carried to the ground, every tray
standing) takes the Tripod's turns in the tall pool and stands at the head of the inner quarter in its place. **The Lens**
floated: without its plinth the lens starts at its Y0 (10 m); a type's `foot` is the builder y of its lowest geometry
without the plinth, and the land rule sinks it by that. Its point lies in the river's valley, so it seeks 84 m round it
with its cap at 72 %. **The Pharos's beam** swept through the Warden's spire: the crown now takes the top plate whatever
the cut, and when the beam would still be under the spire's finial (`spire` on the type, `rec.spireY`) it is hoisted 6 m
over it, straight up from the crown on a nacre mast with three collars. **The Comb** was dissected: `buildAltOfficeC`
added its sub-group's offset after the host's rotation, so the instanced fins stood 60 m from the merged bar; in a host
the offset goes through the nested group transform. **The river** is a Catmull-Rom spline through its points with a
meander across it (22 m, two sines of the arc length, fading in over the first 300 m so the mouth stays put), sampled every
20 m; every reader walks `seg`. The valley is 2.6 widths wide, and the strip starts 3 m under the sea's sheet so it emerges
from under it. **The editor** (an agent): see API.md "The editor" and the round below it.
**The wet rock** (Travis's `rock.wet.dark`, `tools/textures/batches/ys-2026-10b.json`): a new shell pair `hkWet` bound to
it (keep .85: the set carries the darkness, the builder's tints are light), used by the Wet Cells alone; every other
barnacle surface keeps `hkBarn`.

## The biome bound (phase 3, Oct 5 2026)
`biomes/nwbay` on the city page (PLAN P3 item 6, DESIGN §8). The shared biome core (`core/biome` 10, 20, 30, 40) and the
kit's six fragments (50 species, 55 trees, 60 floor, 65 dress, 70 build, 75 fauna) are vendored byte for byte as
`src/86-bio-*.js` (`BIO_VENDORED` in build.py, in `VENDOR.json`, `--vendor-check` clean: 48 identical); `TARGET_ONLY`
keeps them to the city target, so the kit sheet and the mock build as before (98 and 100 fragments; the city 123). Two
host fragments: `targets/city/86-bio-45-city-init.js` binds THREE before fragment 50 loads (the species build their
textures against `BIO.host.THREE` at load: the fragment number is load-bearing, as the Ancients bind and dalab's
`86-bio-45-init` found), sets the ceiling (110 m) and the bay hue (.47) and routes the foliage's wind tick into
`window.YS_TICKS`; `targets/city/89-city-biome.js` binds the city's facts in a `YS_AFTER` hook (after every placer, the
shell flush and the land–sea lattice, before `kbake`, which never sees the biome's meshes) and builds. The contract
given (API.md "The biome"): `terrainH` the city's own (`ysKarstH` already returns a stack's top inside its footprint),
a mask that is 0 wherever the city is (water, the rim band 12 m inside a wall's top, the face and 8 m of scree, a
landmark's whole top, the river's water strip, every occupancy box, the moles' plates; .15 in the land blocks and the
awash land, .35 in the farm blocks), the five fields (`wet` from the shore and the river, .62 in the blocks so they carry
the flame-crown's lowland rather than 100 m prism gums, .3 in the drowned grid so no mangrove stands between the
stumps; `salt` 1 at the tideline falling to 0 by 250 m; `upland` from `ysNatBase`; `flow` from `ysRiverDist`; `karst`
1 from 13 m inside a stack's top edge to 0 at 6 m beyond its foot, measured against `ysStackRR`, the wandering wall,
not the nominal radius), 117 obstacles (every host's cap over its height, the landmarks' and ruins' REG volumes, the
buildings over 14 m), a LOD spine along the shore a kilometre either way from the head plus the river's lower reach,
`center` CITY.HEAD, `eye` the camera. The slow readers are cached on an 8 m lattice.

**The karst.** Ys's stacks are the heightfield, not meshes, so the faces for `NWBAY.dress(...,{karst:true})` are read
off the drawn terrain chunks: a triangle within 4 m of a wall with |ny| < .6 is a face, an up-facing one 6..26 m inside a
field stack's top edge is the rim ledge (so the curtains hang from the rim); one BufferGeometry per stack, 49 stacks
within 1.7 km of the spine, counts by perimeter and height thinned with the LOD. The kit's tree pass roots nothing but
its cliff figs on the rock (55-trees: a species past the mask could reach a sea stack's foot), so the fan-crowns,
crown ferns and splay shrubs its zones table promises for the tops are placed by the city itself on the kit's builders
(`NWBAY.BUILDERS[sp]`, the API's own route), where karst > .97 and the mask allows: 1215 trees on the tops.

**Numbers** (`verify.py dist/ys.html --assert --views "The karst forest,The river bank,Opening — ..."`): error panel
clean, every invariant green, 26.13 M of 30 M scene triangles (the city was 23.1 M: the biome is 3.02 M at Q .55:
trees 1.26 M, the hanging gardens 1.01 M, the karst forest .39 M, the floor .33 M, reeds and fauna .02 M), 179 draw
calls at the opening (148–178 over the three views; the biome adds 48), 1898 registered volumes (785 of them the
biome's heroes and reed beds, `cls:'flora'`, out of the labels). 3408 trees: 1664 heroes, 529 impostors; by species
prism gum 55, baobab 71, fan-crown 238, ironbark 57, crown fern 656, splay 676, dragon tree 75, umbrella thorn 83, cliff
fig 55 (40 at a rim with their root curtains down the face), flame-crown 62, mangrove 109, pandan 33, lotus trumpet 7,
pipe reed 16; 30,686 floor plants, 2229 reed stems, 120,947 hanging-garden items; 13.5 s of the build. Checks (93z):
`biome-bound` (3408 > 200; none in the water, on a street, in a footprint or on a mole), `nothing-on-a-cliff-face` (0),
`figs-on-the-karst` (55 of 55), `height-ceiling` (109.6 m against 110). Presets `The karst forest` and `The river bank`.
Looked at: the karst forest (fan-crowns, ferns and figs on a tower's domed top, ferns and epiphytes down the pale face,
root strands to the ground, baobabs and the river beyond), the river bank, the opening shot (the city still reads).

## Phase 3 closed out, phase 4 (Oct 5 2026)
**The ground** is the bay's now (`ysGroundLush`, 84): above the beach and off a stamp's paint, the jungle floor, dark green
with damp patches and leaf litter in the hollows, paler and drier toward the Inner Wall, rock where it is steep; the farms'
soil paint is carried half-way to it, so the fields read as tilled ground in a green land, not red squares. **The karst
cards** (Travis's clump and vine cards) are no longer drawn: the biome dresses the faces and plants the tops; the
`vine*`/`clump*` families left `materials.json` (the sets stay in the library), the kelp cards stay on the weed ribbons.
**The gallery** has an entry for the city (`gallery/build_gallery.py` ENTRIES, 'ys', marked new); it is republished when
the branch reaches `main` (CLAUDE.md, gallery/README.md). Still open from PLAN.md P4: back-porting the compass to the
standard `92-camera.js` pack (a cross-build change, not done here).

## The foreign quarter (phase 3, Oct 5 2026)
An agent vendored the Iziz Vernacular (dwellings, trade), the Republican dwellings of the Highlands kit (renamed at build
time where its names clashed with Ys's: KNOWN_ISSUES "Deliberate drift"), the Voth embassy and the Historians'
chapterhouse, and wrote three Voth townhouses in the embassy's idiom (`77-voth-townhouses.js`). `88c-city-foreign.js`
fills every foreign plot from its swap list with a builder that fits it (whole, turned, or at .92/.86 when nothing fits
whole), splices the Hykkousoi stand-in out, lays a stone pad, registers the volumes under their culture and turns the
kits' door records into marks; the embassy and the chapterhouse, bigger than any plot, take a box behind a lane of their
culture's blocks. 133 of 133 plots filled (45 Iziz, 48 Republic, 41 Voth, the chapterhouse); the pass's kit instances
are merged into one mesh per material before the bake (draw calls 215 of 220). The plots were sized before the kits came
and do not fit them well: see KNOWN_ISSUES. API.md "The foreign quarter".
