# Pinnacle Rock

The Beast Riders' roost town on a red sandstone mesa at the north-eastern edge of the hyperjungle (`PLAN.md`; the lore is
`LORE.md` §6.6). Built in stages (`PLAN.md` section 3). **Done: P0 and P1, the rock and the site; P2, the roosts, the
Stair, the lifts and the flyers.** The town, the Deep Root cavern, the farms and the camps are the stages to come.

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
- **The plants**: the necanyons kit (`biomes/necanyons`, read in place with its land fragment `47-host-land.js`, which
  takes this page's `LAND` hooks: the cap height, the LOD spine, the cleared ground, no creek) on the walls, ledges,
  spurs and stacks, kept off the town's ground past the 12 m rim band; the hyperjungle on the floor, kept out of the farms,
  the bands' grounds, the fair ground and the road, thin on the cleared ground (`PR.forest`).
- **Textures**: the rock and the floor are necanyons' and the hyperjungle's packs; the roosts take six of the Beast
  Riders kit's detail maps (`wood`, `timber`, `shingle`, `rope`, `straw`, `sandstone`: `kits/beast-riders/materials.json`)
  and the flyers Girder's `fly_*` and `flywing` (both packed by `build.py` from those builds' committed `tex/`).

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
nothing standing on it. Each has a negative control (the fins
in one row, a fin over the edge, a 180 m mesa, the Garden all one height, no Garden's mesa, no Heart, a Heart weathered
like the Garden's mesa, a Heart as tall as its pinnacles, a tree in the Crown, a tree in the farms; a deck cut into its
fin, a perch facing its fin, a bridge from the north fins to the east, a cable rubbing the wall, the Stair with one gate,
the Stair ending in the gorge, a deck with no climb, a quetzal sent to a lookout ring, the Stair's flights 4 m out from
the face, a climb 3 m out from its fin, an archaeopteryx in a Quetzal stall, the lift road through the seep pond, a gate sunk into the cap rock).
