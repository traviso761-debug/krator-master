# Loj Twenny: the plan (2026-11-11)

The first Tungang hold (**20**), built as the worked example of **a hold on the simulation layer**, laid on the new **cavern
setting of `core/city`** (`core/city/cavern/`), not on a bespoke layout. The owner's brief (2026-11-11, through the Tungang
session): the integration base of six branches, the cavern setting, the Tungang set, the hold as a page, the hold on the sim.
The design is `kits/tungang/PLAN.md` (sections 1.2, 1.2.1, 3.2, 5, 6); this plan says what this page takes from it and where.

## 1. Where it is (settled: station 3, under the great shaft)

**The owner, 2026-11-11** (`openworld/PLAN-SETTLEMENTS.md` on `claude/openworld-sites-24defd`, question 16): "**Under the great
shaft** (station 3)". Loj Twenny grew in the Ancients' station cavern of the Twenny junction (bore km 218, model pixel 445,1266),
2,200 m of rift fill over it, the great shaft (the hot section's southern exhaust) rising from its west platform to the fells. This
replaces the first build's siting at the end of a 25 km branch (the Line plan's answer 3; the station page still calls its branch
"toward Loj Twenny": `biomes/line/stations/station/48-line-window.js`, for the Line session to rename). The branch tube in the east
wall is now the hold's own main street, the loj's way.

## 2. The hold (`src/20-lt-plan.js`, on `KCITY.cavern.lineHold`)

The frame is station 3's window (x across, east +; z along the Line, south +, z = s - 217700; y up from the invert). The station's
numbers are written in the plan (`LT.ST`) so the node test runs without the page; the page checks they are the Line's
(`station-match`).

| Part | What |
|---|---|
| The spines | station 3's east platform (the hold's side), its west platform and apron, the island, the two mezzanines (the Ancients' balconies at 7.6 m); the stairs and footbridges between them; all drawn and carved by the Line's own code |
| The decks (5.2) | +1 the quiet deck at the mezzanines' level (7.6: homes, red), 0 the Line deck (the platforms, 1.8: green), -1 the work deck (-2.7: amber). The Ancients set the upper deck 5.8 m up, not 4.5 |
| The streets | out through the station's own doors: two homes streets east off the east mezzanine (cream over red, cream over green), two west off the west mezzanine (cream over red; the old end, plain red), the work deck down a stair from the west platform's workshop door; and the branch tube east, the loj's way |
| Civic and works | the signal box in the station's signal room, the cistern and the fan house behind the east platform's doors (the station's cistern and ventilation plant), the gate across the loj's way, two carriage houses facing across it, the loj hall at its end facing back down it (the landmark), three dark beds and the bath on the work deck, the night mouth at the end of the west homes (its climb toward the shaft's hoist), the last stop at the old end |
| Stand-ins in the sim | the market on the island, the stores and the Fixers' shop in the station's own stores room and workshop, the train's stop on the east platform, the vein working at the work deck's end, the great shaft's foot (the hoist) |
| Wealth, ages (5.3) | wealth falls from the loj hall along the graph; the hold grew out from the station, so the west mezzanine's far streets are the oldest, worn and abandoned; the works, the gate, the box and the night mouth kept by edit |

64 sites (23 sets, 28 cuts, every civic and works def); every rule of the setting holds (`LT.audit()`).

## 3. The page (`build.py`, `dist/loj-twenny.html`)

**Station 3 is drawn by the Line's own code**, read in place (`biomes/line/stations`): the window (`48-line-window.js`), the
lining with its openings (85), the way's lamps and fittings (86), the trains (87: the kept train at the island, a train running
through on track 3), the works (88: the platforms, the footbridges and mezzanines, the doors, the shaft's cage, the name boards).
The page gives the names its stage gives (`scene`, `Q`, `tick`, `reportErr`, `SEC`, `CAVE_C`) and marks the doors its streets
leave by `open` (88 hangs no plate in them: the one change in the Line's files, opt-in). The rock is one KCAVERN at 0.5 m
(`src/50-lt-cavern.js`): the station's own primitives as the window has them and the hold's plan, drawn where it reaches out of the
lined station. The defs are the Tungang set drawn by `TG.tg.draw` (`src/64`, one draw a deck); the segment's train is the Line's
cars on a ride source (`src/42`, `66`); the light is KCAVELIGHT's records (`src/70`: the station's lamp code, the hold's ways, the
defs' lamps and wax light); the life is the sim with its people as figures and the count wall painted from the stocks (`src/80`);
the take is core/host with the underground pieces (`src/98`). The walk-through views follow PLAN.md 5.5 "A line loj": the night
mouth, the platform under its vault, the train, a street of homes, the dark beds, the loj hall's banner and count wall, the
loj's way, the shaft's foot, the station cut open, the last stop.

## 4. The simulation layer (`src/40-lt-sim.js`, `tests/test-lt-sim.js`)

On the isle demo's pattern (keyed settlements and economies, a trade route) and Dhelv's (a world of levels, every door a nav node):

| | |
|---|---|
| The polity | the Union (faction `tungang`), its orgs the loj (`loj20`) and the Fixers; the Fellgangs and the Travellers (their carriers) trade with it |
| The settlements | `loj-twenny` (presented), `g2` (the G2 gap station 18 km south, the porters' hold toward Ledge: abstract, books only), `icecutters` (abstract) |
| The census | the homes' beds (a set 6, a cut 2, a carriage house 8; worn half, abandoned none): 165 people; every worker on one of **three turns** (A 6-14, B 14-22, C 22-6), dealt round-robin; the bell rings each turn |
| The trades | the dark beds grow **fungus**; the vein working cuts **ore** (copper and rare earths: PLAN.md 1.2.1); **power upkeep** in wax (the lamps) and plate (the Fixers); **ice** from the Fellgangs straight down the great shaft to the hold's foot on the Travellers' backs (ore goes up); grain from Dalab; the segment's train takes ore and fungus south to the G2 gap and brings wax, plate and grain |
| The events | the Fixers' patrol (posts, fans, the stop), the Travellers' porters from the stop to the stores, **the Big Meeting** (a scheduled event: `LTS.MEETING`, day 1 at 18:00 by default: every grown member commanded to the loj hall for two hours) |
| The count wall | `LTS.countWall()`: the stocks and the hands in the hall, painted on the loj hall's wall |

**No new record kinds**: the hold uses SCHEMA.md's (settlements, places, roles, events, ports, the keyed economies, trades) and
the riding records (`SIM.rideSource`). Nothing in `core/simulation` changed, so its tests, Voth's stocks proof and the
baseline do not move.

## 5. Core adoption (README.md, "CORE MODULES ARE NOT OPTIONAL")

| Need | Module taken |
|---|---|
| Layout (a settlement on the sim takes core/city) | `core/city/cavern` (`KCITY.cavern.lineHold`): the cavern setting, new |
| Occupancy | `core/space` (`KSPACE`), through the setting |
| Placement and seeds | `core/rand` (`KRAND`): the frontage runs by (world, way, side, slot, salt); no Math.random |
| Registry | `core/tags`: every site registered before it is drawn, its furniture under it |
| Rock | `core/terrain` (`KCAVERN`, `39e` drawRock, `39h` the rock cut) |
| Walking, riding | `core/walk` (floors from the cavern, the platforms), `core/walk/frame` (`KWALKFRAME`: the cars), `95-walk-frame-host.js` |
| People, economy, trains | `core/simulation` 77 and `ride/78-81`, `core/sched` (`KSCHED` timelines), `core/clock` (`KCLOCK`) |
| Light | `core/cavelight` (`KCAVELIGHT` records and host) |
| Camera, map, cut-away, stocks | `core/host` FULL + UNDERGROUND (`KHOST.take`, the follow camera, the deck cut, the deck and line maps, KFADE), `93-host-stocks.js` |
| Buildings, furniture | `kits/tungang` (`TG`, sealed: `tungang_bundle.bundle(furniture=True, cultures=['tungang', ...])`), the catalog's Tungang pieces at 0.94 |
| Vehicles | `kits/motor-vehicles` (`KratorVehicles`: the Line's cars, the Kept variant) |

Not taken: `core/atmos` (no sky: all underground, KCAVELIGHT owns the exposure), `core/water` (no open water but the cistern and
bath pools, drawn by the kit), `core/biome` (no flora in the hold yet: the dark beds are the kit's). `tools/check_core_use.py
settlements/loj-twenny` is clean.

## 6. What Dhelv's port onto the setting will need

`core/city/cavern/PLAN.md` ("Dhelv's port"): hall and pipe carve outputs, a cover rule, the braid's crossing rule; the records
map one to one. Not this page's task.
