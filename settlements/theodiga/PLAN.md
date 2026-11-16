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
| kits/xanadu (scrap set) | yes | every building is a scrap Xanadu def (`xa_scrap_*`); `XAK` bundled for the page. **Not on main yet** (branch `claude/scrap-xanadu`): the layout runs on the set's boxes (`scrap-dims.json`, a copy until it lands) |
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

## The census (about 4,100)

Each building holds the people its trade lodges (Strongbow's table: a court 14, a house 7, a row 15, a tank house 5, a
farm 11, the serai 20 ...); the census is read off the lots. The quarter a building belongs to is where it stands
(`TH_TOWN.quarterOf`); how much frontage each quarter leaves open (`VACANT`) sets its people. Targets by quarter (the test
allows 35% either way and 3,700 to 4,500 in all): the square and hostels 500, the bazaar 500, the East Gate 280, the
salvagers 1,250, the farmers and dairies 950, the poor tier 550, the farms 130. Most of the town's 4,100 live in the two
working quarters: the salvagers and the farmers are the larger part of the pilgrims' trade's labour too, and the hostels'
guests (the pilgrims) are not counted. The pilgrims at a festival are extra.

**The first layout (seed 2207):** 3,985 people in 417 buildings (square 487, bazaar 563, gate 239, salvagers 1,185,
farmers 982, poor tier 405, farms 124), ten farms with fields of grain, pulse and a root crop; five other seeds give 3,877
to 4,344 with every check passing. The plan sheet is `floors/town-layout.svg`
(`node settlements/theodiga/test-th-town.js --svg settlements/theodiga/floors/town-layout.svg`).

## Order of work

1. **T-town-1, the layout** (done 2026-11-16): `src/40-th-town.js` (`TH_TOWN.make`, [G data] records on core/city) and
   `test-th-town.js` (no overlaps, nothing on a street, nothing on the landmarks, the road heads or off the plateau, the
   census by quarter, the farms beyond the kora with their fields, the civic buildings, the scrap set's keys, the same
   twice), each check with a negative (`tools/ktest.js`).
2. **T-town-2, the page**: a `kits/ancients` target `theodiga-today` (the ruined dam, the Dome, the water, and the town),
   reading `settlements/theodiga/src` in place, with core/city and the scrap set bundled. Needs the scrap set on main
   (or this branch merged with it): the owner decides.
3. **T-town-3**: the Stair of Descent, Gate Square and the Warden's House drawn; the Salvage and Silt roads down the canyon
   walls; the outer kora's wheel shrines.
4. **Later**: the town's interiors (as Strongbow's), core/simulation's roles, the open world.
