# World Simulation Layer: standardization plan

The roadmap this plan serves is `ROADMAP.md` in this folder. This file says what the
repo's life layers are today, what they already agree on, where they diverge, and
the order of work to bring them under one simulation vocabulary without rewriting
them. Nothing here is built yet; `core/simulation/` holds only these two documents.

Every claim about current code below comes from a read of the source in
`settlements/*/src` (and `dalab/targets/city`) on `main` as of 2 Oct 2026. Line
references are as of that commit.

---

## 0. What main settled while this plan was drafted

The survey in §1 was taken on a 1 Oct checkout. Between that and `main` on 2 Oct,
work landed that changes the plan's assumptions. Each item below is folded into
the sections that follow.

- **Godot is the engine.** `README.md` now says "write code with an eye to an
  eventual port to Godot" and "reference core modules rather than bespoke
  systems". `biomes/WORLD.md` sets the architecture: three.js generates and
  previews, Godot runs the open world. The roadmap's Unreal column is dropped
  from this plan; the Unreal adapter is not planned.
- **The export contract exists.** `ATMOS.export()` (`core/atmos/89-atmos-8-export.js`,
  contract `core/atmos/GODOT.md`), `BIO.export()` (`core/biome/42-core-export.js`,
  contract `biomes/GODOT.md`) and `KRATOR_EXPORT` (`settlements/yuni/GAME_EXPORT.md`)
  all emit one JSON object with `format`, `version` and a `convention` block
  (metres, +Y up, x east, z south, right-handed, radians about +Y). `GAME_EXPORT.md`
  already exports a per-building `nav` graph `{nodes[{id,x,y,z,lvl,tag,room?,door?}],
  edges[{a,b,kind,len}]}` and maps it to `NavigationRegion3D` and `NavigationLink3D`.
  The simulation export must be the fourth of these, in the same shape.
- **Shade is the first activity-based life layer.** `settlements/shade/src/84-host-life.js`
  (new) holds `ACTIVITIES`, `FACTIONS` with sub-factions and a `resident`/`hostile`
  flag, `JOBS` with a 24-hour schedule of activities, `PEOPLE` records
  `{id, job, faction, sub, home, transient}`, `EVENTS` as a list of activity stops
  between two ports, and `PLACES` (`44-host-layout.js:144`) as
  `{id, name, kind, poly, activities[], capacity, tags, facade?}`. It has a resolver
  (`offering(activity, x, z)`), a 1.5 m grid A*, and audits: every activity a job
  asks for is offered somewhere, hourly capacity shortfalls, reachability of every
  place and port, and the convoy routed leg by leg. Nobody walks yet
  (`KNOWN_ISSUES.md:52`). This is the roadmap's §2, §8, §20 and §21 prototyped in
  one build, and it is the shape Phase 1 lifts into core rather than designing one.
- **The interiors kit has an engine-neutral walker layer.** `kits/interiors/src/47-life.js`
  (`IX.life`): a nav over room grids with `door`, `stair` and `street` links,
  `targets()` drawn from furniture placements (seats, beds, workstations, counters,
  stoves, desks, altars), `route()`, and `walker()` whose pose is a pure function of
  time. It is the `interior` nav layer and the furniture-granularity activity slot.
- **Furniture carries a job.** `kits/catalog` adds `FURN_JOBS` (`farming fishing salt
  oil smithing milling ...`) and every culture's FK trade pieces (forge, anvil, vat,
  still) join a job. A place's `WORK` slots can be derived from the furniture inside
  it. Girder, Mav's Refuge and Locus now place catalog furniture as data
  (`53-furnish.js`, `66-locus-furnish.js`), and Girder has interiors and a
  first-person walker over a list of walk solids (`83-walk.js`), which `TODO.md`
  marks as the future collision and navigation-mesh source.
- **The lore bible fixes the faction list.** `LORE.md` §6 names every polity and its
  organizations; §10 gives each its sign and colours; §11 records who has contact
  with whom. Phase 4's faction data is generated from it, not invented per build.
  Note: the roadmap's "Hyssoukoi" are the lore's **Hykkousoi**; the "History Monks"
  are the **Monks of History** (saffron; chapterhouses at Dalab, Iziz, Locus;
  banned and hunted in Voth, which is exactly the roadmap's §5 example).
- **`TODO.md` asks for motion as a function of time.** Its "Life layer" section
  wants schedules as data (`{route, period, phase, segments}`), nav routes baked
  at build time, slot conflicts resolved offline, formations as offsets in the
  leader's tangent frame, and no integrated pursuit "unless seeded and stepped at
  a fixed rate". §4.5 below reconciles that with the roadmap's emergent behaviour.
- **The core opt-in convention is settled.** `core/lod/` is taken by 14 builds,
  `core/terrain/` and `core/biome/` by name lists in `build.py` (`CORE_TERRAIN`,
  `CORE_BIOME`), a local copy with the same name overriding. The simulation module
  is `CORE_SIM`, the same way.

---

## 1. What exists today

Eight builds have a life layer. Three biomes have fauna. Everything else is static.

| Build | Fragment(s) | Agents | Nav | Clock | Groups | Transport |
|---|---|---|---|---|---|---|
| **Voth** | `78a`–`78j`, `79a`–`79c`, `84-fauna` (≈500 KB) | ~1200 peds in one pool (ramblers, shopkeepers, quarry laborers, compound workers, monks, penitents), ordinators (posts, ring patrol, garrison, coast guard), clergy, high priest, guild workers, 90 caravans, gladiators, 100 canoes, dhows | water grid A* (`78b`), road-graph Dijkstra (`78h:70`), sample-refined straight-line ped legs (`78f:366`), separate strider grid (`79b`) | `skyHour()`, 120 s day; read by 7 populations | penitent trios, ordinator squads (lateral offsets), caravan as one rigid mesh | 12 ferries, 8 taxis, 7 river barges, pleasure barge, 9 ships on a relay, 20 strider convoys on 3 routes; ferries and striders board/alight real pedestrians via `queueCount` |
| **Mav's Refuge** | `78-life.js` (50 KB), NAV in `30-layout.js:412` | 700 peds, sentries (posts by group), 7 patrol squads + gate ramp loops, 8 gatherer squads, drill block, lift passengers, yard folk and guards, ladder climbers, handlers | `NAV {nodes,edges,adj}` with edge kinds (deck/stair/bridge/spiral/ladder/ground), cost and speed factor per kind, A* with 4-per-frame / 1.2 ms budget | `skyHour()`; `lifeActiveAt(h)` curfew curve; day windows per role | explicit squad objects `{kind, legs, li, members, timer, state}`; gatherer squads with `{sat,node,out,back}` routes and a 7-state cycle | lifts (`LIFTSIM`, not graph edges), millipede capstan |
| **Girder** | `78-life.js` (62 KB), `84-flyers.js` (90 KB), `83-walk.js` | farm workers, villagers, roost hands, handlers, sentries (posted/patrol/wall-walk); flyers with riders | same NAV contract as Mav, forked copy; walk solids for the first-person walker | `skyHour()`; home→field→market→field→home | patrol squads | beast lifts, flyers to 68 roost stalls |
| **Locus** | `84-life.js` (43 KB), ST/RG/NAV in `30-layout.js` | 170 ramblers, 56 geomancers, 12 farmers, 14 fishers, 34 merchants; 20 carts, 5 caravans; 14 boats; lizard-rider squads | `ST` street graph → `NAV` (edges carry `w`, `cls`), heap A* with `minW`; `RG` 12 m route grid with A* for water and overland riders; spatial-hash local avoidance | `skyHour()`; `cfg.hours` per kind | rider squads `{tribe, route, phase, riders}` | boats (one fisher each), carts, caravans with gate/court legs |
| **Yuni** | `84-life.js` (26 KB) | rambler 230, worker 62, academic 40, monk 34, merchant 88; 44 carts, 9 caravans | ST → NAV with `wallwalk`/`stair`/`underground` edges, `deep` flag | `skyHour()` | none | carts; caravans whose day is a data loop (`next`: yard, market, out, off-map) |
| **Shade** (new) | `84-host-life.js` (data only), `PLACES` in `44-host-layout.js` | 1,060 people as records: 12 jobs under 4 resident sub-factions plus visiting caravaneers; a dune-raider convoy event | 1.5 m terrain grid A* with grade limit, fords at a cost, building shadows | none yet (schedules are per hour; no clock drives them) | the convoy as an event | none |
| **Hexahedron (Screamers)** | `94-life.js` (11 KB) | shuttles, 10 patrols, 5 pen guards, a scripted captive party, millipede herd | none: straight lines between `SCREAM` points, one closed loop | none (`now` only) | party with per-member offsets on a fixed 210 s timeline | none |
| **Dalab** | `targets/city/95-city-life.js` (9 KB) | folk, giants + followers, farmers, priests, high priest | road-graph Dijkstra from `ROADS`; random nodes as destinations | `DSKY.hour`, static unless set; priests read it | leader + 2 followers | none |
| **Interiors kit** | `kits/interiors/src/47-life.js` | walkers as pure functions of t | room grids joined by door/stair/street links | t only | none | none |
| Biomes hyperjungle, sedesert, swbay | `*-fauna.js` | species with climate/diet tags, LOD by `BIO.eye` | parametric | `BIO.tick` | herds | — |

Iziz has scaffolding only (`LIFE_DESTS={market:[]}`, a Paths overlay) and is a
natural early consumer of the shared module.

### Lineage

Life code has moved between builds by **forking**, never by `core/` or
`--vendor-check`: Mav → Girder (same fragment names, every hash differs);
Yuni → Locus (`87-pathviz.js` byte-identical, `84-life.js` diverged); Voth's
heap and give-way avoidance were re-typed into Locus; Shade's A* is a fourth
re-typing. Nothing in `core/README.md` mentioned life until this commit. This is
the first thing to fix: the simulation core must be opt-in from `core/`, like
`core/lod/`, or it will fork a fifth time.

---

## 2. What the builds already agree on

These are the convergent patterns. They are the seed of the standard, and the
standard should be shaped so that each existing field maps onto it directly.

**Actor.** A plain object with a kind/role discriminator, a home, a destination,
a string or enum state, a state timer, a speed, and either a baked curve (Voth,
Screamers) or a node path with an edge index and distance along it (Mav, Girder,
Locus, Yuni, Dalab). Runtime-only fields (lateral offset, heading, bob, mesh
slot) sit beside the simulation fields in the same object. Shade separates the
two: `PEOPLE` records hold only the simulation fields.

| Concept | Voth | Mav / Girder | Locus / Yuni | Dalab | Screamers | Shade |
|---|---|---|---|---|---|---|
| role | flag fields (`shopkeeper:true`) or pool range | `role` enum `R_*` | `kind` + `cfg` | `kind` | `kind` + `role` | `job` |
| home | `home {x,z,ry}` | `home` node id, `homePlat` | `home` POI | `home` point (priests) | — | `home` place id |
| destination | `destDoor` | `dest` node, `wantTo` | `want` POI | goal node | `a`/`b` points | resolved per hour by `offering()` |
| state | `state` string | `st` enum `ST_*`, `stage` | `wait`/`leg`/`path` | `wait`/`path` | `kind` branch | — |
| timer | `stateT` | `timer`, `delay` | `wait` | `wait` | `wait`, `t` | — |
| group | `squad` lateral index | `squad`, `post`, `member` | squad `riders[]`, `lead` | `lead` | `off` | the convoy event |
| schedule | hour constants per population | `lifeActiveAt(h)` + windows | `cfg.hours` | 8–17 for priests | — | `JOBS[j].sched[24]` of activities |
| faction | livery colour only | role enum | `tribe` (cosmetic) | — | `tint` | `faction` + `sub`, with `resident`/`hostile` |

**Place registry.** Every build derives destinations from placed geometry and
tags, and five of them keep a registry object with a category and a capacity:

- Voth `LIFE_DOORS` `{x,z,ry,cat,cap,active,entryCount,queueCount?}`
  (`78f:41-149`); `cap` is enforced, `active` is a live reservation count.
- Locus/Yuni `POI` `{cat,x,z,r,name,doors,cap,active,entries}` (`84:36`);
  `cap`/`active` declared but never enforced.
- Shade `PLACES` `{id,name,kind,poly,activities[],capacity,tags,facade?}`: the only
  registry that advertises activities rather than one category.
- Mav `LIFE_DEST` lists by node tag and level kind (`78:266-296`); no capacity.
- Dalab buildings carry `tags.role` (`healers`, `halls`, `scribes`, `embassy`
  with `guest`) and `type` (`market/shop`, `tavern/inn`, `religious`, `farm`);
  the life layer reads none of it.
- Screamers `SCREAM` `{pairs, gates, lobby, pen, ranch, orchards, plazaFruit}`.
- Interiors `IX.life.targets()` `{room, placement, type, cells, final}`: a slot at
  one piece of furniture.

**Nav graph.** Mav, Girder, Locus, Yuni and Yuni's export share one contract:
`NAV = {nodes:[{id,x,y,z,tag,...}], edges:[{id,a,b,kind,len,...}], adj}` with
per-kind cost and speed factors and a per-frame path budget. Locus adds width
(`w`, `minW`) on edges, which is the roadmap's `clearW`. Voth has no pedestrian
graph (its road graph is used only by carts and one patrol), Dalab builds one
from `ROADS` ad hoc, and Shade uses a terrain grid. Water is a grid in both Voth
and Locus. Interiors are room grids joined by links.

**Clock.** `skyHour()` from `SKY_T` in Voth, Mav, Girder, Locus, Yuni; a static
`DSKY.hour` in Dalab; nothing in Screamers or Shade. All but Voth and Screamers
register through `TICKS.push(fn(dt, hour))`.

**Diagnostics.** `window._life` in every build (counts in Dalab, arrays
elsewhere, a `census()` in Mav, the audit object in Shade), PATHVIZ layers per
population, and the inspector contract `userData.inspectFn(instanceId)` /
`inspectLabel` / `userData.life`, plus a `REG`/`REGISTER` entry with class `life`.

---

## 3. Where they diverge from the roadmap

None of the builds has any of: factions as objects with relations, permissions,
needs, inventory, resources or stockpiles, supply routes as objects, events with
consequences, or simulation LOD tiers. Shade has factions and events as data but
nothing acts on them yet. Specific gaps, by build:

- **Voth** stores `race`, `socialClass`, `timeOfDayBehavior` on every pedestrian
  and reads none of them; `ATTRACTORS` exists and nothing reads it;
  `LIFE_HOUR_BEHAVIOR` is all null. The brief's seams (`hourNow`, `sunDir`,
  `farmerF`, `_routeFail`, `_conflicts`, `_narrow`, `clearW`) were never built.
  "Restricted areas" are a pass-through ban applied only at rambler call sites
  (`78f:218-228`); clergy and ordinators bypass it. Caravans have "no notion of
  origin vs destination, goods, or weight" (`78i:288`). Destination choice is a
  fixed category order, not a per-actor preference. ~15 literal coordinates
  (customs house, caravan spawn, ship inlet, barge spawn, pleasure-barge
  polygon, strider termini). Ships are integrated state with runtime avoidance
  and random departures, which `TODO.md` names as the thing Godot cannot
  reproduce from the clock.
- **Mav's Refuge** has the closest thing to the actor model but every count,
  hour window, post offset and the patrol platform list is a literal; the
  `'res'` platform kind and slot/room kinds (home, tavern, barracks, store) are
  ignored except `store` for gatherer homes; gatherer baskets are visual only.
- **Locus / Yuni** have places with `cap` but never enforce it; `TRIBES` are
  colours; carts and caravans carry a `load` that is only a tint; the
  caravanserai frame, gate nodes and farm positions are literals.
- **Shade** has the data and no embodiment: no clock advances the schedules, the
  convoy is routed at load rather than fired by `every_days`, and the places'
  activity lists are hand-typed rather than derived from the buildings' furniture.
- **Hexahedron** has no graph, no clock and no persistent change: the captive
  pipeline is a 210 s loop that resets. It is the "Change" testbed and
  currently demonstrates none of it. The lore now says what the change is:
  captives come back as Screamers at the next raid.
- **Dalab** is the "Capability & Knowledge" testbed and has the richest building
  tags for services (healers, halls, scribes, embassies, wealth bands) and no
  code that reads them; priest ceremony radii duplicate mound dimensions
  (`95:39-40`) instead of reading the placed mound. The lore confirms the
  services: Genepriests selling modifications in the Halls of Reformation,
  healers prized across Krator, embassies of Iziz, Voth, Yuni and the Iron
  Republic.

---

## 4. Target shape

### 4.1 Where the code lives

```
core/simulation/
    ROADMAP.md, PLAN.md, SCHEMA.md, GODOT.md   docs (SCHEMA.md and GODOT.md are Phase 1 and 7 deliverables)
    77-sim-0-core.js      SIM global, host binding, clock, seeded RNG, fixed-rate stepper, event log
    77-sim-1-world.js     factions, organizations, relations, presence/permissions
    77-sim-2-places.js    place + activity registry, slots, hours; slots derived from furniture jobs
    77-sim-3-actors.js    actor, role, schedule, group; behaviour resolution
    77-sim-4-nav.js       the NAV contract, layers, A* with budget, width; grid and graph backends
    77-sim-5-routes.js    transport routes and group routes as functions of t; supply routes
    77-sim-6-economy.js   stockpiles, production/consumption flows (Phase 5)
    77-sim-7-lod.js       tiers 0–2 (Phase 5+)
    77-sim-8-export.js    SIM.export() / SIM.download(), format 'krator-sim' (Phase 7)
    77-sim-9-debug.js     window._sim, census, audits, pathviz hooks
    world/factions.js     the world-level faction, organization and relation data, from LORE.md (Phase 4)
    test-sim.js           node unit test with negatives, like core/terrain/test-carve.js
```

Same mechanics as `core/lod/` and `core/biome/`: IIFE-scoped fragments defining
one global (`SIM`), its own PRNG, no top-level declarations, a small
`SIM.init({...})` host binding. A build opts in with `CORE_SIM = [...]` in its
`build.py`; a local file with the same name overrides, recorded in
`KNOWN_ISSUES.md`. Fragment prefix `77-` sorts after layout and before every
existing `78-`/`84-`/`94-` life fragment, so the module is defined when the
build's own life code runs. The existing life fragments stay in each build as
the **embodiment**: they read `SIM` state and drive meshes.

### 4.2 Where the data lives

Per build, world data is a JS fragment (so `build.py` concatenates it) that
declares objects into `SIM`, generated from the build's own layout at init.
Shade's `84-host-life.js` is already this file for Shade:

```
settlements/voth/src/
    76-world-factions.js     SIM.org(...) for this settlement's organizations, presence of foreign factions
    76-world-places.js       derived from PLACED/LIFE_DOORS/stalls/furniture: SIM.place(...)
    76-world-population.js   SIM.role(...), SIM.schedule(...), SIM.population(...)
    76-world-routes.js       SIM.transportRoute(...), SIM.supplyRoute(...), SIM.event(...)
```

World-level data that spans settlements (the factions themselves, their
relations, who has an embassy where) lives once, in `core/simulation/world/`,
generated from `LORE.md` §6, §10 and §11.

**Hand-edited JSON is a source too.** Each settlement may keep a `world/` folder of
JSON (`factions.json`, `places.json`, `population.json`, `routes.json`, `events.json`,
`relations.json`, the files the roadmap §25 names). `build.py` inlines them as one
fragment, `76-world-json.js`, that calls `SIM.load({...})`, so the built page stays a
single file and the build stays deterministic. Load order is fixed: the generated
fragments register what the geometry implies, then `SIM.load()` applies the JSON on
top. A JSON record with an existing `id` **overrides** the generated one field by
field (a hand-set capacity, hours, faction or activity list wins); a record with a
new `id` is **added**; a record with `"remove": true` deletes the generated one. A
JSON record that names an unknown place, faction or activity fails the build, the
same way an unresolved anchor does. Shade's hand-typed `JOBS` and `PLACES` are the
first candidates to move into `world/*.json` unchanged.

`SIM.export()` writes the merged result to `dist/<name>.sim.json` in the same record
shapes, so an export can be edited and dropped back into `world/` as the overlay:
the JSON on disk and the JSON exported are one format.

**Agents will write most of it at first.** The JSON is therefore shaped for a
Claude session working under `CLAUDE.md`'s token rules, not only for a person
tweaking a value:

- **Start from a draft, never a blank file.** `tools/sim_scaffold.py <built html>`
  runs the page headless, takes `SIM.export()` and writes `world/*.json` with every
  generated record in place. An agent edits capacities, hours, factions and
  activity lists in a file that already compiles, instead of typing ids it has to
  look up. Re-running the scaffold on an edited folder only adds records that are
  new in the geometry; it never overwrites a hand-set field.
- **One kind per file, one record per line,** sorted by `id`, so `grep -n` finds a
  place without opening the file and a diff shows one record per changed line.
  A file over ~30 KB is split by district or kind (`places-cantons.json`,
  `places-shore.json`); the loader reads every `*.json` in `world/`.
- **A `_note` field on any record** carries the reasoning (why this tavern has 12
  slots, which lore line a faction stance comes from). The loader keeps it and the
  export carries it, so the next session inherits the reasoning with the data.
- **`SCHEMA.md` is the file an agent reads before writing.** It lists every record
  kind, its fields, the valid values (the activity list, presence states, nav
  layers, `FURN_JOBS`), and one worked record of each. A field not in the schema is
  a build error naming the file, line and record, so a wrong guess is caught at
  `build.py`, not found later in a screenshot.
- **`tools/sim_check.py world/`** validates without building: schema, unknown
  references, duplicate ids, a job whose schedule asks for an activity no place
  offers, hourly capacity shortfalls (Shade's audits, run on the files). It is
  what an agent runs after each edit and what `verify.py --assert` runs on the
  built page.
- **The build hash still rules.** A JSON-only change rebuilds to a different page,
  so the census comparison, not the hash, is the check after a data edit; the plan's
  acceptance steps say which applies.

### 4.3 The vocabulary (Phase 1 defines it; this is the intended shape)

Field sets are deliberately minimal and each has a known source in an existing
build. Where Shade already has the shape, Shade's names are kept.

```
Faction      { id, name, parent, sovereign, culture, sign, colours, territory[], relations{}, policies{} }   LORE §6, §10
Organization { id, faction, kind, home(place), roles[], resident, hostile }                                   Shade FACTIONS.subs
Relation     { a, b, stance, trade, travel, settle, trust }    directional; org-level overrides faction-level; LORE §11 seeds it
Presence     { faction, settlement, status }                   NONE…EXPELLED, evaluated against the authority

Place        { id, name, kind, poly|doors[], x, z, y, ry, activities{ACT: slots}, hours, faction, org, tags, facade?, active{} }   Shade PLACES
Activity     one of the ~35 primitives in ROADMAP §26 plus a build's own (Shade: FETCH_WATER, WATER_CAMELS, HERD, PLAY)
Slot source  a furniture placement with a job (FURN_JOBS) or an IX.life target type: forge → SMITH, bed → SLEEP, counter → SELL

Role         { id, org, capabilities[], prefers[ACT], homes[kind], count, sched[24] }   Shade JOBS
Schedule     sched[24] of activities (Shade), or entries:[{start, activity}] (ROADMAP §20); soft priorities
Actor        { id, faction, org, role, home, work, sched, prefs, perms, needs{}, group, transient,
               activity, goal, task, state, stateT, nav:{layer, path, seg, u} }        Shade PEOPLE + Mav agent
Group        { id, kind, org, leader, members[], route, activity, state, timer }        Mav squads, Locus riders

NavLayer     'pedestrian' | 'road' | 'water' | 'climb' | 'animal' | 'air' | 'interior'
NAV          { nodes:[{id,x,y,z,tag,layer,...}], edges:[{id,a,b,kind,len,w,layer}] }   the Mav/Locus/GAME_EXPORT contract;
             a grid backend (Shade, Voth water, Locus RG) answers the same route() call
TransportRoute { id, layer, stops[place], period, phase, segments[[dur, ease, from, to]], capacity, faction, vehicle }   TODO.md shape
SupplyRoute    { id, origin, destination, resource, qty, freq, faction, security, status }
Event          { id, type, faction, org, from(port), to(port), stops[{activity, mins}], every_days, consequences[] }   Shade EVENTS + ROADMAP §29
Stockpile      { settlement, resource, amount, produce, consume }
```

### 4.4 Behaviour resolution

One function in `77-sim-3-actors.js`, used by every build. Shade's `offering()`
is its first version:

```
sched[hour] + needs + role.prefers       →  desired activity
SIM.placesFor(activity, actor)           →  candidates filtered by faction/presence/hours/slots
choose (distance, weight, reservation)   →  target place + slot reservation
SIM.nav.route(layer, from, to, width)    →  path, budgeted
```

The build's embodiment code then walks the path and plays the animation. If no
place offers the activity, the resolver falls through the schedule entry's
alternates and finally `SOCIALIZE`/`IDLE`/`TRAVEL`, as in ROADMAP §21. Voth's
fixed category order and Mav's probability table both become per-role
`prefers` lists with weights; Locus's `order` is already that.

### 4.5 Two kinds of state: decisions step, motion is a function of time

`TODO.md` wants every mover's pose to be a pure function of the clock, so Godot
can draw it without re-running the simulation. The roadmap wants emergent
behaviour, events and economies, which are integrated state. Both hold, split
this way:

- **Decisions** (which activity, which place, a stockpile's level, an event
  firing, a captive changing faction) are stepped by `SIM.step()` at a fixed
  rate (one step per simulated minute) from `SIM`'s own seeded RNG, never per
  render frame. Each decision is appended to an event log with its simulated
  time. The log is what the export carries and what Godot replays or continues.
- **Motion** between decisions is a function of time: a route baked at decision
  time plus a start time and a speed give `pose(t)`. Transport routes are the
  strict case: `{period, phase, segments}` with no runtime decision at all, slot
  conflicts resolved offline by a phase sweep (the Voth brief's acceptance
  checks, finally built), formations as offsets in the leader's tangent frame.
  The interiors walker already works this way and is the model.
- **The embodiment never integrates.** It evaluates `pose(t)` and draws. Local
  avoidance, where kept, is a visual offset that never feeds back into a
  decision. Voth's ships lose their runtime avoidance and random departures and
  gain a relay schedule as data, which `TODO.md` asks for by name.

---

## 5. Rules that apply to every build from now on

To be added to `README.md` under "Life/simulation layer" and enforced by a
`tools/check_life.py` lint once Phase 1 lands:

1. No world rule lives only in the embodiment. If a number decides *where* or
   *whether*, it is simulation data (`ROADMAP` §36; already the README rule).
2. Every actor has `faction`, `org`, `role` and a `sched` (a dummy one is fine)
   on day one. Shade's `PEOPLE` records are the minimum.
3. Every destination is a `Place` advertising activities and slots, derived from
   placed geometry, its tags and its furniture's jobs, never a literal
   coordinate. Semantic anchors (`'customs-house'`, `'north-inlet'`) resolve at
   init and **fail loudly** (`SIM.routeFail`) when missing.
4. Hour comes from `SIM.hour()` (the host binds it to `skyHour`). No population
   reads a sky global directly.
5. Nav is the shared `NAV` contract with a `layer` per edge; a width on every
   edge that carries wheeled or formation traffic. A grid backend is allowed
   but answers the same `route()`.
6. A mover's pose is a function of time between decisions (§4.5). Decisions step
   at a fixed seeded rate.
7. Diagnostics: `window._sim` (census, route failures, slot occupancy, hourly
   capacity audit, the event log), one PATHVIZ layer per population, the
   inspector contract on every life mesh, a `REG` entry with class `life`.
8. Deterministic: the simulation's RNG is `SIM`'s own, seeded by the host.
   Rebuild hashes must match across a refactor that changes no behaviour.
9. Everything the simulation knows is in `SIM.export()`, in the `krator-*`
   export shape, before it is drawn; the export's record shapes are the same as
   the hand-edited `world/*.json`, so either can be the source of a value.
10. Furniture the camera may not be drawing is read from its records, never
   from what is drawn (the README rule "Furniture that is not always drawn is
   data first"): records apart from the drawing, a camera-independent index
   (a committed bake plus an idle fill, fingerprinted per building), and edits
   as an overlay keyed by piece id. `slotsFromFurniture` takes those records
   (Mav's Refuge: `MIX.slots(i)`, `settlements/mavs-refuge/src/57a-interiors.js`),
   so a bed or a counter exists whether or not anyone is looking.

---

## 6. Phases

Each phase ends with every touched build rebuilt, `verify.py --assert` passing,
and a census comparison against the previous commit (`window._life.census()`
style, extended to `_sim`). Phases 2 and 3 are the proof that the vocabulary is
sufficient; nothing in 4–7 starts until both run on it.

### Phase 0: ground the plan (small)

- `core/simulation/{ROADMAP,PLAN}.md` and the `core/README.md` entry (this commit).
- Add the five-settlement dimension map to each build's README: Mav = Routine,
  Voth = Society, Locus = Mobility, Hexahedron = Change, Dalab = Capability &
  Knowledge. Note Girder (Mav fork), Yuni (Locus parent) and Shade (the data
  prototype) as carried along.
- Add the §5 rules to `README.md`.
- Record in each build's `KNOWN_ISSUES.md` the gaps listed in §3 so they stop
  being rediscovered.

### Phase 1: behavioural vocabulary (no behaviour change)

Deliverables: `SCHEMA.md`, `77-sim-0-core.js`, `77-sim-2-places.js`,
`77-sim-3-actors.js` (data and the resolver), `77-sim-4-nav.js`,
`77-sim-9-debug.js`, `test-sim.js`.

- Lift Shade's `84-host-life.js` into the module: `ACTIVITIES`, `FACTIONS`
  (as organizations), `JOBS` (as roles with `sched[24]`), `PEOPLE` (as actors),
  `PLACES` (as places), `EVENTS`, `offering()` (as the resolver), and the audits
  (unknown activities, hourly capacity shortfall, reachability) as
  `SIM.audit()`. Shade's own fragment shrinks to its data declarations and
  becomes the first consumer.
- `SIM.init({hour, onTick, ground, seed, err})` modelled on `ATMOS.init`, plus
  `SIM.step()` at a fixed simulated-minute rate (§4.5).
- Registries with validation: `faction`, `org`, `role`, `place`, `actor`,
  `group`, `transportRoute`, `event`. Each returns the object; duplicates and
  unknown references throw at build time.
- The NAV contract lifted from Mav/Locus into `77-sim-4-nav.js`: CSR adjacency,
  heap A*, cost/speed per kind, `w` per edge, per-frame budget queue, `layer`
  filter; a grid backend behind the same `route()` taking Shade's and Voth's
  water grid. Take Locus's heap and Mav's budget queue. `IX.life.nav` is the
  `interior` layer, joined at street doors.
- Place slots from furniture: a `SIM.slotsFromFurniture(placements)` that maps
  `FURN_JOBS` and `IX.life.TARGET_TYPES` to activities and counts.
- `SIM.load(json)` and the `build.py` step that inlines `settlements/<name>/world/*.json` as
  `76-world-json.js` (§4.2): override by `id`, add, `remove`, fail on unknown references.
- `tools/sim_scaffold.py` (a first `world/` from a built page's export, re-runnable without
  clobbering hand-set fields) and `tools/sim_check.py` (schema, references, Shade's audits on
  the files), with `SCHEMA.md` written so an agent can author a record from it alone.
- `SIM.census()` and `window._sim`.
- A `tools/check_life.py` lint: literal `[x, z]` pairs in life fragments
  outside a `// anchor:` comment, populations reading `skyHour` directly,
  actors without faction/org/role/sched.
- Acceptance: `core/simulation/example/` builds a 20-actor sheet (like
  `core/sockets/example/`) that runs on the module alone; Shade's `_life.OUT`
  audit numbers are unchanged when read from `_sim`.

### Phase 2: translate Voth (Society)

Voth is the hardest and proves the most. Work in the existing lettered
fragments; no regeneration.

1. **Places.** `LIFE_DOORS` becomes `SIM.place` entries. `cat` maps to
   activities: market→`BUY/SELL/SOCIALIZE`, tavern→`DRINK/EAT/SOCIALIZE`,
   temple/shrine→`WORSHIP`, guildhall→`WORK/TRAIN` (slots from the guild
   furniture), dock/strider→`BOARD`, compound/slum/manor→`SLEEP`,
   arena→`SPECTATE`. `cap`/`active` become slots. Palace and Fortress get
   places with `org: ordinators` and no civilian permission, replacing
   `LIFE_PED_CLOSED`.
2. **Organizations.** Under the Vothic Kingdom (`world/factions.js`): Temple,
   Ordinators (with the secret police as a sub-org), the four Guilds,
   Civilians, the Monastery. Liveries hang off the org (LORE §10: green and
   gold, purple, crimson and gold, grey).
3. **Actors.** The `LIFE_PEDS` pool range becomes `role` on each actor; the dead
   `race`/`socialClass` fields become live `prefs` inputs. Shopkeepers,
   laborers, compound workers and monks get `sched[24]` replacing the 6/18/22
   literals. Ordinator posts and ring patrol become `Group`s with
   `activity: GUARD|PATROL`.
4. **Nav.** Publish a pedestrian `NAV` for Voth (streets from `30c-roads.js`
   `RNODE/REDGE` plus spans, causeways and canton decks as edges with `w`).
   Keep `lifePedBuildLeg` as the fallback for off-graph legs, behind
   `SIM.nav.route`. The water grid becomes the `water` layer; the strider grid
   the `animal` layer.
5. **Transport.** Ferries, taxis, barges, ships, striders become
   `TransportRoute`s with stops as places and `{period, phase, segments}` as
   data; the ship relay's random departures become a schedule; the phase sweep
   asserts zero conflicts (`_conflicts`). Boarding goes through
   `SIM.board(route, place)` instead of each vehicle type reaching into
   `LIFE_PEDS`. Caravans become `SupplyRoute` embodiments (origin, destination,
   resource, faction, security) with `cartCount` as quantity.
6. **Anchors.** Replace the literal coordinates in §3 with named anchors
   resolved from geometry; log any that fail to `_sim.routeFail`.

Acceptance: identical build hash for steps that only re-express data; after
step 3, census parity per population within noise; after step 5, ferry and
strider `onboard` counts match the previous build over a 120 s day and
`_conflicts` is zero; `verify.py --sweep` unchanged.

### Phase 3: translate Mav's Refuge (Routine), then Girder as the fork test

1. `R_*` roles → `Role` objects under `Refuge Council` → `Refuge Guard` (Gate
   Guard, Patrol, Training Yard), `Civilians`, `Gatherers`, `Lift Crew`; the
   Beast Rider tribes from LORE §6.6 as the faction above them.
2. `lifeActiveAt(h)` and the day windows → `sched[24]` per role (`WAKE 06`,
   `WORK 07`, `EAT 12`, `DRILL 15`, `SOCIALIZE 18`, `SLEEP 22`). The curfew
   becomes the civilian schedule's `SLEEP` entry.
3. `LIFE_DEST` lists → places from node tags **and** slot/room kinds (home,
   tavern, barracks, store) and the catalog furniture now placed by
   `53-furnish.js`; `'res'` platforms get `SLEEP` slots with capacity.
   Since 2026-10-05 every lot, level room and hut has planned rooms and
   furniture as camera-independent records (`57a-interiors.js`): places and
   slots come from `MIX.slots(i)` (rule 10), each home's beds giving its
   `SLEEP` capacity.
3a. **The interiors' open issues, to address in this phase** (assessed
   2026-10-05; details in `settlements/mavs-refuge/KNOWN_ISSUES.md`):
   - walkers go inside: a resident walks from the door node through its home's
     rooms to the piece it uses (`IX.life.nav` joined at the street door, the
     `interior` layer);
   - the shared kitchens: decide communal cooking (homes without hearths, the
     level's kitchen the `COOK`/`EAT` place for its homes) or drop them;
   - the shrines: an offering table, mats, a keeper's store; a shrine keeper
     role and `WORSHIP` slots;
   - the council chamber: a dais, petitioners' benches, a records room and a
     guard post (four quarter-sector bodies between the portals), and the
     council's sittings as the `Refuge Council`'s schedule;
   - the market: each stall's goods by trade, stock held in the storehouses
     next to it, porters between them, opening hours, stalls as `SELL` places;
   - the spider nests: the handlers' stations, silk reeling into the silk
     houses and the weavers' loft, the egg nursery, the prey store and the
     handlers' bunks (after the owner's call on a fauna kit).
4. Squads, posts, drill and gatherer routes → `Group` objects; the gatherer
   cycle becomes `GATHER` at a place advertising `resource: fruit`, with the
   satellite choice derived from that instead of the 60–420 m literal.
5. Lifts → a `TransportRoute` on a `climb` layer with two stops, so a path can
   include a lift (today it cannot).
6. Girder: apply the same mapping; it must take `CORE_SIM` through `build.py`
   and drop its forked copy of the nav code. Its `83-walk.js` solids are the
   first candidate for the `interior`/`pedestrian` layers' collision export.
   Record what still drifts in its `KNOWN_ISSUES.md`.

Acceptance: `census()` per platform and per role unchanged; patrol loops and
gatherer routes identical in PATHVIZ; the Girder build consumes the core module
with zero local nav code.

### Phase 3b: Locus and Yuni (Mobility), and Shade walks

Locus is already closest to the target. Make it the mobility reference:

- `KINDS` → roles with `prefers` (its `order` lists), `cfg.hours` → `sched[24]`.
- `POI` → places; **enforce** `cap` as slots.
- `ST`/`NAV` edges get `layer: 'road'|'pedestrian'`; `RG` water and rider
  searches become `water` and `animal` layers behind `SIM.nav.route`.
- Boats, carts, caravans, rider squads → `TransportRoute`/`Group` as functions
  of t; caravans' `load` becomes a `SupplyRoute` resource; tribes become
  factions with a `VISITING` presence at the caravanserai.
- Yuni takes the same module; its `deep` edges become the `climb`/`underground`
  layers and its caravan day loop (`next`) becomes the route's `segments`.
- Shade gets a clock and an embodiment: Voth's instanced citizens
  (`78f-life-citizens.js`, the model its `KNOWN_ISSUES` names) driven by `SIM`,
  and the convoy fired by its `every_days` through `SIM.step()`.

### Phase 4: factions, presence, permissions (Hexahedron as the Change testbed)

- `core/simulation/world/factions.js` generated from `LORE.md` §6 (polities and
  their organizations), §10 (signs and colours, so liveries come from the
  faction) and §11 (contacts, embassies, chapterhouses as the first relations
  and presences). The lore's open questions stay open as `null` fields.
- `77-sim-1-world.js`: relations (directional, org-level overrides), presence
  states, `SIM.allowed(actor, place|activity)`.
- Hexahedron gets a clock, a NAV built from `SCREAM.circuit/roads/pairs`, and
  factions: Screamers → Warbands, Pen Guard; captives as a `PopulationGroup`
  with a foreign faction. The scripted 210 s party becomes a `RAID_RETURN`
  event whose consequences persist: `CAPTIVE_TAKEN` adds to the pen, and after
  a dwell `CAPTIVE_CONVERTED` moves the actor to the Screamer faction and a
  warrior role, which is what the lore says happens. This is the first event
  with a consequence that does not reset.
- The Monks of History example wired across Voth and Mav: a monk actor in Voth
  resolves `WORSHIP` to covert `RESEARCH` and avoids Ordinator patrol places
  because the presence table says `PERSECUTED`; at Dalab's and Locus's
  chapterhouses the same actor is `ESTABLISHED`.

### Phase 5: resources and supply (Dalab as Capability & Knowledge, plus LOD)

- `77-sim-6-economy.js`: stockpiles per settlement, production and consumption
  flows, `SupplyRoute` ticks. Mav's gatherers add `+N food` per completed
  `GATHER`; Voth's caravans move quantities between warehouse places; Locus's
  carts move refinery output; Shade's raider convoy trades.
- Dalab: build places from `tags.role` (healers → `HEAL`, halls → `MODIFY`,
  scribes → `RESEARCH/STUDY`, embassies → `DIPLOMACY` with `guest` faction),
  roles with `capabilities` (giants carry, priests worship, farmers farm), and
  a first `knowledge` map on actors: which places an actor believes offer an
  activity, seeded by faction and updated by visits and rumours at
  `SOCIALIZE`. An injured actor seeking `HEAL` must route to Dalab's healers
  because it *knows* of them.
- `77-sim-7-lod.js`: tier 0/1/2 state for actors beyond an embodiment radius;
  Voth's 1200 CPU pedestrians are the forcing case.

### Phase 6: player faction

- `Player` faction, an `Expedition Squad` group, a settlement founded through
  `SIM.settlement()` that registers places and enters every route and
  relation table. The North Crater example (`ROADMAP` §31) is the canonical
  test, written as a script against the example sheet before any world.

### Phase 7: export to Godot

- `77-sim-8-export.js`: `SIM.export()` and `SIM.download()`, `format:
  'krator-sim'`, the same `convention` block as the atmos and biome exports,
  carrying factions, organizations, relations, places with activities and
  slots, roles and schedules, actors (or tier-0 population counts), groups,
  NAV per layer (the `GAME_EXPORT.md` graph shape), transport routes as
  `{period, phase, segments}`, supply routes, stockpiles, events and the log.
  Written from `verify.py` to `dist/<name>.sim.json` beside the HTML, in the
  record shapes `world/*.json` uses, so it round-trips as a hand-edited overlay.
- `core/simulation/GODOT.md`, the contract: places → Godot scenes with an
  `Activities` metadata block, NAV → `NavigationRegion3D` per layer with
  `NavigationLink3D` for stairs, lifts and ferries, transport routes →
  `Path3D` plus a `PathFollow3D` driven by the clock, the decision stepper →
  one autoload running `SIM.step()` ported to GDScript, actors → the tier
  system deciding what is instanced.
- Not started until Phases 2–3 prove two builds run from the same vocabulary.
  No Unreal adapter.

---

## 7. Risks and how the plan handles them

- **Token cost.** Voth's life source is ~500 KB in 13 fragments. All Phase 2
  work is targeted edits inside sections found with `grep -n '^/\* ===='`;
  each step is one data mapping with a hash or census check, never a rewrite.
- **Determinism.** Moving RNG draws into `SIM` changes every seeded stream
  after it. Phase 1 gives `SIM` its own PRNG (as `ATMOS` and `LOD` do) so host
  streams are untouched; the first data-only steps must produce identical
  hashes.
- **Performance.** The resolver adds per-decision work. It runs in `SIM.step()`
  once per simulated minute, not per frame; the per-frame cost stays in the
  embodiment as `pose(t)`. Budget queue from Mav carries over for route
  requests.
- **Forking.** Girder, Yuni and Shade are the existing re-typings. All move to
  the `core/` module in their phase; `--vendor-check` is extended to list
  `77-sim-*` so any local override is visible.
- **Scope creep in the embodiment.** Animation, meshes, liveries and
  draw-call budgets stay in each build's existing fragments. The module never
  touches THREE except through the optional `THREE` binding for debug
  drawing.
- **Two sources of faction truth.** `LORE.md` is prose and will keep changing.
  `world/factions.js` is generated from it by a script that fails on a polity
  the lore names and the data lacks, so the two cannot drift silently.
