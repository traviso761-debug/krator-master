# Theodiga today: the surface town (plan)

The town on the east rim beside the dam: pilgrims' services, the salvagers who take what the Dome has let fall, and the
farms of the temple estates. About 4,100 people. The arcology above the sealed levels (the Dome, the crest, the gallery and
the fin heads, about 900 people) is `BLUEPRINT.md`; this plan is the town's. The owner, 2026-11-15: "start working on the
surface city", after approving the blueprint's site sheet (`floors/T0.png`): the town on the east rim, scrap Xanadu.

## Core adoption

| Module | Taken | How |
|---|---|---|
| core/city | yes | the town is one `KCITY.create` instance: its own site, avenues, spokes and kora (steps 0-5), then core/city's steps 6-12 (civic by `near`, avenue lots, main streets, side streets, infill); records keyed by stable ids (`th.town.*`), drawn by the page |
| core/rand | yes | core/city's `rand: 'krand'`; nothing draws from a stream by position |
| core/tags | yes (the page) | every lot registered before it is drawn, as the Theodiga page already does for the Dome |
| core/space | through core/city | its overlap and occupancy |
| kits/xanadu (scrap set) | yes | the town's buildings are scrap Xanadu defs (`xa_scrap_*`); `XAK` bundled for the page (`kit_bundle.bundle(scrap=True, qiblai=True)`). The set came onto this branch by cherry-pick (the owner, 2026-11-16) |
| kits/qiblai | yes | the faith's buildings and some houses and shops are Qiblai's (`qb_*`, the owner, 2026-11-16: "we can also mix in some qiblai-style buildings"); in `XAK` beside the scrap set (`qiblai=True`). Merged from `claude/zealous-allen-0cd44d` |
| kits/crops | yes | the farms' fields: what the Xanadu vale grows by rain, picked by farm and field (as Strongbow's) |
| core/world, core/terrain | later | on the kit's page the plateau is the canyon's rock at 440 m; in the open world the ground is core/world's, and the town's frame takes it as `ground` |
| core/simulation | later | the census below becomes roles and workplaces |

## The frame and the site

- **The dam's frame** (x across the span, east +; z along the stream, the lake at -z), as the dam and the blueprint. The rim
  and the plateau stand at 440 m, the crest at 400.
- **The town's own frame** for core/city: centred on the town's middle (x 796, z 0), `u = x - 796`, `v = z`, so its raster
  (2.5 m cells, 470 m half) is centred on the origin.
- **The build zone:** the town inside the kora (x 360 to 992, z -318 to 318: the kora's west leg runs along the rim's edge at
  x 362, its north and south legs 14 m in from the plateau's ends, so no lot fits outside it) and the farm corridor along the
  Ancient line beyond it (x 992 to 1240, 42 m each side of the line: narrow enough that core/city routes no main street into
  it). The farms' fields lie behind the farms on the open plateau, off the zone, inside x 1240 and z +-326.
- **Off it:** Gate Square (the plaza at the stair's head, x 345 to 440, z -70 to 10) and the Warden's House beside it (z 12 to
  90), each with 6 m kept clear, are the town's landmarks, drawn by the page; the rim's edge and the canyon below; the heads
  of the Silt Road (x 470, z -326) and the Salvage Road (x 430, z 326), 16 m round each. All four are records
  (`landmarks`) for the page.

## The streets

| Street | Class | Where |
|---|---|---|
| Bazaar Street | avenue | from Gate Square east to the East Gate (z about -30): pilgrims arrive by the gate and walk it to the stair |
| The Ancient line | avenue | from the East Gate east across the upland fields (Xanadu's short line, to Strongbow) |
| The outer kora | avenue (a loop) | round the town (the third circuit of the Song's "thrice"), wheel shrines at its corners |
| The Salvage way | main | from Bazaar Street south (downstream) to the head of the Salvage Road down to the canyon floor's yards |
| The Silt way | main | from Bazaar Street north (upstream) to the head of the Silt Road down to the lake bed's fields |
| The cross street | main | north and south across Bazaar Street halfway to the gate |

core/city's main and side streets fill the blocks between them (no alleys: the town keeps yards behind its houses). No wall:
the East Gate is a gate house on Bazaar Street, not a curtain.

One step of the town's own runs after core/city's civic step: a 5 m margin kept round every civic building, so the main
streets routed next pass their walls at a street's width. Without it the router (2.5 m cells) brushed the serai's and a
shrine's corners by up to 2 m. This is a core/city matter, worked round here, not fixed there (its files are the city
session's): `core/city` could keep the margin itself.

## The quarters (wealth and `near`)

| Quarter | Where | Who | Built from |
|---|---|---|---|
| Gate Square and the hostels | round the square and the first stretch of Bazaar Street | the pilgrims' hostels, the rich houses, the Warden | courts, rows, the bath, a wheel shrine, the cistern pavilion, a signal tower |
| The bazaar | along Bazaar Street to the gate | shops, the wheel-makers and sound-grid printers, the offering sellers | bazaars, rows, the merchants' guildhall |
| The East Gate | at the gate | caravans on the line | the Terminus Serai, the gate, stores |
| The salvagers | downstream (south) | the guild that takes only what the Dome let fall | the salvagers' guildhall, stores, rows and houses |
| The farmers and dairies | upstream (north) | the temple estates' herdsmen and farmers, the hives | the granary, houses, silo courts |
| The poor tier | the east, toward the fields | labourers, newcomers | tank houses, hull houses, glint houses, shack rows |
| The upland farms | beyond the kora | the estates' farms and their fields | farmsteads with crop strips |

## Qiblai's buildings in the town (2026-11-16)

The town is scrap Xanadu: the salvagers' reclaimed panels and glazing on the Xanadu body. The faith's own buildings are
Qiblai's, the holy city's style, built for the temple estates as the holy city builds them: the two pilgrims' hostels and a
chorten by Gate Square, two wayside shrines along Bazaar Street, a gate temple beside the East Gate, and a wheel house at
each corner of the kora where the pilgrims turn. Among the rich (the priests' kin, the Warden's officers) a third of the houses
are Qiblai courts and rows, and among the shops a Qiblai shop row; the middle and the poor are all scrap. Qiblai's middle row
house is left out: at 9 m it fits frontage the scrap houses do not, and took a quarter of the town when it was in. The town's
own shrine by the square stays scrap. Seed 2207: 32 Qiblai houses and shops beside 387 scrap ones, and the ten civic.

## The census (about 4,100)

Each building holds the people its trade lodges (Strongbow's table: a court 14, a house 7, a row 15, a tank house 5, a
farm 11, the serai 20 ...); the census is read off the lots. The quarter a building belongs to is where it stands
(`TH_TOWN.quarterOf`); how much frontage each quarter leaves open (`VACANT`) sets its people. Targets by quarter (the test
allows 35% either way and 3,700 to 4,500 in all): the square and hostels 500, the bazaar 500, the East Gate 280, the
salvagers 1,250, the farmers and dairies 950, the poor tier 550, the farms 130. Most of the town's 4,100 live in the two
working quarters: the salvagers and the farmers are the larger part of the pilgrims' trade's labour too, and the hostels'
guests (the pilgrims) are not counted. The pilgrims at a festival are extra.

**The layout (seed 2207, with Qiblai's buildings):** 4,100 people in 445 buildings (square 452, bazaar 524, gate 248,
salvagers 1,293, farmers 1,036, poor tier 429, farms 118), nine farms with fields of grain, pulse and a root crop. The scrap
set alone gave 3,985 in 417, and five other seeds 3,877 to 4,344 with every check passing. The plan sheet is `floors/town-layout.svg`
(`node settlements/theodiga/test-th-town.js --svg settlements/theodiga/floors/town-layout.svg`).

## The bore to Stair (settled by the owner, 2026-11-16: "Yes, as written")

The owner keeps the Ancients' dead bore from Theodiga to Stair (`openworld/ANCIENT-NETWORK.md`, route
`rift.bowl.theodiga-stair`, 438 km, about 385 km bored, under the Twins and the Catch's southern wall to Stair, 1106,1442):
no trains, "a third way across, but a hard one". Its Stair end is drawn (the Catch, `catch-oasis.html`: the portal by the
spring, sealed deep inside). Theodiga's end:
- **Where it opens: in the east canyon wall at the canyon floor, at the foot of the Salvage Road beside the salvage yards**
  (`42-th-works`), heading east-north-east toward Stair. The Ancients' lines run at the canyon floor (the Rift line comes up it
  from the Pile and on to Strongbow), so the bore is a branch off that line, not a door in the arcology. The yards' track runs
  on into the portal, and the Salvage Road is the only way up from it: whoever comes out of the dark climbs past the yards.
- **Open on Theodiga's side, gated.** A scrap gatehouse a few hundred metres in, where the licence is checked. The first
  stretch is stripped and hung with lamps. Beyond that it is dark. The seal is at the Stair end, as the Catch plan settled.
- **The Rare Devisers work it.** They hold the royal licence in scrap and rare artifacts, so the bore and what lies in it are
  theirs. The Salvagers' rule is that they take only what the Dome lets fall, and the bore is not the Dome's, so they may not
  work it. Salvagers still hire on as haulers and lamp-men, which keeps the two guilds in friction. The Devisers' guild house
  stands at the portal: a lodge with its stores and assay hall, beside the yards. Their town house goes in the bazaar.
- On the page (T-town-6, done 2026-11-16): see Order of work, item 5.

## Order of work

1. **T-town-1, the layout** (done 2026-11-16): `src/40-th-town.js` (`TH_TOWN.make`, [G data] records on core/city) and
   `test-th-town.js` (no overlaps, nothing on a street, nothing on the landmarks, the road heads or off the plateau, the
   census by quarter, the farms beyond the kora with their fields, the civic buildings, the scrap set's keys, the same
   twice), each check with a negative (`tools/ktest.js`).
2. **T-town-2, the page** (done 2026-11-16): `python3 tools/build.py kits/ancients --target theodiga-today` writes
   `kits/ancients/dist/theodiga-today.html` (1.7 MB; the Xanadu and Qiblai packs are sidecars beside it): the ruined dam, the
   Dome and the water as `--target theodiga` draws them, and the town, drawn by `src/8ay1-th-town.js` from core/city's records
   (`THCITY`) with the scrap set and Qiblai's buildings (`XAK`). The ruin's east plateau is drawn on the town's ground
   (`TH_TOWN.ground`). `verify.py dist/theodiga-today.html --assert --all-views` (GPU) passes: 438 buildings, 4,033 people
   (the page's ground, a little more relief than the test's), every one registered and found, core/ruins clean. Views: the
   overview, Gate Square, Bazaar Street, the East Gate, a kora corner, the farms, the town from the Dome, and the ruin's.
   `kits/ancients/KNOWN_ISSUES.md` lists what it lacks.
3. **T-town-3** (done 2026-11-16): Gate Square paved and the Warden's House (a scrap court) and the kora's wheel houses came with
   T-town-2; the ways down are `src/41-th-descent.js` (`TH_DESCENT`, [G data]: a cliff path of switchback legs in two lanes,
   landings across both at the turns, every run set off the wall as drawn, the turn's wall held near a turn so two legs never
   meet) and `src/8ay2-th-descent.js` (drawn as masonry: the bed, a body back to the rock, parapets, corbels, landings):
   - **the Stair of Descent**: a stair-block on the crest's east end (x 300, z 3 to 29) running into the cliff, its top the
     rim's height joining Gate Square; five flights on its west face, 210 steps of 0.19 m on 0.4 m, 440 m to the crest at 400;
   - **the Salvage Road**: from its head (x 430, z 326) to the rim, then nine legs between z 210 (clear of the dam's toe) and
     570, 2.9 km at 15 %, down to the canyon floor at z 390;
   - **the Silt Road**: from its head (x 470, z -326), four legs between z -130 and -580, 1.6 km at 10 %, to the silt flats at
     z -160 (276 m on the page; a landing at the water instead where the silt is under it).
   `test-th-descent.js` (13 checks with negatives, on a cliff of the page's kind): grades, ends, no leg in another's way,
   every run on its wall, within its bounds, the block into the cliff. The page's views: 'The Stair of Descent', 'The Salvage
   Road', 'The Silt Road'. Owed: the salvage yards at the road's foot, the fields on the silt, the ways' textures.
4. **T-town-4, the works below** (done 2026-11-16; on the page: 13 yard buildings, 11 heaps, a 456 m track, 39 field strips,
   3 huts; views 'The salvage yards', 'The silt fields'; `test-th-works.js` 14 checks): where the two roads lead. `src/42-th-works.js` (`TH_WORKS`, [G data], KRAND by
   cell and index) lays out, from the page's own grounds (the canyon floor, the silt, the river, the dam's upstream face):
   - **the salvage yards** on the canyon floor at the Salvage Road's foot, east of the river and clear of the dam's toe: a yard
     track west from the road's foot, scrap stores, sheds and hull huts along it (the scrap set's), and the salvage between
     them as core/terrain `KRUBBLE` heaps of the Dome's fallen white panels;
   - **the silt fields** on the silt the drawn-down lake left above its water, upstream of the dam's east half (clear of the
     dam's arched face and of the Dome's piers): strips of grain, pulse and a root crop (kits/crops, the Xanadu vale), with
     field huts at the Silt Road's foot.
   Workplaces: their people are counted in the town above. The ways are textured with the library's dressed ashlar (Qiblai's
   pack, `stone.sandstone.ashlar`). `test-th-works.js` checks them on grounds of the page's kind.
5. **T-town-6, the bore to Stair** (done 2026-11-16; the section above):
   - **The records.** `TH_WORKS.make(o)` takes `o.bore` (the headwall's front, back and the bore's axis, which the page reads off
     the drawn wall) and returns `bore`:
     - the mouth (radius 6.5 m, drawn 90 m deep);
     - the spur on from the road's foot along the wall's foot and into the bore;
     - nine lamps down the first stretch;
     - the Devisers' licence gate across the bore at 72 m (the plan said a few hundred metres in; the gate stands at the drawn
       stretch's end);
     - the Rare Devisers' lodge (a Lantern House), their stores and assay hall, and the haulers' row, on the floor beside the
       mouth with their fronts on the spur.
   - **The rock.** `targets/theodiga/77-dam.js` leaves the east wall's two grid columns and rows at the mouth open (z 468 to 490,
     0 to 23 m) and keeps the talus out of it, both only with the town on the page.
   - **The drawing.** `src/8ay3-th-works.js` draws:
     - the Ancients' headwall in their concrete round the hole, with a collar round the arch;
     - the lined bore, its deck, the dark beyond;
     - the corrugated gate with its door;
     - the lamps.
   - **The checks.** `test-th-works.js` (20 checks): the spur from the foot into the bore short of the gate, the Devisers'
     buildings by the mouth off the spur, the lamps before the gate. View 'The bore to Stair'.
6. **T-life-1 and T-works-2, people, lamps and the works' gear** (done 2026-11-16).
   - **The people.** `src/45-th-life.js` (`TH_LIFE`, [G data], KRAND by place and slot) puts people out:
     - townsfolk along the streets, about one figure for every 25 of the census;
     - pilgrims on Gate Square, on the Stair of Descent and the roads, on the middle kora and on the Dome's deck (off its
       pavilions and the Tear);
     - salvagers in the yards, farmers in the fields, the Rare Devisers and their haulers at the bore.
     None stands inside a building.
   - **The lamps.** A post every 30 m on a street's sides, at Gate Square's corners, along the kora and at the bore.
   - **The drawing.** `src/8ay5-th-life.js` draws the kit's figures robed by role, and the lamps with a glow at night, six
     night lights and the scrap set's windows lit after dark. These are the town's own instances (`thInst`), so core/ruins
     does not take them for the dam's wreckage.
   - **The works' gear.** `TH_WORKS` adds the derricks over the two biggest heaps, handcarts on the track, and the fields'
     channels between their columns of strips (short of the huts). `test-th-life.js` runs 12 checks; `test-th-works.js` 26.
     The views are 'Pilgrims on Gate Square' and 'The town at night'.
7. **T-town-7, the town's interiors** (done 2026-11-16, the owner: "Town interiors").
   - **The plans.** `src/46-th-town-rooms.js` (`TH_TOWN_ROOMS`, [G data]) gives every scrap building the town placed its rooms
     from the Scrap Xanadu set (`kits/interiors/sets/xanadu-scrap.js`, `IX.sets.instantiate`). Each kind is planned once
     unturned at the origin, furnished once, then turned and raised onto every plot. The buildings are gathered into one site
     a quarter, in kits/ancients-interiors' plan shape.
   - **The host.** `src/8zz2-th-town-rooms.js` makes each quarter a site of the kit's cut-away (the select "Interior",
     `[` `]`, `x`). The furniture is records at load, tagged in core/tags with every building and room. Partitions, linings
     and floors are drawn with the furniture when a quarter is opened, one quarter at a time.
   - **The Panel Row's kitchens** are too narrow for a hearth and are furnished as stores (KNOWN_ISSUES).
   - **The checks.** `test-th-town-rooms.js` runs 13. Every room lies inside its building as placed; every storey stands at
     its plot's base; a building's street door is its own turned onto the plot; a piece lands in its room; one plan a kind;
     the quarters' boxes hold their buildings. The views are 'Inside the bazaar' and 'Inside the poor tier'.
8. **T-sim-1, the census on core/simulation** (done 2026-11-16, the owner: "Census on the sim").
   - **The declaration.** `src/47-th-sim.js` (`TH_SIM`, [G data]) declares Theodiga to core/simulation at the record level
     (SCHEMA.md; Longsong's and Dhelv's are the worked examples). It is a settlement 'theodiga' of the Xanadu Sultanate, with
     the faith of the Decree and the Order of Historians as factions.
   - **The places.** A home is each building with people, its census people its beds. The work places are the town's
     buildings by what they are, the yards, the fields, the bore and its lodge, and the kora. The arcology's units are taken
     by program: its homes' beds are the blueprint's people by area, spread by floor area.
   - **The roles.** There is one role a quarter, its count the census's. The arcology has six, by the blueprint. Then come
     the Rare Devisers, and the pilgrims, as many as the hostels sleep.
   - **The residents.** `SIM.populate` deals them to homes and posts. Every place's slots are counted from the workers sent
     there.
   - **The host.** `8ay1-th-town.js` declares it once, after the town is drawn (`window._thTown.sim`). kits/ancients/build.py
     reads core/simulation in place (`TH_SIM_FILES`, Longsong's set).
   - **The checks.** `test-th-sim.js` runs 11, each case in a fresh sim. Every resident has a home; each quarter's role is the
     census's; the arcology's people are the blueprint's in their areas; every job is of its role's kinds; no hour is short
     of places; the same twice.
9. **T-sim-2, the census walking** (done 2026-11-16, the owner: "Yes, make them walk").
   - **The walk graph.** `src/48-th-walk.js` (`TH_WALK`, [G data]) builds core/simulation's pedestrian layer from the drawn
     geometry:
     - the streets resampled every 6 m on the town's ground and joined where they meet, and Gate Square a grid;
     - the three ways down the wall, their heads to the town and their feet to the kora, the yards and the fields;
     - the yard track and the bore's spur, and the silt fields as a tree from the Silt Road's foot;
     - the kora, the Pilgrims' Stairs flight by flight, and the deck a grid clear of its pavilions, wells, hall and Tear;
     - a node at every storey of the arcology's units, their 400 m storey joined to the kora.

     A last pass stitches any part left apart to the main one at their nearest pair. `TH_SIM.declare` puts every place's
     door on it.
   - **The walkers.** `src/8ay9-th-walkers.js` steps the sim a world minute at a time on the page's clock (core/clock's
     72-minute day, from 07:00). It draws `SIM.pose` for every resident out of doors, robed by role. The static figures
     (T-life-1) stand down; their lamps stay.
   - **The checks.** `test-th-walk.js` runs 11. The graph is one piece; no edge leaps; the street nodes are on the ground; no
     deck node is in a pavilion, well, hall or the Tear; a door is joined near itself; the same twice.
   - **Next.** A walk cycle and activity poses, and indoor residents shown in the opened rooms.
10. **T-econ-1, the economy** (done 2026-11-16, the owner: "Yes, the economy").
    - **The economy.** `src/49-th-econ.js` (`TH_ECON`, [G data]) gives the settlement its own economy on core/simulation
      (keyed by settlement; the isle demo's 44 and 43 are the worked examples):
      - **the goods:** grain, pulse and tubers from the fields, each its crop; milk from the dairies and honey from the hives
        (the farmsteads by turns); bread from the arcology's kitchens in batches of grain; salvage from the yards, drawn from
        the Dome's fall (a site of 60,000 lots that runs down); artifacts from the bore (a site with no end);
      - **the stores:** the storehouses, granaries and serai are the warehouses, opened with three days of the town's meals;
        16 carters haul the makers' stores to them;
      - **the table:** a household buys its food at the bazaar's stalls; the arcology's homes, the hostels and the Devisers'
        lodge are messes; the hostels sell a meal out.
    - **The yields are sized to the people.** Each food has a share of the diet. Each kind of maker gets the rate that, with
      the workers the census dealt it, makes its food's share of the town's meals and 12% more (the bread's grain on the
      grain fields).
    - **The checks.** `test-th-econ.js` runs 10, a week at the abstract level each. The books balance (core's ledger); the
      town feeds itself; every maker makes; the Dome's fall runs down by what was taken; the carters are there.
    - **Next.** The caravans (the serai's trade by the East Gate road: salvage and artifacts out, what the canyon lacks in),
      money, tools and clothes, and the Lamp Hall's butter.
11. **Later**: the Qiblai buildings' rooms (as Strongbow's), core/simulation's roles, the open world.
