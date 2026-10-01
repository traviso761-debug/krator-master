# World Simulation Layer: standardization plan

The roadmap this plan serves is `ROADMAP.md` in this folder. This file says what the
repo's life layers are today, what they already agree on, where they diverge, and
the order of work to bring them under one simulation vocabulary without rewriting
them. Nothing here is built yet; `core/simulation/` holds only these two documents.

Every claim about current code below comes from a read of the source in
`settlements/*/src` (and `dalab/targets/city`). Line references are as of the
commit this file was added in.

---

## 1. What exists today

Seven builds have a life layer. Three biomes have fauna. Everything else is static.

| Build | Fragment(s) | Agents | Nav | Clock | Groups | Transport |
|---|---|---|---|---|---|---|
| **Voth** | `78a`–`78j`, `79a`–`79c`, `84-fauna` (≈500 KB) | ~1200 peds in one pool (ramblers, shopkeepers, quarry laborers, compound workers, monks, penitents), ordinators (posts, ring patrol, garrison, coast guard), clergy, high priest, guild workers, 90 caravans, gladiators, 100 canoes, dhows | water grid A* (`78b`), road-graph Dijkstra (`78h:70`), sample-refined straight-line ped legs (`78f:366`), separate strider grid (`79b`) | `skyHour()`, 120 s day; read by 7 populations | penitent trios, ordinator squads (lateral offsets), caravan as one rigid mesh | 12 ferries, 8 taxis, 7 river barges, pleasure barge, 9 ships on a relay, 20 strider convoys on 3 routes; ferries and striders board/alight real pedestrians via `queueCount` |
| **Mav's Refuge** | `78-life.js` (50 KB), NAV in `30-layout.js:412` | 700 peds, sentries (posts by group), 7 patrol squads + gate ramp loops, 8 gatherer squads, drill block, lift passengers, yard folk and guards, ladder climbers, handlers | `NAV {nodes,edges,adj}` with edge kinds (deck/stair/bridge/spiral/ladder/ground), cost and speed factor per kind, A* with 4-per-frame / 1.2 ms budget | `skyHour()`; `lifeActiveAt(h)` curfew curve; day windows per role | explicit squad objects `{kind, legs, li, members, timer, state}`; gatherer squads with `{sat,node,out,back}` routes and a 7-state cycle | lifts (`LIFTSIM`, not graph edges), millipede capstan |
| **Girder** | `78-life.js` (62 KB), `84-flyers.js` (90 KB) | farm workers, villagers, roost hands, handlers, sentries (posted/patrol/wall-walk); flyers with riders | same NAV contract as Mav, forked copy | `skyHour()`; home→field→market→field→home | patrol squads | beast lifts, flyers to 68 roost stalls |
| **Locus** | `84-life.js` (43 KB), ST/RG/NAV in `30-layout.js` | 170 ramblers, 56 geomancers, 12 farmers, 14 fishers, 34 merchants; 20 carts, 5 caravans; 14 boats; lizard-rider squads | `ST` street graph → `NAV` (edges carry `w`, `cls`), heap A* with `minW`; `RG` 12 m route grid with A* for water and overland riders; spatial-hash local avoidance | `skyHour()`; `cfg.hours` per kind | rider squads `{tribe, route, phase, riders}` | boats (one fisher each), carts, caravans with gate/court legs |
| **Yuni** | `84-life.js` (26 KB) | rambler 230, worker 62, academic 40, monk 34, merchant 88; 44 carts, 9 caravans | ST → NAV with `wallwalk`/`stair`/`underground` edges, `deep` flag | `skyHour()` | none | carts, caravans |
| **Hexahedron (Screamers)** | `94-life.js` (11 KB) | shuttles, 10 patrols, 5 pen guards, a scripted captive party, millipede herd | none: straight lines between `SCREAM` points, one closed loop | none (`now` only) | party with per-member offsets on a fixed 210 s timeline | none |
| **Dalab** | `targets/city/95-city-life.js` (9 KB) | folk, giants + followers, farmers, priests, high priest | road-graph Dijkstra from `ROADS`; random nodes as destinations | `DSKY.hour`, static unless set; priests read it | leader + 2 followers | none |
| Biomes hyperjungle, sedesert, swbay | `*-fauna.js` | species with climate/diet tags, LOD by `BIO.eye` | parametric | `BIO.tick` | herds | — |

Iziz has scaffolding only (`LIFE_DESTS={market:[]}`, a Paths overlay) and is the
natural first *new* consumer of the shared module.

### Lineage

Life code has moved between builds by **forking**, never by `core/` or
`--vendor-check`: Mav → Girder (same fragment names, every hash differs);
Yuni → Locus (`87-pathviz.js` byte-identical, `84-life.js` diverged); Voth's
heap and give-way avoidance were re-typed into Locus. Nothing in `core/README.md`
mentions life. This is the first thing to fix: the simulation core must be
opt-in from `core/`, like `core/atmos/`, or it will fork again.

---

## 2. What the builds already agree on

These are the convergent patterns. They are the seed of the standard, and the
standard should be shaped so that each existing field maps onto it directly.

**Actor.** A plain object with a kind/role discriminator, a home, a destination,
a string or enum state, a state timer, a speed, and either a baked curve (Voth,
Screamers) or a node path with an edge index and distance along it (Mav, Girder,
Locus, Yuni, Dalab). Runtime-only fields (lateral offset, heading, bob, mesh
slot) sit beside the simulation fields in the same object.

| Concept | Voth | Mav / Girder | Locus / Yuni | Dalab | Screamers |
|---|---|---|---|---|---|
| role | flag fields (`shopkeeper:true`) or pool range | `role` enum `R_*` | `kind` + `cfg` | `kind` | `kind` + `role` |
| home | `home {x,z,ry}` | `home` node id, `homePlat` | `home` POI | `home` point (priests) | — |
| destination | `destDoor` | `dest` node, `wantTo` | `want` POI | goal node | `a`/`b` points |
| state | `state` string | `st` enum `ST_*`, `stage` | `wait`/`leg`/`path` | `wait`/`path` | `kind` branch |
| timer | `stateT` | `timer`, `delay` | `wait` | `wait` | `wait`, `t` |
| group | `squad` lateral index | `squad`, `post`, `member` | squad `riders[]`, `lead` | `lead` | `off` |
| schedule | hour constants per population | `lifeActiveAt(h)` + windows | `cfg.hours` | 8–17 for priests | — |
| faction | livery colour only | role enum | `tribe` (cosmetic) | — | `tint` |

**Place registry.** Every build derives destinations from placed geometry and
tags, and four of them keep a registry object with a category and a capacity:

- Voth `LIFE_DOORS` `{x,z,ry,cat,cap,active,entryCount,queueCount?}`
  (`78f:41-149`); `cap` is enforced, `active` is a live reservation count.
- Locus/Yuni `POI` `{cat,x,z,r,name,doors,cap,active,entries}` (`84:36`);
  `cap`/`active` declared but never enforced.
- Mav `LIFE_DEST` lists by node tag and level kind (`78:266-296`); no capacity.
- Dalab buildings carry `tags.role` (`healers`, `halls`, `scribes`, `embassy`
  with `guest`) and `type` (`market/shop`, `tavern/inn`, `religious`, `farm`);
  the life layer reads none of it.
- Screamers `SCREAM` `{pairs, gates, lobby, pen, ranch, orchards, plazaFruit}`.

**Nav graph.** Mav, Girder, Locus and Yuni share one contract:
`NAV = {nodes:[{id,x,y,z,tag,...}], edges:[{id,a,b,kind,len,...}], adj}` with
per-kind cost and speed factors and a per-frame path budget. Locus adds width
(`w`, `minW`) on edges, which is the roadmap's `clearW`. Voth has no pedestrian
graph (its road graph is used only by carts and one patrol) and Dalab builds one
from `ROADS` ad hoc. Water is a grid in both Voth and Locus.

**Clock.** `skyHour()` from `SKY_T` in Voth, Mav, Girder, Locus, Yuni; a static
`DSKY.hour` in Dalab; nothing in Screamers. All but Voth and Screamers register
through `TICKS.push(fn(dt, hour))`.

**Diagnostics.** `window._life` in every build (counts in Dalab, arrays
elsewhere, a `census()` in Mav), PATHVIZ layers per population, and the
inspector contract `userData.inspectFn(instanceId)` / `inspectLabel` /
`userData.life`, plus a `REG`/`REGISTER` entry with class `life`.

---

## 3. Where they diverge from the roadmap

None of the builds has any of: factions as objects, organizations, permissions,
needs, inventory, resources or stockpiles, supply routes as objects, events,
relationships, or simulation LOD tiers. Specific gaps, by build:

- **Voth** stores `race`, `socialClass`, `timeOfDayBehavior` on every pedestrian
  and reads none of them; `ATTRACTORS` exists and nothing reads it;
  `LIFE_HOUR_BEHAVIOR` is all null. The brief's seams (`hourNow`, `sunDir`,
  `farmerF`, `_routeFail`, `_conflicts`, `_narrow`, `clearW`) were never built.
  "Restricted areas" are a pass-through ban applied only at rambler call sites
  (`78f:218-228`); clergy and ordinators bypass it. Caravans have "no notion of
  origin vs destination, goods, or weight" (`78i:288`). Destination choice is a
  fixed category order, not a per-actor preference. ~15 literal coordinates
  (customs house, caravan spawn, ship inlet, barge spawn, pleasure-barge
  polygon, strider termini).
- **Mav's Refuge** has the closest thing to the actor model but every count,
  hour window, post offset and the patrol platform list is a literal; the
  `'res'` platform kind and slot/room kinds (home, tavern, barracks, store) are
  ignored except `store` for gatherer homes; gatherer baskets are visual only.
- **Locus / Yuni** have places with `cap` but never enforce it; `TRIBES` are
  colours; carts and caravans carry a `load` that is only a tint; the
  caravanserai frame, gate nodes and farm positions are literals.
- **Hexahedron** has no graph, no clock and no persistent change: the captive
  pipeline is a 210 s loop that resets. It is the "Change" testbed and
  currently demonstrates none of it.
- **Dalab** is the "Capability & Knowledge" testbed and has the richest building
  tags for services (healers, halls, scribes, embassies, wealth bands) and no
  code that reads them; priest ceremony radii duplicate mound dimensions
  (`95:39-40`) instead of reading the placed mound.

---

## 4. Target shape

### 4.1 Where the code lives

```
core/simulation/
    ROADMAP.md, PLAN.md, SCHEMA.md          docs (SCHEMA.md is Phase 1's deliverable)
    77-sim-0-core.js      SIM global, host binding, clock, seeded RNG, events bus
    77-sim-1-world.js     factions, organizations, relations, presence/permissions
    77-sim-2-places.js    place + activity registry, slots, hours
    77-sim-3-actors.js    actor, role, schedule, group; behaviour resolution
    77-sim-4-nav.js       the NAV contract, layers, A* with budget, width
    77-sim-5-routes.js    transport routes (stops, dwell, capacity) and supply routes
    77-sim-6-economy.js   stockpiles, production/consumption flows (Phase 5)
    77-sim-7-lod.js       tiers 0–2 (Phase 5+)
    77-sim-9-debug.js     window._sim, census, pathviz hooks
    export/               world-IR writer (Phase 7)
```

Same mechanics as `core/atmos/`: one IIFE-scoped global (`SIM`), its own PRNG,
no top-level declarations, a small `SIM.init({...})` host binding. A build opts
in through its `build.py` (`TARGET_CORE`-style list); a local file with the same
name overrides, recorded in `KNOWN_ISSUES.md`. Fragment prefix `77-` sorts after
layout and before every existing `78-`/`84-`/`94-` life fragment, so the module
is defined when the build's own life code runs. The existing life fragments stay
in each build as the **embodiment**: they read `SIM` state and drive meshes.

### 4.2 Where the data lives

Per build, world data is a JS fragment (so `build.py` concatenates it) that
declares objects into `SIM`, generated from the build's own layout at init:

```
settlements/voth/src/
    76-world-factions.js     SIM.faction(...), SIM.org(...), SIM.relation(...)
    76-world-places.js       derived from PLACED/LIFE_DOORS/stalls: SIM.place(...)
    76-world-population.js   SIM.population(...), SIM.role(...), SIM.schedule(...)
    76-world-routes.js       SIM.transportRoute(...), SIM.supplyRoute(...)
```

Phase 7 adds a writer that dumps the same objects to `dist/<name>.world.json`.
JSON is the export, not the source: a build's world data depends on its placed
geometry and must be computed in the same deterministic pass.

### 4.3 The vocabulary (Phase 1 defines it; this is the intended shape)

Field sets are deliberately minimal and each has a known source in an existing
build.

```
Faction      { id, name, parent, sovereign, culture, territory[], relations{}, policies{} }
Organization { id, faction, kind, home(place), roles[] }
Relation     { a, b, stance, trade, travel, settle, trust }    directional; org-level overrides faction-level
Presence     { faction, settlement, status }                   NONE…EXPELLED, evaluated against the authority

Place        { id, x, z, y, ry, doors[], activities{ACT: slots}, hours, faction, org, tags, active{} }
Activity     one of the ~35 primitives in ROADMAP §26; places advertise them, roles prefer them

Role         { id, org, capabilities[], prefers[ACT], home(kind), work(kind), schedule }
Schedule     { entries:[{start, activity}] }                    soft priorities
Actor        { id, faction, org, role, home, work, schedule, prefs, perms, needs{}, group,
               activity, goal, task, state, stateT, nav:{layer, path, seg, u} }
Group        { id, kind, org, leader, members[], route, activity, state, timer }

NavLayer     'pedestrian' | 'road' | 'water' | 'climb' | 'animal' | 'air'
NAV          { nodes:[{id,x,y,z,tag,layer,...}], edges:[{id,a,b,kind,len,w,layer}] }   the Mav/Locus contract
TransportRoute { id, layer, stops[place], schedule|dwell, capacity, faction, vehicle, convoys[] }
SupplyRoute    { id, origin, destination, resource, qty, freq, faction, security, status }
Stockpile      { settlement, resource, amount, produce, consume }
Event          { type, source, target, participants, place, time, consequences }
```

### 4.4 Behaviour resolution

One function in `77-sim-3-actors.js`, used by every build:

```
schedule(hour) + needs + role.prefers  →  desired activity
SIM.placesFor(activity, actor)         →  candidates filtered by faction/presence/hours/slots
choose (distance, weight, reservation) →  target place + slot reservation
SIM.nav.route(layer, from, to, width)  →  path, budgeted
```

The build's embodiment code then walks the path and plays the animation. If no
place offers the activity, the resolver falls through the schedule entry's
alternates and finally `SOCIALIZE`/`IDLE`/`TRAVEL`, as in ROADMAP §21. Voth's
fixed category order and Mav's probability table both become per-role
`prefers` lists with weights; Locus's `order` is already that.

---

## 5. Rules that apply to every build from now on

To be added to `README.md` under "Life/simulation layer" and enforced by a
`tools/check_life.py` lint once Phase 1 lands:

1. No world rule lives only in the embodiment. If a number decides *where* or
   *whether*, it is simulation data (`ROADMAP` §36).
2. Every actor has `faction`, `org`, `role` and a `schedule` (a dummy one is
   fine) on day one.
3. Every destination is a `Place` advertising activities and slots, derived from
   placed geometry and its tags, never a literal coordinate. Semantic anchors
   (`'customs-house'`, `'north-inlet'`) resolve at init and **fail loudly**
   (`SIM.routeFail`) when missing.
4. Hour comes from `SIM.hour()` (the host binds it to `skyHour`). No populations
   read a sky global directly.
5. Nav is the shared `NAV` contract with a `layer` per edge; a width on every
   edge that carries wheeled or formation traffic.
6. Diagnostics: `window._sim` (census, route failures, slot occupancy, events
   log), one PATHVIZ layer per population, the inspector contract on every life
   mesh, a `REG` entry with class `life`.
7. Deterministic: the simulation's RNG is `SIM`'s own, seeded by the host.
   Rebuild hashes must match across a refactor that changes no behaviour.

---

## 6. Phases

Each phase ends with every touched build rebuilt, `verify.py --assert` passing,
and a census comparison against the previous commit (`window._life.census()`
style, extended to `_sim`). Phases 2 and 3 are the proof that the vocabulary is
sufficient; nothing in 4–7 starts until both run on it.

### Phase 0: ground the plan (small)

- Add `core/simulation/{ROADMAP,PLAN}.md` (this commit).
- Add the five-settlement dimension map to each build's README: Mav = Routine,
  Voth = Society, Locus = Mobility, Hexahedron = Change, Dalab = Capability &
  Knowledge. Note Girder (Mav fork) and Yuni (Locus parent) as carried along.
- Add the §5 rules to `README.md`; add `core/simulation/` to `core/README.md`.
- Record in each build's `KNOWN_ISSUES.md` the gaps listed in §3 so they stop
  being rediscovered.

### Phase 1: behavioural vocabulary (no behaviour change)

Deliverables: `SCHEMA.md`, `77-sim-0-core.js`, `77-sim-2-places.js`,
`77-sim-3-actors.js` (data only, no resolver yet), `77-sim-4-nav.js`,
`77-sim-9-debug.js`.

- `SIM.init({THREE?, hour, onTick, ground, seed, err})` modelled on
  `ATMOS.init`.
- Registries with validation: `faction`, `org`, `role`, `schedule`, `place`,
  `actor`, `group`, `transportRoute`. Each returns the object; duplicates and
  unknown references throw at build time.
- The NAV contract lifted from Mav/Locus into `77-sim-4-nav.js`: CSR adjacency,
  heap A*, cost/speed per kind, `w` per edge, per-frame budget queue, `layer`
  filter. Mav's `lifeAstar` and Locus's `navRoute` are the two reference
  implementations; take Locus's heap and Mav's budget queue.
- `SIM.census()` and `window._sim`.
- A `tools/check_life.py` lint: literal `[x, z]` pairs in life fragments
  outside a `// anchor:` comment, populations reading `skyHour` directly,
  actors without faction/org/role/schedule.
- Acceptance: `core/simulation/example/` builds a 20-actor sheet (like
  `core/sockets/example/`) that runs on the module alone.

### Phase 2: translate Voth (Society)

Voth is the hardest and proves the most. Work in the existing lettered
fragments; no regeneration.

1. **Places.** `LIFE_DOORS` becomes `SIM.place` entries. `cat` maps to
   activities: market→`BUY/SELL/SOCIALIZE`, tavern→`DRINK/EAT/SOCIALIZE`,
   temple/shrine→`WORSHIP`, guildhall→`WORK/TRAIN`, dock/strider→`BOARD`,
   compound/slum/manor→`SLEEP`, arena→`SPECTATE`. `cap`/`active` become slots.
   Palace and Fortress get places with `faction: ordinators` and no civilian
   permission, replacing `LIFE_PED_CLOSED`.
2. **Factions.** Vothic Kingdom → Temple, Ordinators, Guilds (carpenter,
   merchant, weaver, navigator), Civilians; Monastery as an org. Liveries hang
   off the org.
3. **Actors.** The `LIFE_PEDS` pool range becomes `role` on each actor; the dead
   `race`/`socialClass` fields become live `prefs` inputs. Shopkeepers,
   laborers, compound workers and monks get `Schedule` objects replacing the
   6/18/22 literals. Ordinator posts and ring patrol become `Group`s with
   `activity: GUARD|PATROL`.
4. **Nav.** Publish a pedestrian `NAV` for Voth (streets from `30c-roads.js`
   `RNODE/REDGE` plus spans, causeways and canton decks as edges with `w`).
   Keep `lifePedBuildLeg` as the fallback for off-graph legs, behind
   `SIM.nav.route`. The water grid becomes the `water` layer; the strider grid
   the `animal` layer.
5. **Transport.** Ferries, taxis, barges, ships, striders become
   `TransportRoute`s with stops as places; boarding goes through
   `SIM.board(route, place)` instead of each vehicle type reaching into
   `LIFE_PEDS`. Caravans become `SupplyRoute` embodiments (origin, destination,
   resource, faction, security) with `cartCount` as quantity.
6. **Anchors.** Replace the literal coordinates in §3 with named anchors
   resolved from geometry; log any that fail to `_sim.routeFail`.

Acceptance: identical build hash for steps that only re-express data; after
step 3, census parity per population within noise; after step 5, ferry and
strider `onboard` counts match the previous build over a 120 s day;
`verify.py --sweep` unchanged.

### Phase 3: translate Mav's Refuge (Routine), then Girder as the fork test

1. `R_*` roles → `Role` objects under `Refuge Council` → `Refuge Guard` (Gate
   Guard, Patrol, Training Yard), `Civilians`, `Gatherers`, `Lift Crew`.
2. `lifeActiveAt(h)` and the day windows → `Schedule` entries (`WAKE 06:00`,
   `WORK 07:00`, `EAT 12:00`, `DRILL 15:00`, `SOCIALIZE 18:00`, `SLEEP 22:00`
   per role). The curfew becomes the civilian schedule's `SLEEP` entry.
3. `LIFE_DEST` lists → places from node tags **and** slot/room kinds (home,
   tavern, barracks, store), which the current code ignores; `'res'` platforms
   get `SLEEP` slots with capacity.
4. Squads, posts, drill and gatherer routes → `Group` objects; the gatherer
   cycle becomes `GATHER` at a place advertising `resource: fruit`, with the
   satellite choice derived from that instead of the 60–420 m literal.
5. Lifts → a `TransportRoute` on a `climb` layer with two stops, so a path can
   include a lift (today it cannot).
6. Girder: apply the same mapping; it must take `core/simulation/` through
   `build.py` and drop its forked copy of the nav code. Record what still
   drifts in its `KNOWN_ISSUES.md`.

Acceptance: `census()` per platform and per role unchanged; patrol loops and
gatherer routes identical in PATHVIZ; the Girder build consumes the core module
with zero local nav code.

### Phase 3b: Locus and Yuni (Mobility)

Locus is already closest to the target. Make it the mobility reference:

- `KINDS` → roles with `prefers` (its `order` lists), `cfg.hours` → schedules.
- `POI` → places; **enforce** `cap` as slots.
- `ST`/`NAV` edges get `layer: 'road'|'pedestrian'`; `RG` water and rider
  searches become `water` and `animal` layers behind `SIM.nav.route`.
- Boats, carts, caravans, rider squads → `TransportRoute`/`Group`; caravans'
  `load` becomes a `SupplyRoute` resource; tribes become factions with a
  `VISITING` presence at the caravanserai.
- Yuni takes the same module; its `deep` edges become the `climb`/`underground`
  layers.

### Phase 4: factions, presence, permissions (Hexahedron as the Change testbed)

- `77-sim-1-world.js`: relations (directional, org-level overrides), presence
  states, `SIM.allowed(actor, place|activity)`.
- Hexahedron gets a clock, a NAV built from `SCREAM.circuit/roads/pairs`, and
  factions: Screamers → Warbands, Pen Guard; captives as a `PopulationGroup`
  with a foreign faction. The scripted 210 s party becomes a `RAID_RETURN`
  event whose consequence changes captive count and affiliation persistently
  (`CAPTIVE_TAKEN`, `CAPTIVE_RELEASED`). This is the first event with a
  consequence that does not reset.
- History Monks / Ordinators example wired across Voth and Mav: a monk actor
  in Voth resolves `WORSHIP` to `covert research` and avoids `Ordinators`
  patrol places because the presence table says `PERSECUTED`.

### Phase 5: resources and supply (Dalab as Capability & Knowledge, plus LOD)

- `77-sim-6-economy.js`: stockpiles per settlement, production and consumption
  flows, `SupplyRoute` ticks. Mav's gatherers add `+N food` per completed
  `GATHER`; Voth's caravans move quantities between warehouse places; Locus's
  carts move refinery output.
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

### Phase 7: export and engine adapters

- `core/simulation/export/world-ir.js`: dump `SIM` to `dist/<name>.world.json`
  from `verify.py`, alongside the HTML. Schema in `SCHEMA.md`.
- Unreal and Godot adapters consume the JSON. Not started until Phases 2–3
  prove two builds run from the same vocabulary.

---

## 7. Risks and how the plan handles them

- **Token cost.** Voth's life source is ~500 KB in 13 fragments. All Phase 2
  work is targeted edits inside sections found with `grep -n '^/\* ===='`;
  each step is one data mapping with a hash or census check, never a rewrite.
- **Determinism.** Moving RNG draws into `SIM` changes every seeded stream
  after it. Phase 1 gives `SIM` its own PRNG (as `ATMOS` does) so host streams
  are untouched; the first data-only steps must produce identical hashes.
- **Performance.** The resolver adds per-decision work. It runs only when an
  actor picks a new activity (seconds apart), not per frame; the per-frame cost
  stays in the embodiment. Budget queue from Mav carries over.
- **Forking.** Girder and Yuni are the two existing forks. Both move to the
  `core/` module in their phase; `--vendor-check` is extended to list
  `77-sim-*` so any local override is visible.
- **Scope creep in the embodiment.** Animation, meshes, liveries and
  draw-call budgets stay in each build's existing fragments. The module never
  touches THREE except through the optional `THREE` binding for debug
  drawing.
