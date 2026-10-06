# The simulation records (SIM): the schema

Read this before writing a settlement's `world/*.json`. The module is `core/simulation/77-sim-*.js` (PLAN.md §4,
Phase 1); its first consumer is `settlements/mungo` (`src/78b-mungo-world.js` registers what the geometry implies,
`world/*.json` is the hand-edited overlay, `src/84-mungo-life.js` draws it). Shade is the second (`src/84-host-life.js`:
its grid as the `pedestrian` layer, places from `44-host-layout.js`, stepped by its probe). `test-sim.js` is the contract; `example/` is the smallest world on the module alone (`build.py`, `check.py`).

## How a world is declared

1. The build binds the host: `SIM.init({seed, hour:()=>, day:()=>, t:()=>, err:(m)=>})`. The hour and day are WORLD
   time (`core/clock`, KCLOCK: a 72-minute day, held by default); `t` is MOTION time in seconds.
2. It registers its navigation layers (`SIM.nav.layer`), its places from what was built (`SIM.place`), its ports.
3. `SIM.load(json)` applies `world/*.json`: a record with a known `id` OVERRIDES the generated one field by field,
   a new `id` is ADDED (through the kind's constructor), `{"id":..., "remove":true}` DELETES. The file name before the
   first `-` or `.` is the kind: `places-shore.json` holds places.
4. `SIM.populate()` makes the residents from the roles; `SIM.check()` names every unresolved reference.
5. Every frame the build calls `SIM.step()` as the world minute advances (and every couple of seconds while the
   clock is held), `SIM.jump()` when the clock jumps, and draws `SIM.pose(actor, t)`.

Rules: one record per line, sorted by `id`; a `_note` on any record carries the reasoning and is kept by the
export; `_src` (file:line) is added by the build. A field not listed here is kept but read by nothing.

## Kinds

| File | Kind | Fields (required in **bold**) |
|---|---|---|
| `activities.json` | activity | **id** (UPPER_CASE), `indoor` (the actor is hidden while doing it, unless the place says otherwise) |
| `factions.json` | faction | **id**, `name`, `parent`, `culture`, `sign`, `colours`: from LORE.md §6, §10 |
| `orgs.json` | org | **id**, **faction**, `name`, `kind`, `resident` (false for visitors), `hostile` |
| `relations.json` | relation | **a**, **b** (org or faction ids), **stance**: `allied friendly cordial neutral wary hostile`, `trade`, `travel`, `settle`, `trust`. Directional: a's view of b. `id` defaults to `a>b`. Org-level beats faction-level; no record is `neutral` |
| `presence.json` | presence | **faction**, **settlement**, **status**: `NONE VISITING TRADING RESIDENT ESTABLISHED PERSECUTED EXPELLED` |
| `places-*.json` | place | **id**, **kind**, **x**, **z**, `y`, `ry`, `name`, `door:{x,y,z}` (where it is walked to), **activities:{ACT: slots}**, `hours:{ACT:[open,close]}` or `open:[h0,h1]` (wraps past midnight), `indoor:{ACT:bool}` or `true`, `org`, `faction`, `access`: `public` (default: anyone not hostile to the place's org) / `friendly` / `org`, `layer` (default `pedestrian`), `spots:[[x,z,y]...]` (where people stand: stalls, tables, bays), `r` (an open place's reach, metres), `wander` (metres of idle drift), `via` (a place on another layer is reached through a boarding place: `boat`), `pier:{x,y,z}` (a dock's boarding point), `cap` (people present at once over ALL its activities; a quarter whose bed and hearth are one person's room), `tags` |
| `roles.json` | role | **id**, **org**, **sched** (24 activities, or spans `[[hour, ACT], ...]`), `name`, `count` (residents to make), `fill:true` (takes every bed left), `deal:"round"` (the i-th actor to `homes[i % n]`, past the beds: Shade's rule), `variants:[sched, ...]` (schedules dealt round-robin to its actors), `homes:[place kinds]` (in order of preference; an entry no place has as its kind is a place id), `work:{kinds:[...], act}` (pinned, dealt round-robin by load), `boat:true` (a boat at the nearest dock with room), `vehicle:{base}`, `prefers:{ACT:{pin:'home'|'work', kinds:[...], ids:[...], spread:n, via:'boat'}}`, `cycle:{ACT: minutes}` (move to another place of the kind every so often: a patrol, a merchant's rounds), `fallback:{ACT: ACT}`, `speed`, `layer`, `mode`, `transient:true` (made only by events) |
| `actors.json` | actor | **id**, **role**, `home`, `work`, `org` (default the role's), `sched` (overrides the role's), `boat:{dock, pier}`, `vehicle:{base}`: rarely hand-written; `populate` makes them |
| `events.json` | event | **id**, **kind**: `caravan` / `riders` (a group arrives, stays, leaves) or `excursion` (one resident takes a vehicle out and back), **org**, `every:[minH,maxH]` (world hours between firings), `window:[h0,h1]`, `from:[ports]`, `to:[ports]` or `"other"`, `size:[a,b]` units, `unit:[{role, n}]` per unit, `beasts` per unit, `mount`, `arrive:{kinds, activity}`, `stay:{nights, untilHour}` or `legs:[{activity, mins, kinds?}]` (an itinerary instead: stop to stop together, each the nearest place offering the activity, `mins` world minutes there, then out by `to`), `layer`, `mode` (`walk ride drive boat`), `speed`, `maxLive`; excursions: `base` (place id), `fromKind`, `away:[minH,maxH]` |
| `ports.json` | port | **id**, **x**, **z**, `kind` (`road` / `country`), `layer` |

## The resolver (what an actor does, minute by minute)

`want = sched[hour]` (or the current leg of an event's itinerary). The place: the role's `pin` (home or work), else
the place the actor used for this activity last if it is open and has room, else the nearest few places of the
role's `kinds` (or any place offering it) with a free slot that let it in, one picked at random among the nearest
`spread` (default 3). A place the actor cannot route to is struck off for it and the next tried. Nothing found: the
role's `fallback`, then `SOCIALIZE`, `REST`, `IDLE` (at home). The motion is baked then: legs of routes, each on one
layer at one speed and mode; a `via` place adds the walk to the boarding place and the ride beyond. `SIM.pose(a, t)`
evaluates it.

## Navigation layers

`pedestrian` (people), `road` (wheels and caravans: routes ask `minW`), `water` (boats), `animal` (riders across
country), and in time `climb`, `air`, `interior`. A graph layer is `{nodes:[{id,x,y,z,tag}], edges:[{id,a,b,kind,len,w}]}`
(the NAV contract); a grid layer registers `route(ax,az,bx,bz)` and answers the same call.

## The export

`SIM.export()` -> `{format:'krator-sim', version:1, convention, clock, activities, factions, orgs, relations, presence,
places, roles, actors, groups, events, ports, nav, log}` in these record shapes. The convention block is the atmos and
biome exports' (metres, +Y up, x east, z south, radians about +Y).

## Audits (`window._sim`)

`audit()`: residents, places, roles, `unknownActivities` (a schedule asking for something nowhere offers), `capacity`
(hours when the residents wanting an activity outnumber its open slots: `{hour, activity, want, slots, short}`, the wants
filled scarcest activity first and a place's `cap` shared, so `short` can exceed `want - slots`; SOCIALIZE, REST and IDLE
fill last and are not reported), `unroutable` (places the reference point `SIM.REF` cannot reach on their layer; with
`SIM.REF.ports` also `port:<id>`), `routeFail`. A build adds its own checks to the same report with
`SIM.audits.push(fn(out))` (Shade: `onlyWayUp`, `events`, `routes`). `census()`: by activity, by role, moving, indoors, groups.
