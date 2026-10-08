# Dhelv, the capital of the Zeijani

The Zeijani's underground city inside an old spur on the Throne's flank: a shelf standing 40 to 83 m out of the slope on sheer
walls with a weathered lip, old growth on top, its back merging into the slope where the volcano rises sharply behind it, the
young flows parting round it. The outpost stands at its
west foot in the apron (the lee no flow reached); a short outer tube (about 120 m) runs from its portal in the west face to a rolling
stone door, a braid of tubes climbing to the hub (a bottle-shaped great hall under a light well), three satellite wells, the cistern
hall and the funeral catacombs. Its buildings are the Zeijani kit's (`kits/zeijani`); the plan is `kits/zeijani/PLAN.md` (section 12
is this layout; section 14 the phases).

**State (2026-10-08): P6 and the owner's third review.** The layout carved and placed, both kits' flora, the cave's light,
what is drawn, the nav graph and the ramblers (P6); the owner's second review (the shelf, the flows by the model, the
standardized grove, the stone door, the council's windows, the sky dome) and third (the spur's back merging into a steep
slope, the weathered lip, the land to the horizon, the outpost's face solid with its mouths always open, the stream's fall and
sink, the wells' floors as grassy hills, denser fungi, more dithering on the rock and the ground, the temple's round sky and
its stair, and PLAN.md section 13's extras). The Godot case (P7) waits for a Godot binary.

| Path | What |
|---|---|
| `src/41-dhelv-layout.js` | the layout as data `[G data]` (no THREE, no DOM): `DH` (below) |
| `tests/test-layout.js` | the layout's checks, each with a negative control; a golden digest of every node and site |
| `tests/plan-svg.js` | draws the layout as a plan: `layout-plan.svg` |
| `layout-plan.svg` | the plan, for tuning by eye (hover a line or a footprint for its id, height and grade) |
| `src/00-head.html` | the page shell (the kit's, titled) |
| `src/45-dhelv-bio.js` | the biome host: BIO bound before the kits load; the hyperjungle's mask (the shelf's top 14 m back from its edge, off the openings), the Throne's (the flank, off the walls), the outpost's buildings as obstacles; `dhbForest` plants both with the world, then the underground's plants |
| `src/48-dhelv-flows.js` | the young lava as it ran `[G data]`: the Throne kit's flow model (`THRONE.flowHistory`) from seven vents up the flank over the layout's land; `DH.groundY` becomes the land plus the lava laid |
| `src/86-dhelv-extras.js` | PLAN.md section 13's extras the defs do not draw: the air shafts and their sentinels, the buried light well, the decoy entrance, the mirrors' light |
| `src/88-dhelv-fungi.js` | the tunnels' fungi: the Throne kit's cave pass along every carved way, in a band at each wall's foot |
| `src/89-dhelv-hills.js` | the wells' floors: the grassy hills drawn (turf, paths over them, their walk floors) and planted by the Throne kit in a pass of its own |
| `src/49-dhelv-grove.js` | the shelf's old growth, standardized: three hypertrees and three saplings grown once alone and drawn as instances in cells, each with a far level |
| `src/90-dhelv-scene.js` | the host: the sky, the ground's heightfield in tiles (`terrainH = DH.groundY`) and the far land, the spur's walls (`dhWalls`) and the west face (`dhWestFace`), the ways carved (`dhCarve`), the sites placed, the stream, the rock meshed near the camera (`dhStream`), the views |
| `src/91-dhelv-probe.js` | `window._api` and the checks (below) |
| `src/72-dhelv-nav.js` | the nav graph (`DHN`) and its checks: data |
| `src/74-dhelv-sim.js` | the ramblers' world declared into core/simulation (`DHS`) and their checks: data |
| `src/95-dhelv-life.js` | the ramblers drawn: the clock, the bodies, the dots on the minimap, following a walker, the nav overlay (V) |
| `src/93-dhelv-map.js` | the minimap: the layout drawn small, the ways near the camera's height bright, the camera and the marker; a click flies there; M hides it |
| `src/94-dhelv-light.js` | the cave's light: underground the sun and the sky's reflections go out; daylight comes down the openings (the sky's light straight down, the sun's beam with shadows, a shaft with motes, a bounce), the lamps nearest the eye light the dark, the tunnels' glow fungus; `[` `]` move the hour |
| `build.py`, `verify.py` | the page: core, the kit's `src/` less its sheet's host, and `src/` here; the headless check |

```
cd settlements/dhelv && python3 build.py && python3 verify.py dist/dhelv.html --assert --out shots   # the page
python3 tools/node_in_chromium.py settlements/dhelv/tests/test-layout.js                    # no node on the owner's machine
python3 tools/node_in_chromium.py settlements/dhelv/tests/test-layout.js --write --write    # rewrite the golden digest
python3 tools/node_in_chromium.py settlements/dhelv/tests/plan-svg.js --write               # redraw layout-plan.svg
```

## `DH`

x east, z south, y up, metres; the hub's square is y 0, and the flank rises east (`DH.surfaceY`).

- The land: `FLANK` (the volcano's slope: 3.5% from the outpost, then sharply up, about 30%, round the shelf's back, easing to
  10% higher up; a low crest carries the spur's line on up it), `PLAT` (the shelf: an organic outline, `plateauD` its signed
  distance, its top 53 m tilting up east, its back merging into the slope; its west face straight and plumb at `cliffX` for
  the outpost's mouths), `LIP` (its top edge weathered round: `shelfY`, `lipR`) and `APRON` (the lee at the west foot,
  levelled for the outpost). `groundY` is the land; `48-dhelv-flows.js` lays the lava on it.

- `HALL`: the hub. Its square is an ellipse 280 by 200 m; the light well's pool (18 m) at its middle; a ledge 10 m up round the
  north and east walls; four mouths (the braid comes in at the west).
- `PITS`: the three satellite wells: centre, radius, floor and depth.
- `NODES`, `EDGES`: the public ways. An edge has a `kind` (`tube`, `braid`, `ramp`, `stair`, `ledge`, `square`, `street`, `door`,
  `secret`), a width and a `zone`: `outer` (where foreigners may go), `inner`, or `secret` (the scouts' ways to the surface).
  The rolling stone door is the one `door` edge (`door: 'stonedoor'`).
- `SITES`: every placed def: `{key, district, x, z, ry, y, at}`. `at: 'wall'` stands the foot of a carved def's front on the hall's
  or a pit's wall (or the outpost's cliff), facing in; `'floor'` stands a def on a floor; `'ground'` places a carved def by
  itself (the cistern, the catacombs, the stores).
- `FOOT`: each key's footprint as the kit declares it (`w`, `d`, and whether the def stands on the foot of its front). The test
  reads the kit's sources and fails if one differs.
- `DISTRICTS`: the hub, the three wells, the cistern, the catacombs and the outpost, each with its anchor node, its graph distance
  from the square, its wealth (`wealthAt(distance)`: 0.9 at the square falling to 0.15 at the outpost) and the list it must hold.
- `HILLS`: the wells' floors' hills (`{id, well, c, y, r, h, pads}`): a dome under each opening, a level pad under each
  building on a pit's floor (the building stands on it); `hillAt(x, z)` the floor and the hill there. The nodes on a hill's
  floor stand on it.
- `MIRRORS`, `SHAFTS`, `DECOY`: section 13's extras the page carves and lights (86).
- `RULES`: the numbers the checks hold the layout to (PLAN.md section 12's ranges).

## The page

The kit's code runs as it is: `build.py` takes `kits/zeijani/src/` (every def, the cavern host, the furnishing, the camera and
dev tools) less the sheet's host, and adds the layout and Dhelv's host. Two options in the kit's cavern host serve Dhelv
(`CV_OPTS` in `40-zj-cave.js`): `skipMass` (a def's block of rock is the world's rock here) and `wellDoor` (a kiva's hatch deep
under the ground opens into its void as a doorway, not through the surface). The orbit camera has no floor inside a void
(`camGroundY`); underground the sky is hidden and a dark fog closes the distance.

**The rock is meshed near the camera only** (`DH_STREAM`: 16 m chunks within 120 m, about 10 ms of meshing a frame, dropped past
170 m): the whole cavern is some 5,600 chunks at about 7 ms each. `_api.meshAround(x, y, z)` meshes round a point at once
(verify does it before each shot).

| Page check (`91-dhelv-probe.js`) | Its negative control |
|---|---|
| every layout site placed | |
| the wells' floors' trees each on its hill, on no path, on no pad | a tree on the lane over the square's hill, one past the hill's foot |
| the tunnels' fungi each on a carved floor (within 0.6 m of the walk map's floor under it) | every one lifted 3 m |
| the cavern built | |
| no void meets the open air but at its openings (sampled every 2 m) | the hall's light well undeclared |
| the wells' floors lit at noon: the sun up, the sky straight up over each floor | a plug of rock in the light well's throat |
| no trees on cliffs or in buildings (both kits': each tree where its kit's mask lets it root, on no slope over 0.6, in no building) | a tree at the cliff's foot, one in the caravanserai |
| the cut-away: every carved site, the camera at it, has a box among the 32 that holds the hall's rock 1.5 m before its front and its own back room | every box's turn mirrored |
| the budgets: at every view, what is drawn (visible and in the frustum, the streamed rock apart) is at most 450 draws and 1.1M triangles underground, 650 and 1.6M on the surface | everything drawn (the switch off, as `?seeall`) |
| the page's files each under 16 MB (verify.py: the gallery's limit a file) | the same files against 1 MB |
| the nav graph's nodes each within 0.1 m of a walk floor | a node moved 2 m into the rock |
| the nav graph's edges walked both ways every 0.5 m: a floor within a step, no block, 2 m headroom on the carved ways and the doors | an edge through a pillar; a tube walked under a 6 m headroom (a low lintel) |
| every door reachable from the outpost's gate, the secret ways apart | the south well's tunnel cut |
| stacked lookups: where two ways cross a level apart, a point on each finds its own | the y swapped |
| a day's run, stepped a minute at a time and sampled every half hour: every pose out in the world on a floor, out of every block and the rock; no route failed, no one stuck; stairs climbed; every district visited | a walker planted off the floor, one inside a pillar |
| the groups: in the day each kind set out and came back; a scouts' patrol fired now makes its stop at a secret exit and comes back | a patrol whose stop nothing offers |
| the rules: no foreign trader's way leaves the outer zone; no way decided while the stone door is shut goes through it (the guard's may) | a foreign way planted through the gate; a way planted through the shut door |
| the ways walked: from the outpost's gate to every district's anchor along the layout's graph, through the carved walk map | the stone door's passage left out |

## The checks (`tests/test-layout.js`)

| Check | Its negative control |
|---|---|
| the graph is connected from the outpost's gate | the portal's tunnel cut |
| every edge within its kind's grade (a ramp 15%, a stair 75%) | the processional way dropped 40 m at a step |
| the outer tube 100 to 300 m, climbing 1 to 3%, 8 to 12 m wide | a 5% stretch |
| the braid climbs 20 to 40 m over 350 to 600 m; tubes cross at two levels or more, at least 6 m apart, never at one | the ledge's west tunnel brought down to the braid's level |
| every way under at least 4 m of rock (outside the hall, the pits and the apron) | the outer tube raised 60 m |
| the square holds its list with room to walk: inside its edge, 3 m apart, half of it free, the lanes to the four mouths open, the stalls in the daylight; the wall's sites on the wall, facing in, clear of the mouths | the guard headquarters pushed into a shop; the kiva set in the west lane |
| every site is a kit def, its footprint the def's | the temple 8 m too narrow |
| each district holds its list; the wells 250 to 450 m out, 60 to 90 m across, 40 to 75 m deep (down from the shelf's top); the cistern within 250 m; the catacombs 600 to 1,200 m out and 40 to 80 m down; the caravanserai on the stream | the south well without its smithy; the outpost without its caravanserai; the catacombs 320 m out |
| wealth falls with the distance from the square: the districts' wealth by the rule, and their homes' mean wealth never rising outward | an estate in the east well |
| the foreigners' zone ends at the stone door: the outer ways reach it and nothing past it, and the door is the only way on | a side passage round the stone door |
| the outpost's sites apart (the palisade's runs join end to end); the cliff's sites on the cliff, facing west | the barracks moved onto the timber house |
| the wells' floors: a hill under each opening, every building on a pit's floor on its level pad, every node on a hill's floor on the hill | the east well's smithy lifted a metre off its pad |
| the layout matches its golden digest | |

## Getting about

- **Double-click** drops a marker (a red pin) where you click; **G** brings the camera to it; **Walk (F)** starts on it (or on
  the nearest floor to the view's centre, never the surface over an underground view). **Run (R)** walks 2.5 times as fast
  (Shift too, while held).
- **The minimap** (bottom right) shows the city or the outpost, whichever you are in; the ways within 6 m of your height are
  drawn bright. Click it to fly there; **M** hides it.

## The wells' floors

Under every opening (the owner: "the square is one low hill, no rocks, with the park lanes on top of it ... ferns and small
trees there rather than the siphon tree"; each well's bottom "a low grassy hill, place farms and other structures on top of
it, and infill with flora") the floor is a grassy hill: under the light well one 20 m across the radius and 1.8 m high (the
park: `zj_park` with `hill` draws nothing of its own), on each pit's floor one filling it to 4 m short of its wall, 3 m high,
a level pad under each building on it. The layout makes them (`HILLS`, `hillAt`) and puts the buildings and the nodes on
them; `89-dhelv-hills.js` draws each in the library's turf (`ground.grass_ground`, the kit's `turf`), the ways over it as
paths (`turfPath`), writes its walk floor (quads of 2.5 m: the walkers and the nav's grids climb it) and plants it: the
Throne kit again, its host swapped for the hills (its island forest's ground: tree ferns and lehua, its passes filtered to the
small trees; its floor and understory's ferns, moss and tufts), off the paths and the pads. About 60 small trees and 8,500
plants in all. They are drawn as the underground is (within 420 m of the camera, wherever it is).

## The tunnels' fungi

Along every carved way (the tubes, the braid, the ramps; 27 ways, 3 km) the Throne kit's own cave pass (its lava tube
station's dark floor) plants glow mushrooms, specimen and alien mushroom cards, scale cones and lichen in a band 1.4 to 3.4 m
in from each side of the floor (past the reach of a clump's spread into the wall's fillet; the middle left to the walkers),
off each way's last 6 m (its junctions) and out of the hall and the pits. One pass a way, the kit's host swapped for it (its
ground the way's floor, its 'cave' field the band), at six times the kit's density (the owner: denser); baked with the wells' floors and drawn
as the underground is. They add to the glow fungus (`94-dhelv-light.js`).

## Section 13's extras

PLAN.md section 13, placed (the owner: "work on remaining extras"): **a hot-spring bath** (`zj_bath`) in the hall's
south-east wall; **a bat roost** (`zj_roost`) in its north-east wall; **signal stations** (`zj_signal`, horns and lamps) by the
hall's west mouth and by each well's way in; **dovecotes** (`zj_dovecote`) out by the pasture; **light-well mirrors**
(`zj_mirror`) on each well's floor by its way in, each throwing its well's daylight down the way (a spot light as strong as
the sun is high, while the camera is underground near it); **air shafts** from three deep ways (the processional way, the
braid's junction, a tube under the square's west) up through the shelf to vent heads (`zj_vent`) in the forest, a caged bird
kept on a bracket under each (the sentinel that sickens before a person does); **the buried light well**: a dead-end tube off
the processional way under an old skylight sealed by a young flow (a glassy black plug, frozen drips, votive lamps); **a decoy
entrance**: a mouth in the shelf's north wall over the lava trough, its passage 30 m in to a rubble choke, in no graph. The
glow fungus (13.5) and the stone door (13.2) were already there, and the scouts' secret exits (13.3).

## The square

The park under the light well (a grassy hill, the lanes over it: the wells' floors, above) with the stalls round its edge; then a deterministic pass in the layout (`41-dhelv-layout.js`,
"the square filled") lays in the market hall, three more shops, seven houses and 22 row houses (`zj_rowhouse`, a narrow
three-storey home), and two fountains: the homes take the outer ring first, so they line the square in a street facing in,
5 m in from the wall (6 m clear of a carved front), clear of the lanes, the ledge's stairs and the park.

## The cave's light

Underground (the camera below the ground) the sun's own light and the sky's reflections go out and the eye's exposure rises.
Daylight comes only down the light well and the three wells: the sky's light straight down each (the larger share), the sun's
beam along the sun with shadows (its pool crosses the floor with the hour), a shaft of lit air with motes in it, and a warm
bounce. The lamps the buildings record (lanterns, hearths, burners) and the glow fungus lining every tunnel (every 18 m) are the
rest: the 14 nearest the eye are real lights. `[` and `]` move the hour. Checked: the well floors see the sky at noon (its
negative: the light well's throat plugged with rock).

## The shelf and its lava

The city is inside an old spur (the owner: "a shelf sticking out of the slope of the volcano"; review 3: its back "fully
continuous with the slope", the land taking "a sharp rise around where the end of this plateau is"). The flank rises gently
from the outpost, then sharply round the shelf's back: there the slope climbs past the shelf's top and the shelf merges into
it (the ground is the smooth maximum of the two), its walls dying away; a low crest carries the spur's line on up the slope.
**The young lava is laid by the Throne kit's own flow model** (`48-dhelv-flows.js`, `THRONE.flowHistory`): seven flows from
vents up the flank, outside the crest's line, oldest first (seven centuries to three years), each running down the fall line
of the ground as it then stood, widening into lobes with steep fronts. They part at the spur, bank against its north and
south walls and spread across the plain below its tip, leaving the apron (the lee under the west face) bare. The spur's ground
is 2,600 years old, the apron 400; `THRONE.ageAt` answers the model's ages elsewhere. It lays the flows in about 0.5 s.

The ground is drawn in 50 m tiles: at 5 m where a sheer step, the outpost or an opening passes, 10 m elsewhere on the spur,
25 m out on the flank (about 125k triangles); a skirt hangs under an edge that meets a coarser tile (40 m deep at the drawn
ground's outer edge), and the normals come from the height. Past it, the far land: squares of about 100 m out to 5 km on the
same land, so a high view sees the land to the horizon. **The spur's walls** are their own mesh (`dhWalls`): jointed columns
4 m out on each step's low side up to the lip's foot, then the **weathered lip** (review 3: "round off the upper edge a bit"):
a quarter circle 10 to 15 m in radius curving up and in onto the top (`DH.shelfY`, the same function the ground draws more
coarsely under it). The west face has its columns too, but for the outpost's carved fronts: there it is dressed in the
cliff's rock 8 cm before the ground's plumb step (`dhWestFace`), open at each mouth. **The mouths** (the portal, the galleries,
the lean-to, the decoy) cut the ground only up to their own top, always, and the rock round each is kept meshed (`DH_STREAM.pin`),
so a mouth reads from anywhere (review 3: the face went transparent at some angles, the portal invisible at others).

**The stream** (review 3: it "comes from and goes to nowhere"): the shelf's forest's water spills over the lip down the west
face in front of the columns into a plunge pool at the foot, runs across the apron and sinks into the porous young lava in a
swallow pool at the apron's edge.

## The forests

The hyperjungle kit (biomes/hyperjungle/src) is read in place: `build.py` takes core/biome (head, kit, foliage, place,
stage) and wraps the kit's fragments (41, 50, 55, 60, 65, 70; its fauna left out) in one closure, so the helpers its 41
declares (TAU, rng, fbm...) and its random stream stay its own beside the Zeijani kit's. Its texture pack goes beside the page
(`dist/dhelv.tex.hyperjungle.js`, about 3 MB) to keep the page under 16 MB.

**The shelf's old growth is standardized** (`49-dhelv-grove.js`; the owner: "2-3 standardized trees ... and LOD"): the kit
grows three hypertrees (a baobab, a mahogany, a ghostwood, each near and as its far impostor) and three saplings once, alone on
a flat stage (`HYPERJUNGLE.make`, `.grow`, the open world's nursery harvest, copied), in about 0.15 s. 23 giants (scaled to
about half the kit's, 80 to 140 m) and some 1,400 saplings stand on the shelf's top, each tinted a little; they are drawn as
instances in cells (200 m near, 400 m far): a giant near within 420 m of the camera and its impostor beyond, a sapling as
grown within 300 m and beyond it a stand-in (a bole and a crown in its leaves' colour, about 90 triangles). The kit's floor
pass lays the understory round them. `?noforest` leaves the forests out, `?q=` scales the floor.

**The Throne kit's flora** (biomes/throne/src 46, 50, 55, 60, 70, wrapped the same way; its pack less the host's ground, roof
and sea sets in `dist/dhelv.tex.throne.js`, 8.6 MB) plants the flows by their ages, first, and its big
trees become obstacles to the hyperjungle's. Its fields are cached on an 8 m grid; its mask is the flank less the spur's
walls, their foot and lip, the light well, the wells' pits and any scarp. It plants in about 3.4 s. `?nothrone` leaves it
out, `?tq=` scales it (0.7). Checked: no tree on a wall, a slope or in a building at its own level (its negative: one planted
at the west face, one in the caravanserai).

## What is drawn

The buildings are drawn in cells of 160 m, carved and surface apart (`DH_CELLS` in `90-dhelv-scene.js`), and the furniture's
batch is cut by site after it is flushed (`dhSplitFurniture`: each merged mesh keeps its vertices and gets an index a site).
The plants (both kits' baked meshes, each one for the whole map) are cut into cells of 400 m after the bake
(`dhSplitBiome`: an instanced mesh by its instances, its rows copied; a merged one by its triangles).
Every quarter second the camera decides what is drawn (`dhSeen`): a carved cell within 420 m; a surface cell above ground, or
within 220 m from below (out of the portal, up a well); a carved site's furniture only with the camera inside it or before its
front (32 m out, at its floor's height), a sunk site's within 45 m, a built site's within 90 m (150 m on the surface), all of
them in the cut-away; the plants within 1,150 m above ground (the fog is four fifths there), underground only up an opening or out of the cliff's mouths.
The textured furniture (the batch's decals: each its own mesh) goes into its site's cell too. On the surface the views draw at
most 1.47M triangles (over the shelf, the city below) and 568 draws (the outpost's view). `?seeall` draws everything.

The cut-away (C) at the carved sites: the 32 nearest the camera (`dhCutBoxes`) open the rock that is not their own (the
hall's wall before a front, the ceiling over its bay) above the site's floor + 2 m, as each room's own rock opens above its
floor; the ground over them opens on the camera's side.

## The nav graph (P6)

`src/72-dhelv-nav.js` (`DHN`, data only) builds the one graph the ramblers walk, from what was built (built on first use,
after the world, in about 0.8 s): the layout's ways (`DH.NODES`, `DH.EDGES`, each node set on the floor built under it);
a grid on each open floor (the hall's floor and bays at 3 m, each well's pit floor at 3 m, the apron's floor at 5 m), its
nodes where the walk map has that floor and no block, its edges where a walker walks; and a door node a metre out from
each building's front (else behind or beside it: a kiva's hatch is reached from its ladder's side; else the way's node at
the door: the cone's towers), linked to the two nearest nodes a walker reaches. A street or a square's lane between two
nodes on one open floor is a line on a plan, not a way built, so the grid carries it. A way the scene builds to its own
shape hands the nav its points (`DH_REAL`: the cliff's switchbacks). Every lookup takes y (`DHN.nearest`: the floor under
the point, then the way or node on that floor's level), never the nearest in plan. About 11,150 nodes and 41,700 edges.

What the edge check found in the walk map, fixed: the braid's tube at the ledge's west end laid its floor over the stair's
head (a 0.7 m lip coming down), so a stair up to a node other ways leave now ends on a level landing as long as they need
to clear it; the east stair to the ledge ran up under the ledge's last 20 degrees (now from 15 degrees past its end, as
the west one); the stairs up the old cone's cliff to its towers were walk strips with nothing drawn, through the rock (now
built switchbacks of tuff ashlar against the cliff: `dhCliffStairs`).

## The ramblers (P6)

The life layer is core/simulation (with core/clock and core/sched), as Mungo's. `src/74-dhelv-sim.js` declares Dhelv into
it: the nav graph's layers ('pedestrian', every way but the secret ones; 'outer', the outer zone only, for the ash-nomad
traders; 'guard' and 'scout', which pass the stone door when it is shut, it being theirs); 118 places from what was built
(each door's site by its key: homes, shops, taverns, the farms, the temple, kivas and shrines, the catacombs, the cistern,
the posts, the caravanserai; the pasture and the woods on the apron), each door carrying its nav node so a route
starts and ends on the right level (SIM's own lookup is by plan); the PLAN's roles with hourly schedules; about 650 people
from the homes (`?pop=2` doubles them). The rolling stone door is shut from 22:00 to 5:00. A day runs in under a second.

`src/95-dhelv-life.js` draws them: the clock (held at the sky's hour; `?time=run` runs it, `?scale=10` ten times fast,
`?hour=8`; `[` and `]` move it with the sky), SIM stepped once a world minute, the nearest 700 out of doors drawn from an
instanced pool (a robe in the role's colour, a head; `?walkers=N`), the minimap's dots, a click on a walker follows it and
draws its way (Esc lets go), V (or `?nav`) the nav graph with any edge the check refused in red. `?nolife` leaves it out.

**The groups that try the hard routes** are core/simulation events, each from an entry inside the city (a port with its
height and nav node) to its stops together and back, in single file (`spread: 0`): the scouts' patrol from their
headquarters out by the secret way to a scout exit; a funeral from each well's kiva down to the catacombs; porters from each
well's stores to its fields; the guard changing at the stone door; children wandering the square's fountains, niche and
market. What they found, fixed: a group's members stood at a stop straight back from their leader off the way's last bend
(in the catacombs' rock); now where their walk stopped, along the way (core/simulation, `77-sim-5-motion.js`).
