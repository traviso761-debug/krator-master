# Pinnacle Rock

The Beast Riders' roost town on a red sandstone mesa at the north-eastern edge of the hyperjungle (`PLAN.md`; the lore is
`LORE.md` §6.6). Built in stages (`PLAN.md` section 3). **Done: P0 and P1, the rock and the site; P2, the roosts, the
Stair, the lifts and the flyers; P3a, the town on the top; P3b, the farms; P3c, the bands' grounds; P3d, the Deep Root cavern;
P3e, the Garden's great-houses and the ways up.** The life and the night (P4) and the record (P5) are the stages to come.

```
python3 build.py                                   # dist/pinnacle-rock.html (+ its texture sidecars)
cd dist && python3 ../verify.py pinnacle-rock.html --assert [--all-views --out ../shots]
```

## What the page is

- **The site is the scale model's** (4.21, px 755,351). `region/` holds the cut round it (120 km square, from
  `tools/scale-model/extract_region.py`; the model's regions and settlements as read on 2026-10-19 in `region/source/`,
  the cut's box added as `regions-cut.json`). `tools/world_data.py` decodes the rasters at build time into the typed
  arrays the open world's fields take (`openworld/little-demo/src/41-world-fields.js`, read in place: `WORLD.H`). The
  page's floor IS the model's land (y 0 = the knoll's ground at the mesa's south foot), with one cut finer than its
  4 km cells: the dry gorge under the north rim (the plan's). `86-pr-far.js` draws the rest of the cut to 60 km: the
  forest as a canopy surface opened over the rivers, the K'etsaal Baatar's valley 11 km south, the Inner Wall rising to
  ~3 km 48 km north.
- **The plan is data** (`src/40-pr-layout.js`, `[G data]`): the settled layout's numbers (the diagram,
  https://claude.ai/artifact/Dn8qzog9vCzCvcV9gxHpZH): the mesa, the ten fins by group, the Garden's mesa and its sixteen stacks, the Heart, the
  shrine's balanced rock, seven spurs, the top's zones, the palisade, the nine bands' pastures, camps and hedges, the
  fair ground, the road and gate, the pond, the spring, the gorge; `PR.zoneAt`, `PR.topZoneAt`, `PR.forest`.
- **The rock** is KSTACKS records (`core/terrain/37-core-stacks.js`) made from the plan (`45-host-stage.js`): the mesa
  (250 m over the south foot, 1.24 by 0.82 km), the fins each set in from the rim until their whole foot is 12 m inside
  the edge, the spurs, the Garden's mesa (55 m over the top) with its sixteen pinnacles, and the Heart in its middle: a
  third mesa about half the central pinnacles' height (110 m over the Garden's mesa), weathered hardest (`weather` 2),
  the three tallest pinnacles rising out of it. Every mesa is weathered as the owner's Monument Valley reference has it
  (2026-10-19): flutes down the cliff, gullies notching the rim, a rough shoulder of thin ledges stepping back 30-45
  degrees to a flat top (KSTACKS `weather`, `shoulder`), and round every wall's foot a **debris slope** (`LAND.talus`
  in `45-host-stage.js`: about 34 degrees, 55-85 m high against the wall and ~115 m out, in ledge bands) strewn with
  fallen blocks (`87-pr-talus.js`: up to ~9 m near the foot).
- **The roosts** (P2) are records (`src/43-pr-roosts.js`, `PRR.plan`, `[G data]`) drawn by `89-host-roosts.js`:
  - a **deck ring** round each Wing's fin (seven) and each of the four ringed Garden pinnacles, and a narrower **lookout
    ring** near the top of every fin and pinnacle that carries one (fourteen). A ring's inner edge follows the stack's
    outline at its height (rays from the rock's own middle there: a stack leans), 0.8 m off the rock; its outer edge is
    that outline's hull pushed out 14 m (4.2 m for a lookout), cut back short of a neighbouring stack (the Heart's
    three pinnacles stand 25 m apart). Timber joists carry it, and struts whose feet are let into the rock where it
    stands under the deck at each angle (`feet`: the rock's reach there, found per angle, never a fixed offset);
  - **stalls** in Girder's frame and record shape (`ROOSTS`: the perch point 1.4 m inside the edge, open stalls 9.2 m
    deep, the lean-to with its red eave band, the perch beam 3.4 m out) along the whole edge, round its bends too: each
    stall's sides run in along the edge's normals at its front corners (`quad`), so round a bend it is a wedge and its
    partitions run parallel to its neighbours'; a stall goes wherever its footprint stands on the deck, meets no other,
    and its way out is clear for 150 m (no rock within 10 m under the deck; no deck, bridge or lift across the flight's
    height band): 113 (owner, 2026-10-19: the platforms take more), by Wing (the Wingclaw's 29 on the north fins, the
    Quetzal's 30 on the east, the Nightwing's 21 on the west) and the Garden's 33; a **keeper's shelter** (feed and tack)
    on each stall deck, its place kept first (a fin's tightest bend, a Garden ring's side facing the Garden);
  - a **climb** to every ring: a timber stair hugging the stack from its foot (or from the deck below), 32 degrees, its
    inner edge .1 m off the rock at each tread's height, every fourth tread a bracket and a ledger let into the rock
    1.6 m under it, coming up through a hatch in the deck;
  - **rope bridges** between the stall decks of each group's fins (north 54 m, east 75 m and 45 m, west 69 m);
  - **the lifts**: the beast lift down the gorge face between the Wingclaw's fins, and the capstan lift beside the Stair
    on the south nose: a trussed boom over the edge, its tip 4 m clear of the wall at every height, a cage on its cable
    (moving), a landing on the debris slope, the capstan and its rope;
  - **the Stair** down the south nose, on the stretch of the face that stands least in and out (no gully; chosen per
    build): straight down the shoulder's ledges, cut down into them (never over a ledge, never over 45 degrees); three
    flights along the face, **on the wall as drawn, bed by bed** (owner, 2026-10-19: attached at every slice, no clipping
    at an overhang). The rock mesh draws a bed's wall with at most 160 segments, so on the mesa its corners are ~25 m
    apart and the flutes and the beds' weathering between them are cut straight across: the drawn face stands up to
    12 m inside the outline KSTACKS' queries give. So the plan reads the wall from the mesh itself (`PRR`: `wallOf`,
    `wallR`, `drawnTop`, from `KSTACKS.mesh` with the page's wall steps), and a tread's middle stands on the drawn wall
    of the bed under it and never under rock over it: where a bed juts out within 2.2 m over the tread, the tread stands
    out at that bed's face, on masonry from both its edges down to the rock 2.7 m under it, the flight easing out to the
    overhang and back in over the treads either side (no jog). The cut flights stand half into the face, the head and
    the top flight 4.5 m wide and the others 3 m (owner, 2026-10-19: the last switchback up was tight); the return flight
    is a timber gallery off them, clear of the widest cut flight, on brackets and ledgers let into the rock 3.6 m under
    it, so no flight turns under another; a stone landing platform at each turn, from the cut flight's inner edge out past
    the gallery's, running 4.5 m on past the turn, fitted to the wall at both its ends and its middle, on masonry to the
    rock; a path of steps down the debris slope to the fair ground, seated on the drawn ground and kept
    clear of fallen blocks and plants; gated at its head, its middle landing and its foot. The climbs round the fins
    and pinnacles follow the same rule on their stacks' drawn walls (inner edge .2 m in, never under rock over it, a
    clear start beside a neighbouring body: a Garden pinnacle's climb in its cleft with the Heart), every fourth tread
    bracketed into the rock.
  - **the lift road** (owner, 2026-10-19: the beast lift wants a cleared road): from the lift's landing, laid out at
    1 in 9 (never steeper than 1 in 8 anywhere) and put where the slope stands at its height, round the mesa's north-west as a bench cut level across the
    debris slope (the slope's height, `LAND.talus`, is cut to it and the floor mesh re-seated: `47b`), a dry-stone wall
    and kerb on its downhill side, then over the floor north and west of the seep pond (`PR.LIFT_ROAD`) to the palisade,
    where the north-west gate will stand (P3). Its way, like the Stair's path, is cleared (`PR.addWay`: `PR.forest`, the
    necanyons kit's mask, the fallen blocks).
- **The flyers** are Girder's (`settlements/girder/src/84*.js`, read in place and sealed with this page's world, obstacles,
  bays and circuits: `flyers/README.md`): quetzalcoatlus, giant bats, archaeopteryx and dragonflies with their riders,
  coming and going on every proved bay, on the rim and Garden circuits, the patrols and the bats' night hunt. **Each
  Wing's beasts in its own stalls** (owner, 2026-10-19): the Quetzal's quetzalcoatlus, the Wingclaw's archaeopteryx, the
  Nightwing's bats, the Garden's roosts the three; the Dragonfly tribe's beasts (kept by water on the floor) fly the
  circuits but do not roost.
- **The town** (P3a) is one `core/city` instance on the top (`src/54-pr-town.js`, `PRT.plan`, `[G data]`; run before the
  kits build in `54b`, drawn by `89c-host-town.js`), a new layout on the module (`rand: 'krand'`, the insertion index, the
  exact-streets rule). Its steps 0-5 are this page's: the build zone is the cap's outline less the 12 m rim band, the
  rock standing on the top (the fins, the shrine's rock, the Garden's mesa: their beds within 25 m of the foot, grown
  4-7 m), the climbs' starts, the lifts' and the Stair's heads, the Deep Root precinct (P3d) and the nine bands' grounds
  (P3c); the landmarks are the assembly hall (Girder's) on the Crown's square with its market stalls and pavilion, the
  caravan market by the Stair, the shrine of the Winged Ones in the lee of its balanced rock, each Wing's roost barracks
  and its tack and feed store by its fins, the toll house and a beacon at the Stair's head, the carrier-beasts' stage and
  the watch at the beast lift, a signal mast on the north-east rim; the avenues are the Stair Way, the ring round the
  Garden's mesa, the Crown Way, the ring round the Crown, the Lift Way and the processional to the Deep Root precinct.
  Steps 6-12 are the module's builder, drawing from the quarters' tables (`PRT.DRAWS`: the house quarter west, the
  trades east, the strangers' quarter south, the Crown the wealthiest) and a civic list that gives every trade the town
  carries a building (31 of the kit's census trades; the farms', the river's and the mines' are not the top's). The
  buildings are the Beast Riders kit's (`kits/beast-riders`: its houses, trades and mounts' buildings, and the ports of
  Girder's round-hut compound, joglo and stave longhouse, its hall and stalls, Mav's shrine), bundled by `build.py`
  (`CAT`, sealed with the catalog's core and the two towns; `KCITY` as the isle demo bundles it), each built once and
  drawn instanced (the isle demo's `58-isle-protos.js`, read in place). About 600 buildings, 120 streets.
- **The farms** (P3b) are records (`src/55-pr-farms.js`, `PRF.plan`, `[G data]`; run in `55b`, drawn by `89d-host-farms.js`):
  the ring inside the palisade measured out from the mesa's foot (its radius smoothed over 12 degrees), from the debris
  slope's toe to the palisade, in six terraces of two rows each, cut into field cells of about 34 m (a cell is the quad
  between its angles and radii, inset 1.5 m for the bunds; none overlapping another, none off the farmland, the debris
  slope, the tracks or the spring). The two outer terraces are orchards (stack figs, ember plums), the cells within
  280 m of the spring paddies, the rest fonio, millet, pigeon pea, gourds, kitchen gardens and beetle pens. Each cell is
  drawn levelled at its highest corner with banks down to the ground, its crop in instanced rows. Twelve farmhouses (the
  kit's `br_bldg_farmhouse`: the farmhouse and its yard, the courtyard farm, the paddy farm on its piles by the spring),
  each wholly in a cell along the terrace way. The palisade is the plan's line: a sharpened stake every half metre,
  Girder's gatehouse at the forest gate (on the road), the north-west gate (where the lift road comes in), a west and an
  east gate, Girder's stretch with its watch post about every 220 m, ending where the debris slope rises at each end.
  The terrace way runs round the ring between the third and fourth terraces, with a track in from each gate; the forest
  road runs from the fair ground out through the forest gate.
- **The bands' grounds** (P3c) are records (`src/56-pr-camps.js`, `PRC.plan`, `[G data]`; run in `56b`, drawn by
  `89e-host-camps.js`) from the kit's table (`BR_CAMP`, `kits/beast-riders/src/79-br-camp.js`): nine grounds on the top
  (the Quetzal's, the Wingclaw's and the Nightwing's only there, by their Wing's fins, with their perch frames; the six
  ground tribes' smaller, with a hitching line), moved in from the diagram's places so each stands on the usable cap; nine
  camps on the floor, each with its pasture inside its own thorn hedge (two gates), the pasture fenced in rails (one gate,
  toward the camp). Each ground's tents and pens are pitched largest first, each the first fit on rings out from its
  place, facing the chief's pavilion, 2 m clear of the others; on the floor the pens take the hedged ground, a corral or
  a ring wholly in the pasture or wholly out of it. Each band's banner (its tribe's colour) stands before its chief's
  pavilion. The hedges and fences are cut by the kit's `BR_RUN`; the hedges' runs are drawn as a light band of brush
  (the kit's run piece is 9.7 k triangles and the hedges 14 km), its gate pieces whole. A track runs from each floor
  camp's inner gate to the nearest palisade gate whose way crosses neither the farms nor another band's hedge, coming
  in along the gate's front (the Staghorn's takes one bend); the tracks are PR's ways, cleared before the forest grows.
- **The Deep Root cavern** (P3d) is records (`src/57-pr-cavern.js`, `PRD.plan`, `[G data]`; run in `57b`, drawn by
  `89f-host-cavern.js`) and a KCAVERN plan (`core/terrain/39-core-cavern.js`, now on this page): in the precinct, on the
  line from the court (`PR.TOP.court`) to the light well (`PR.TOP.well`), a court 24 by 20 m sunk 8 m into the cap with an
  open stair cut down into it, the passage of the tribes going down 10 m from its west wall to the hall (44 by 26 m, its
  vault's crown 15 m over its floor, 3 m of rock over that), the light well from the hall's vault to the sky, two well
  openings through the cap. The dressing is the kit's rock-cut pieces against their walls: the carved face round the door
  (scaled to the court's 8 m: the kit's is 14.8 m high), the twelve tribes' niches down the passage in the lore's order,
  the five shrines' lamp niches and two ledges of offerings along the hall, the altar stone at its west end. Over the
  well, a stack fig with its roots hanging 12 m down it, in a ring of twelve standing stones; a rain pool on the hall's
  floor under it; the processional paved from the town's avenue to the court's stair. The cap (necanyons' land fragment
  draws a top as five coarse rings) is re-cut where it reaches an opening: each such triangle is refined toward the hole's
  edge to a metre and the parts inside dropped, and the cavern's own ground inside the rim (drawn with the cap's material)
  closes the seam. The camera may go into the voids (`clampCam`).
- **The Garden** (P3e): its ways up are the roost plan's ascents (`43-pr-roosts.js`, `o.ascents`, made by the climbs'
  builder round the drawn wall, drawn with the climbs: timber treads bracketed into the beds): the Garden's stair up its
  south wall from the main top, its ramp for the beasts (1 in 7) up its west wall from the north, and the stair up the
  Heart from the Garden's top on its east. Its great-houses are records (`src/58-pr-garden.js`, `PRG.plan`, `[G data]`;
  run in `58b`, drawn by `89g-host-garden.js`): two chiefs' compounds and ten clans' great-houses round the Heart facing
  it, and rock longhouses backed against four of the edge pinnacles, on the Garden's own top 8 m in from its rim and off
  the pinnacles' and the Heart's feet; a path round the Heart's foot and one in from each way up.
- **The plants**: the necanyons kit (`biomes/necanyons`, read in place with its land fragment `47-host-land.js`, which
  takes this page's `LAND` hooks: the cap height, the LOD spine, the cleared ground, no creek) on the walls, ledges,
  spurs and stacks, kept off the town's ground past the 12 m rim band; the hyperjungle on the floor, kept out of the farms,
  the bands' grounds, the fair ground and the road, thin on the cleared ground (`PR.forest`).
- **Textures**: the rock and the floor are necanyons' and the hyperjungle's packs; the roosts take six of the Beast
  Riders kit's detail maps (`wood`, `timber`, `shingle`, `rope`, `straw`, `sandstone`: `kits/beast-riders/materials.json`)
  and the flyers Girder's `fly_*` and `flywing` (both packed by `build.py` from those builds' committed `tex/`). The town's
  streets and the farm tracks take the kit's `yard` (trodden earth; the fields' soil too, tinted by their crop) and its squares `sandstone`; its buildings the catalog's and the kit's
  detail maps (`KF_TEX`, beside the page in `.tex.kftex.js`) and the ports their towns' own maps (`.tex.brtowns.js`,
  `kits/beast-riders/towns.py`).

## Checks (`verify.py --assert`)

The shared invariants (registered volumes, NaN, budgets, the export profile) and the page's own (`99-host-take.js`
`hostChecks`): the mesa's height and size; ten fins, each wholly on the top 12 m from the edge, 40-90 m over it, spread
round the rim (at least five of eight sectors, no 250 m circle with more than three: the owner, 2026-10-19); the Garden
on its own mesa, tallest at the centre; the Heart (three pinnacles on it, its rise .4-.6 of theirs, weathered half as
much again as the Garden's mesa, measured against the same body cut clean); no tree on the town's ground; no forest
standing in the farms or a band's ground; the floor equal to the model's land and the Inner Wall over 2.5 km above the
knoll. The roosts (P2): a stall deck on each Wing's fin and the four Garden pinnacles and a ring on every fin, no rock
standing on any deck; every Wing's eight or more stalls, each with its way out open; four bridges, each within a group,
each end on its deck; the lifts' cables 3 m or more clear of the wall; the Stair from the top to the fair ground, no
flight steeper than 35 degrees, gated at its head and foot (owner, 2026-10-19: the middle gate, which stood in the walk, removed), and, **measured against the drawn rock by rays** (`ROCKRAY`: the rock
meshes as drawn, not KSTACKS' outline), clear and carried at every bed of the mesa it passes: every tread's walkway out
of the rock .5, 1.3 and 2.1 m over it, every cut tread's masonry and every gallery bracket meeting the rock under it,
every landing slab clear over its middle and carried, the head never over a drawn ledge; a climb to every deck, every
tread against its stack's drawn wall and clear of rock 1 m and 1.8 m over it, every bracket and every deck strut in the
rock; every gate's posts, leaves and lintel out of the drawn rock; a quetzal sent
in to the east fins lands on a perch, and in 90 s of traffic no beast aloft is in the rock; each Wing's beasts in its own
stalls; the lift road from the landing to the palisade, no steeper than 1 in 7, through no band's ground nor the pond,
nothing standing on it. The town (P3a): every building's corners and edges' middles on the mesa's own cap 12 m in from
its rim and off the rock standing on it, no two footprints overlapping (oriented boxes), none reaching a street's
carriageway, none in the Deep Root precinct or a band's ground nor within 6 m of a lift's head, the Stair's head gate or a
climb's start, each standing within 2.5 m of the cap; the hall, the shrine, each Wing's barracks, the toll house and the
beast stage; every trade the town carries with a building; 400 lots or more. The farms (P3b): six terraces of cells,
no two overlapping, every cell's corners, edges' middles and centre on farmland, off the debris slope and the tracks;
the orchards on the two outer terraces and only there; ten paddies or more, each within 300 m of the spring; twelve
farmhouses, each wholly in its cell, none overlapping; the palisade unbroken from end to end but at its gates and posts;
the forest gate on the road and the north-west gate where the lift road comes in; a track from each other gate to the
terrace way. The bands' grounds (P3c): a ground for each tribe as `BR_CAMP` has it (the flyers' only on the top, the
Dragonfly's, the Spider's and the Mammoth's only on the floor), every tent and pen it names pitched, a chief's pavilion
and a banner on each, no two overlapping, each inside its ground (on the top on the cap 12 m in and off the rock, on
no town lot or street; on the floor in its hedge), every hedge closed with its two gates and every pasture's fence with
its gate, a track from every floor camp to a palisade gate through no farm and no other band's hedge. The Deep Root
(P3d): the court 8 m deep and open, its stair open, the passage open from the court to the hall, the hall 44 by 26 m
and 15 m high with 2 m of rock or more over it, the light well open, no void open to the sky outside the openings
(KCAVERN's sky check), the cap open over the court (a ray down meets the court's floor), one niche for each of the
twelve tribes, the five lamp niches, the altar and the carved door, each piece's back in the rock and its front in the
void, twelve standing stones with nothing built inside their ring. The Garden (P3e): its stair and ramp from the main top to
its own and the stair up the Heart, each from the ground at its foot to the top, every tread against the drawn wall and
clear of rock over it, every bracket in it, the ramp no steeper than 1 in 5; its houses on its top, apart, off the
pinnacles' and the Heart's feet and the paths; six great-houses or more and a chief's compound; the path round the
Heart. Each has a negative control (the fins
in one row, a fin over the edge, a 180 m mesa, the Garden all one height, no Garden's mesa, no Heart, a Heart weathered
like the Garden's mesa, a Heart as tall as its pinnacles, a tree in the Crown, a tree in the farms; a deck cut into its
fin, a perch facing its fin, a bridge from the north fins to the east, a cable rubbing the wall, the Stair with one gate,
the Stair ending in the gorge, a deck with no climb, a quetzal sent to a lookout ring, the Stair's flights 4 m out from
the face, a climb 3 m out from its fin, an archaeopteryx in a Quetzal stall, the lift road through the seep pond, a gate sunk into the cap rock; a house on an avenue, in the Wingclaw band's ground, on the rim, two
houses on one footprint, no assembly hall, no tannery; a field on the forest road, an orchard on the first terrace, a farmhouse half off its
cell, a gap in the palisade, no forest gate, paddies by the east gate; a tent in the Crown, a gap in a thorn hedge, a hedge
with no gates, a ground without its chief, a camp's track through the farms, a flyer band camped on the floor; a court 4 m deep, a tribe's niche missing, a lamp
niche turned into its wall, a house inside the ring of stones; a great-house on a pinnacle's foot, the Garden's stair
stopping 10 m short, the ramp 3 m out from the wall, no way up the Heart).
