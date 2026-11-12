# Loj Twenny: the plan (2026-11-11)

The first Tungang hold (**20**), built as the worked example of **a hold on the simulation layer**, laid on the new **cavern
setting of `core/city`** (`core/city/cavern/`), not on a bespoke layout. The owner's brief (2026-11-11, through the Tungang
session): the integration base of six branches, the cavern setting, the Tungang set, the hold as a page, the hold on the sim.
The design is `kits/tungang/PLAN.md` (sections 1.2, 1.2.1, 3.2, 5, 6); this plan says what this page takes from it and where.

## 1. Where it is (a design fork, settled provisionally)

`kits/tungang/PLAN.md` (lines 255-265, 330-335, 395-405) puts Loj Twenny "on `tube_rift_08`" under the 2.2 km great shaft by
the Twenny junction; **the owner's later answer on the Line plan** (`biomes/line/PLAN.md` answer 3, line 24: "Loj Twenny: by a 25
km side tunnel from the Twenny junction (km 218)"; and its section 2.1: `tube_rift_08` is 300 km off) puts it 25 km east of the
junction, a cavern loj in the rift fill at model pixel 457,1269. The two disagree on whether the hold's spine is station 3 itself.
This page takes **the owner's later answer**: the hold sits at the far end of the 25 km branch, its spine the branch's **kept
terminus** (two tracks between two side platforms), the branch shuttle running in from the junction on the Line's own cars, and
riding works on it. The great shaft stays at the junction (the Ice-cutters' ice comes down it to the junction, then up the
branch). The question went to the coordinating session (2026-11-11) and has no answer yet; **switching to station 3 as the
spine is cheap**: the plan's spine is one record (`LT.spec`'s `spine` and `spines`), the rest of the hold hangs off it.

## 2. The hold (`src/20-lt-plan.js`, on `KCITY.cavern.lineHold`)

| Part | What |
|---|---|
| The terminus hall | 157 x 22 m under a flattened vault (10.5 m), two guideways (z -2.6, +2.6), side platforms at the car floor (1.8 m), the concourse across the buffers' end; the branch gallery in from the west |
| The decks (5.2) | +1 the quiet deck (y 6.3: homes, red), 0 the Line deck (y 1.8: public, green), -1 the work deck (y -2.7: amber) |
| The sidings (streets) | north: `lt.n1` homes up a ramp (cream over red), `lt.n2` the carriage siding (Line deck), `lt.n3` homes up a stair (cream over green); south: `lt.s1` the work deck down a stair (plain red), `lt.s2` the old siding of the last stop, `lt.s3` homes up a ramp |
| Civic, by hand | the doors across the hall's mouth, the signal box by them, the loj hall at the buffers' end facing down the hall (the landmark), two carriage houses facing across their siding, the works (three dark beds, the cistern, the fan house, the bath), the last stop at its siding's end, the night mouth climbing from the end of the east homes |
| Frontage runs | the sets and cuts along every homes siding, cuts at the old end |
| Wealth | 1 at the loj hall's end falling along the graph over 260 m (Dhelv's rule) |
| Ages (5.3) | the hold moved east with its heat: past 160 m along the graph worn, past 212 abandoned (the west homes); the works, the doors and the box kept by edit (deltas by id) |

67 sites (22 sets, 32 cuts, every civic and works def); every rule of the setting holds (`LT.audit()`).

## 3. The page (`build.py`, `dist/loj-twenny.html`)

The rock is one KCAVERN carved from the plan (`src/50-lt-cavern.js`); the defs are the Tungang set drawn by `TG.tg.draw`
(`src/64-lt-hold.js`, one draw a deck); the shuttle is the Line's cars posed by the ride source (`src/42`, `66`); the light is
KCAVELIGHT's records (`src/70`); the life is the sim with its people as figures and the count wall painted from the stocks
(`src/80`); the take is core/host with the underground pieces (`src/98`). The walk-through views follow PLAN.md 5.5 "A line
loj": the night mouth, the platform under its vault, the shuttle, a siding of homes, the dark beds, the loj hall's banner and
count wall, the doors, the hold cut open.

## 4. The simulation layer (`src/40-lt-sim.js`, `tests/test-lt-sim.js`)

On the isle demo's pattern (keyed settlements and economies, a trade route) and Dhelv's (a world of levels, every door a nav node):

| | |
|---|---|
| The polity | the Union (faction `tungang`), its orgs the loj (`loj20`) and the Fixers; the Fellgangs and the Travellers (their carriers) trade with it |
| The settlements | `loj-twenny` (presented), `twenny-junction` (station 3: abstract, books only), `icecutters` (abstract) |
| The census | the homes' beds (a set 6, a cut 2, a carriage house 8; worn half, abandoned none): 165 people; every worker on one of **three turns** (A 6-14, B 14-22, C 22-6), dealt round-robin; the bell rings each turn |
| The trades | the dark beds grow **fungus**; the vein working cuts **ore** (copper and rare earths: PLAN.md 1.2.1); **power upkeep** in wax (the lamps) and plate (the Fixers); **ice** from the Fellgangs down the great shaft on the Travellers' backs; grain from Dalab; the branch shuttle takes ore and fungus west and brings wax, plate, grain and ice |
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
