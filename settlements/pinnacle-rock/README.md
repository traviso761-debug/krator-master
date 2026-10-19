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
    three pinnacles stand 25 m apart). Timber joists and brackets let into the beds carry it;
  - **stalls** in Girder's frame and record shape (`ROOSTS`: the perch point 1.4 m inside the edge, open stalls 9.2 m
    deep, the lean-to with its red eave band, the perch beam 3.4 m out) wherever the edge runs straight and the way out
    is clear for 150 m (no rock within 10 m under the deck, no other deck, bridge or lift): 101, by Wing (the Wingclaw's
    on the north fins, the Quetzal's on the east, the Nightwing's on the west) and the Garden's; a **keeper's shelter**
    (feed and tack) on each stall deck in the longest stretch without stalls;
  - a **climb** to every ring: a timber stair hugging the stack from its foot (or from the deck below), 32 degrees,
    bracketed into the beds, coming up through a hatch in the deck;
  - **rope bridges** between the stall decks of each group's fins (north 54 m, east 75 m and 45 m, west 69 m);
  - **the lifts**: the beast lift down the gorge face between the Wingclaw's fins, and the capstan lift beside the Stair
    on the south nose: a trussed boom over the edge, its tip 4 m clear of the wall at every height, a cage on its cable
    (moving), a landing on the debris slope, the capstan and its rope;
  - **the Stair** down the south nose: straight down the shoulder's ledges, three flights along the face (the cut ones
    in red sandstone with a parapet, the return flight built out 3.2 m beyond them on timber brackets, so no flight
    turns under another), a path of steps down the debris slope to the fair ground, gated at its head, its middle
    landing and its foot.
- **The flyers** are Girder's (`settlements/girder/src/84*.js`, read in place and sealed with this page's world, obstacles,
  bays and circuits: `flyers/README.md`): quetzalcoatlus, giant bats, archaeopteryx and dragonflies with their riders,
  perched by Wing, coming and going on every proved bay, on the rim and Garden circuits, the patrols and the bats' night
  hunt.
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
flight steeper than 35 degrees, no tread in the rock, gated three times; a climb to every deck; a quetzal sent in to the
east fins lands on a perch, and in 90 s of traffic no beast aloft is in the rock. Each has a negative control (the fins
in one row, a fin over the edge, a 180 m mesa, the Garden all one height, no Garden's mesa, no Heart, a Heart weathered
like the Garden's mesa, a Heart as tall as its pinnacles, a tree in the Crown, a tree in the farms; a deck cut into its
fin, a perch facing its fin, a bridge from the north fins to the east, a cable rubbing the wall, the Stair with two gates,
the Stair ending in the gorge, a deck with no climb, a quetzal sent to a lookout ring).
