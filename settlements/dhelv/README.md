# Dhelv, the capital of the Zeijani

The Zeijani's underground city under a young lava flow on the Throne's flank: an outpost in a kipuka, a 2 km outer tube to a rolling
stone door, a braid of tubes climbing to the hub (a bottle-shaped great hall under a light well), three satellite wells, the cistern
hall and the funeral catacombs. Its buildings are the Zeijani kit's (`kits/zeijani`); the plan is `kits/zeijani/PLAN.md` (section 12
is this layout; section 14 the phases).

**State (2026-10-07): P5a, the page's skeleton.** The layout carved and placed: the hall, the three wells, every way (tubes,
ramps, stairs, the ledge, the scouts' ways), the kit's defs on their sites with their interiors furnished, the ground of the
flows, the kipuka and the old cone. Next: P5b (the surface: the hyperjungle and the Throne's kit read in place, the stream, the
flows' basalt), P5c (the cave's light by the hour, drawing only what is seen, the minimap by level, walk mode's start). The
ramblers (P6) and the Godot case (P7) follow.

| Path | What |
|---|---|
| `src/41-dhelv-layout.js` | the layout as data `[G data]` (no THREE, no DOM): `DH` (below) |
| `tests/test-layout.js` | the layout's checks, each with a negative control; a golden digest of every node and site |
| `tests/plan-svg.js` | draws the layout as a plan: `layout-plan.svg` |
| `layout-plan.svg` | the plan, for tuning by eye (hover a line or a footprint for its id, height and grade) |
| `src/00-head.html` | the page shell (the kit's, titled) |
| `src/45-dhelv-bio.js` | the biome host: BIO bound before the kit loads; the kipuka's mask (its floor less the clearing, the stream, the pasture and the cliff's foot), the outpost's buildings as obstacles; `dhbForest` plants it with the world |
| `src/90-dhelv-scene.js` | the host: the sky, the ground's heightfield (`terrainH = DH.groundY`), the ways carved (`dhCarve`), the sites placed, the rock meshed near the camera (`dhStream`), the views |
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
| the rules: no foreign trader's way leaves the outer zone; no way decided while the stone door is shut goes through it (the guard's may) | a foreign way planted through the gate; a way planted through the shut door |
| the ways walked: from the outpost's gate to every district's anchor along the layout's graph, through the carved walk map | the stone door's passage left out |

## The checks (`tests/test-layout.js`)

| Check | Its negative control |
|---|---|
| the graph is connected from the outpost's gate | the portal's tunnel cut |
| every edge within its kind's grade (a ramp 15%, a stair 75%) | the processional way dropped 40 m at a step |
| the outer tube 1.8 to 2.2 km, climbing 1 to 3%, 8 to 12 m wide | a 5% stretch |
| the braid climbs 30 to 40 m over 400 to 600 m; tubes cross at two levels or more, at least 6 m apart, never at one | the ledge's west tunnel brought down to the braid's level |
| every way under at least 4 m of rock (outside the hall, the pits and the kipuka) | the outer tube raised 60 m |
| the square holds its list with room to walk: inside its edge, 3 m apart, half of it free, the lanes to the four mouths open, the stalls in the daylight; the wall's sites on the wall, facing in, clear of the mouths | the guard headquarters pushed into a shop; the kiva set in the west lane |
| every site is a kit def, its footprint the def's | the temple 8 m too narrow |
| each district holds its list; the wells 250 to 450 m out, 60 to 90 m across, 25 to 40 m deep; the cistern within 250 m; the catacombs 600 to 1,200 m out and 40 to 80 m down; the caravanserai on the stream | the south well without its smithy; the outpost without its caravanserai; the catacombs 320 m out |
| wealth falls with the distance from the square: the districts' wealth by the rule, and their homes' mean wealth never rising outward | an estate in the east well |
| the foreigners' zone ends at the stone door: the outer ways reach it and nothing past it, and the door is the only way on | a side passage round the stone door |
| the outpost's sites apart (the palisade's runs join end to end); the cliff's sites on the cliff, facing west | the barracks moved onto the timber house |
| the layout matches its golden digest | |

## Getting about

- **Double-click** drops a marker (a red pin) where you click; **G** brings the camera to it; **Walk (F)** starts on it (or on
  the nearest floor to the view's centre, never the surface over an underground view). **Run (R)** walks 2.5 times as fast
  (Shift too, while held).
- **The minimap** (bottom right) shows the city or the outpost, whichever you are in; the ways within 6 m of your height are
  drawn bright. Click it to fly there; **M** hides it.

## The square

The park under the light well (`zj_park`: lawn, paths along the lanes, a pool and fountain, trees, shrubs, beds, giant
alecaps at its shaded rim) with the stalls round its edge; then a deterministic pass in the layout (`41-dhelv-layout.js`,
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

## The kipuka's forest

The hyperjungle kit (biomes/hyperjungle/src) is read in place: `build.py` takes core/biome (head, kit, foliage, place,
stage) and wraps the kit's fragments (41, 50, 55, 60, 65, 70; its fauna left out) in one closure, so the helpers its 41
declares (TAU, rng, fbm...) and its random stream stay its own beside the Zeijani kit's. Its texture pack goes beside the page
(`dist/dhelv.tex.hyperjungle.js`, about 3 MB) to keep the page under 16 MB. Three hero hypertrees ring the outpost's
clearing with their saplings and some 2,000 understory plants; the young flows are basalt; a stream runs through the
clearing. Checked: no tree on the cliff or in a building (its negative: one planted at the cliff's foot, one in the
caravanserai). `?noforest` leaves it out, `?q=` scales it.

**The young lava is the Throne kit's** (biomes/throne/src 46, 50, 55, 60, 70, wrapped the same way; its pack less the host's
ground, roof and sea sets in `dist/dhelv.tex.throne.js`, 8.6 MB). It plants first, as on its kipuka station, and its big
trees (the great ruffs, the siphons, the frill trees) become obstacles to the hyperjungle's. Its flow model is not run:
Dhelv binds its own ages (`45-dhelv-bio.js`: `THRONE.FLOWS` from the layout): the kipuka 2,600 years, the old cone 8,000
(old ground: its forest), the flow over the city sixty ("a bare flow": the pioneers, scattered small trees) with older
lobes (380: woodland) and fresh tongues (8: bare rock) where a noise says. Its fields (humid, slope, rock, owned, kedge,
knear, skylight) are cached on an 8 m grid; the skylight ring round each well's pit takes the kit's skylight flora. Its
mask: the ground's sheet less the cliff's foot and lip, the clearing, the stream, the pasture, the light well, the wells'
pits and any scarp. About 4,300 of its trees; it plants in 2.9 s. `?nothrone` leaves it out, `?tq=` scales it (0.7).

## What is drawn

The buildings are drawn in cells of 160 m, carved and surface apart (`DH_CELLS` in `90-dhelv-scene.js`), and the furniture's
batch is cut by site after it is flushed (`dhSplitFurniture`: each merged mesh keeps its vertices and gets an index a site).
The plants (both kits' baked meshes, each one for the whole map) are cut into cells of 400 m after the bake
(`dhSplitBiome`: an instanced mesh by its instances, its rows copied; a merged one by its triangles).
Every quarter second the camera decides what is drawn (`dhSeen`): a carved cell within 420 m; a surface cell above ground, or
within 220 m from below (out of the portal, up a well); a carved site's furniture only with the camera inside it or before its
front (32 m out, at its floor's height), a sunk site's within 45 m, a built site's within 90 m (150 m on the surface), all of
them in the cut-away; the plants within 1,300 m above ground, underground only up an opening or out of the cliff's mouths.
Underground the views draw at most 0.83M triangles and 327 draws besides the rock; on the surface, over the kipuka's old
growth, up to 1.5M and 585 (3.7M and 2,423 with everything drawn). `?seeall` draws everything.

The cut-away (C) at the carved sites: the 32 nearest the camera (`dhCutBoxes`) open the rock that is not their own (the
hall's wall before a front, the ceiling over its bay) above the site's floor + 2 m, as each room's own rock opens above its
floor; the ground over them opens on the camera's side.

## The nav graph (P6)

`src/72-dhelv-nav.js` (`DHN`, data only) builds the one graph the ramblers walk, from what was built (built on first use,
after the world, in about 0.8 s): the layout's ways (`DH.NODES`, `DH.EDGES`, each node set on the floor built under it);
a grid on each open floor (the hall's floor and bays at 3 m, each well's pit floor at 3 m, the kipuka's floor at 5 m), its
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
the posts, the caravanserai; the pasture and the forest's edge on the kipuka), each door carrying its nav node so a route
starts and ends on the right level (SIM's own lookup is by plan); the PLAN's roles with hourly schedules; about 650 people
from the homes (`?pop=2` doubles them). The rolling stone door is shut from 22:00 to 5:00. A day runs in under a second.

`src/95-dhelv-life.js` draws them: the clock (held at the sky's hour; `?time=run` runs it, `?scale=10` ten times fast,
`?hour=8`; `[` and `]` move it with the sky), SIM stepped once a world minute, the nearest 700 out of doors drawn from an
instanced pool (a robe in the role's colour, a head; `?walkers=N`), the minimap's dots, a click on a walker follows it and
draws its way (Esc lets go), V (or `?nav`) the nav graph with any edge the check refused in red. `?nolife` leaves it out.
