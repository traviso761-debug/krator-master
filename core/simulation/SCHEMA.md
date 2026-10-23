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
| `places-*.json` | place | **id**, **kind**, **x**, **z**, `y`, `ry`, `name`, `door:{x,y,z}` (where it is walked to), **activities:{ACT: slots}**, `hours:{ACT:[open,close]}` or `open:[h0,h1]` (wraps past midnight), `indoor:{ACT:bool}` or `true`, `org`, `faction`, `access`: `public` (default: anyone not hostile to the place's org) / `friendly` / `org` / `private` (only the actors whose home or work it is: a house; `guests:{ACT: metres}` lets in, for that activity, the actors whose home is within that many metres: the neighbours visiting), `layer` (default `pedestrian`), `spots:[[x,z,y]...]` (where people stand: stalls, tables, bays), `r` (an open place's reach, metres), `wander` (metres of idle drift), `via` (a place on another layer is reached through a boarding place: `boat`), `pier:{x,y,z}` (a dock's boarding point), `cap` (people present at once over ALL its activities; a quarter whose bed and hearth are one person's room), `tags`, `pull:{ACT: weight}` (how strongly the place draws someone choosing where to spend free time, read by a world's resolver; default 1), `job` (the kind of work its posts are for), `posts` (work posts: people working there at once) |
| `roles.json` | role | **id**, **org**, **sched** (24 activities, or spans `[[hour, ACT], ...]`), `name`, `needs:{labour, rate:{need: multiplier}}` (with `SIM.needs`), `count` (residents to make), `fill:true` (takes every bed left), `deal:"round"` (the i-th actor to `homes[i % n]`, past the beds: Shade's rule), `variants:[sched, ...]` (schedules dealt round-robin to its actors), `homes:[place kinds]` (in order of preference; an entry no place has as its kind is a place id), `work:{kinds:[...], act}` (pinned, dealt round-robin by load), `boat:true` (a boat at the nearest dock with room), `vehicle:{base}`, `prefers:{ACT:{pin:'home'|'work', kinds:[...], ids:[...], spread:n, via:'boat'}}`, `cycle:{ACT: minutes}` (move to another place of the kind every so often: a patrol, a merchant's rounds), `fallback:{ACT: ACT}`, `speed`, `layer`, `mode`, `transient:true` (made only by events), `scheds:{name: sched}` with `week:[7 names]` (the schedule each weekday, `SIM.weekday` = day % 7; an actor's `off` weekday takes `scheds.off`: a rota) |
| `actors.json` | actor | **id**, **role**, `home`, `work`, `org` (default the role's), `sched` (overrides the role's), `off` (its rota day off, a weekday 0-6), `alias` ({schedule name: schedule name}: the actor follows another of its role's `scheds` in place of one), `inv`, `eq`, `wears`, `sets`, `keep`, `tool` (with `SIM.items`), `trait` (a key of the needs' `traits`), `culture` (a key of the needs' `cultures`), `nd` (its need meters, in the order of the needs' `list`; default the needs' `init`), `boat:{dock, pier}`, `vehicle:{base}`: rarely hand-written; `populate` makes them |
| `events.json` | event | **id**, **kind**: `caravan` / `riders` (a group arrives, stays, leaves) or `excursion` (one resident takes a vehicle out and back), **org**, `every:[minH,maxH]` (world hours between firings), `window:[h0,h1]`, `from:[ports]`, `to:[ports]` or `"other"`, `size:[a,b]` units, `unit:[{role, n}]` per unit, `beasts` per unit, `mount`, `arrive:{kinds, activity}`, `stay:{nights, untilHour}` or `legs:[{activity, mins, kinds?}]` (an itinerary instead: stop to stop together, each the nearest place offering the activity, `mins` world minutes there, then out by `to`), `layer`, `mode` (`walk ride drive boat`), `speed`, `maxLive`, `spread` (metres either side of the leader the members walk in pairs: 1.6, a caravan 1.1; 0 single file, 1.4 m apart); excursions: `base` (place id), `fromKind`, `away:[minH,maxH]` |
| `ports.json` | port | **id**, **x**, **z**, `kind` (`road` / `country`), `layer`, `y` and `node` (an entry inside a world of levels: where a group starts, its route's end on that nav node) |
| `transports.json` | transport | **id**, **layer** (`water`, `strider`, ...), **stops** (place ids, or `port:<id>` for a line that enters or leaves by a map edge; first === last makes a loop, else the line runs out and back), `vehicle` (a catalog id), `vehicleKind` (`ferry` / `strider`: speed and dwell defaults, `SIM.TRANSPORT`), `vehicles` (default one per `headway` seconds of the round; `headway` defaults to `SIM.TRANSPORT.headway`), `exclusive` (one vehicle at a time at a stop's berth: a later one queues `queueGap` metres back and waits; the day is laid out over `horizon` seconds and repeats), `speed` m/s, `dwell` s at each stop, `phase` s, `capacity`, `faction`, `org`. `SIM.transportBake` adds `legs`, `segments` `[[dur, ease, from, to]]` (a dwell has from === to) and `period`; `SIM.vehiclePose(id, k, t)` is a pure function of motion time |

## The resolver (what an actor does, minute by minute)

`want = sched[hour]` (or the current leg of an event's itinerary). The place: the role's `pin` (home or work), else
the place the actor used for this activity last if it is open and has room, else the nearest few places of the
role's `kinds` (or any place offering it) with a free slot that let it in, one picked at random among the nearest
`spread` (default 3; found on a grid of the places, exactly as a full nearest-first sort would). A place the actor cannot route to is struck off for it and the next tried. Nothing found: the
role's `fallback`, then `SOCIALIZE`, `REST`, `IDLE` (at home). The motion is baked then: legs of routes, each on one
layer at one speed and mode; a `via` place adds the walk to the boarding place and the ride beyond. `SIM.pose(a, t)`
evaluates it. A world may make a graph layer lazy (`SIM.lazy = {pedestrian: {detour: 1.35}}`): a leg there is decided
from the straight line times `detour` and the layer's connected bodies, and its path is found the first time it is
posed (`SIM.legRoute`), walked at the speed that keeps its arrival.

**Needs** (opt-in: `SIM.needs(config)`, `77-sim-6-needs.js`). A meter per need (0 met, 100 desperate) rises at
`rate` per world hour (times the role's `needs.rate`), falls by the activity's `fill` per hour (the actor's culture's
own table first); WORK adds `work` times the role's `needs.labour`. Meters advance lazily, when the actor decides or is
asked (`SIM.needsOf`): nothing fills during the trip (its duration over `secPerMinute` motion seconds a world minute).
In an hour whose scheduled activity is one of `free`, `SIM.desire` returns the free activity whose fills times the
meters (times `weight` and the trait) score highest and that an open place within reach offers (a home-pinned one: the
home), the scheduled one favoured by `keep`, held `dwell` minutes. An `interrupt` ({need: {at, act, until, max, cool}})
takes an actor whose role has labour off WORK when that meter reaches `at`. `SIM.happiness(a)` = 100 less the weighted
mean of 100 (m/100)^`pain`; `SIM.mood(a)` its band (`bands: [{label, min, eff}]`), the efficiency, and the loyalty that
drifts toward it over `loyalty.tau` minutes (`loyalty.bands`). `SIM.needsCensus(key, {minute, high, filter})` sums
them by a key. A jump of the clock leaves the meters as they were. `SIM.needsPeek(a, minute)` reads the meters at a
minute without advancing the actor (an inspector's read), and `SIM.happiness(a, nd)` scores those meters.

**Items** (opt-in: `SIM.items(config)`, `77-sim-6-items.js`). Item kinds by category (food, clothes, armour, arms,
tool, gear, medicine, household, luxury), a worn kind with a `slot` (torso and legs take a clothing and an armour
`layer`; feet shoes or boots; head; each hand) and a `life` in worn days, a tool a `workLife` in worked hours, a good
its `material`. `SIM.shop(place, [items])` says what a place sells; stock is abstract (every purchase succeeds and is
logged) unless the economy is on. An actor carries `inv`, `eq` (the worn positions), `wears` and `sets` (or `keep`), a `tool` or `toolRack`; a
home its `people`, a food `store` or `mess`. Wear is counted lazily at the first decision of a day; a worn-out item is
replaced from home, a short set is an errand on time off, a tool worn out at work an errand in work time, a worked day
may end `hurt` (an errand for a poultice). An errand (`BUY`, its item) goes to the nearest seller within reach in an
hour of WORK or of the `free` activities; a meal at home takes two foods from the household's store (or one, or
none: the actor's `boost` of EAT); a store running low sends one of its people for days of food; a high material meter
buys a `treat` by wealth; a meal is eaten out (a seller of the item `meal`) by `eatOut` or for an empty store.
`SIM.itemsEff(a)` (a missing tool, a hurt) multiplies the needs' efficiency. An actor's `boat.layer` names its boat's
water layer (a kayak's own, in place of `water`); `SIM.legsBy` counts the legs planned by layer. A planned task
carries `vehFrom` and `veh` (the vehicle it set out in and the one it leaves the actor in); a new plan starts from
`SIM.vehicleAt(a, t)`, the vehicle read off that task at `t` (a boat leg afloat, a drive leg in the buggy, else on
foot; `veh` once arrived), not from `inVehicle` as the last plan left it, so an actor asked again on its way to a
landing does not paddle from the street.

**The economy** (opt-in: `SIM.economy(config)`, `77-sim-6-economy.js`). Goods (`goods`, each with an optional
`import: {route, lot}`) and their `inputs`. `SIM.store(place, {kind, cap})` gives a place a `stock` ({good: n}): a
`site` or a `warehouse` (the settlement's store is the warehouses'). `SIM.recipe(place, {out, rate, cap})` makes a
place a producer: every `every` minutes its workers at work (arrived, doing WORK there) times their `SIM.mood`
efficiency times `rate` units an hour, each unit of the good in `out` with the fewest days left whose inputs are in the
site's store or the warehouses, up to its `cap`. `SIM.cart(actor)` hands an actor (`driven`) to the economy: the
stepper and the jump leave it alone; idle, it goes to the site whose stored good has fewest days left, then the most
stored no other cart is bound for, then the nearest; loads up to `cart.cap`, unloads at the warehouse with least of that
good. `SIM.supply(good, n, whole)` and `SIM.economyMeal()` draw on the warehouses (the fullest first); with the items
module on, a purchase draws its kind's `good` (`per` units, all or nothing), a household's food what is there, a meal
out or at a mess `meal.per` units of food. `SIM.economyDays(good)` is the warehoused stock over the use a day (the last
`window` days and today); under `imports.days` an imported good is sent for and arrives `routes[route].minutes` later
at the warehouse with least of it. `SIM.economyReport()` per good (stock, at the sites, made, used, imported a day,
days left, hauled, short), the carts by phase, the shipments in flight, the sites by what they hold.

**Carriers and exports** (the economy's `carriers`, `exports`). An import whose route has a carrier comes as a group
(`SIM.fire`'s itinerary: in by one of its `from` ports, to the place `at`, a stay of `mins` doing `activity`, out by the
same port: `to: 'same'`), as many units as the lot needs at `cap` a unit within `size`; it unloads into `at`'s store on
arrival (`SIM.economyStop`, called by the stepper at an itinerary leg's `stop`) and, leaving, buys the good with most
days left (made the day before, over `exports.minDays`), at most the day's surplus times `exports.days`. An import
decision counts what the sites hold. A route without a carrier or a port delivers by timer. `landed` counts both ways.

**What things hold, and the stocks** (`77-sim-7-stocks.js`, read only: it changes no record and draws nothing; on
when the economy or the items are). `SIM.contents(id)` -> `{id, type: 'place' | 'actor' | 'group', name, items:
[{item, n, state, as, wear?, life?, workLife?, slot?}]}` (null for an id no record has): a place's store (`store:
{kind, cap, held, state}`, `makes`, `inputs`, `carts` bound for it), its household's food (`household: {people,
servings, days, low}`), `sells` (and `shelf`: `warehouses` with the economy on, a shop keeping no stock of its own),
`mess`; an actor's worn items (`wear` 0..1 of `life` days), its tool (of `workLife` worked hours), what it keeps at home
(`inv`), a cart's load, its household's food and its group's load beside (`household`, `group`); a group's lot coming
in (an import's carrier) and its cargo going out (an export). The **states**: `production` (a store of a place with a
recipe: made, not yet hauled), `transit` (a cart's load; a carrier's lot or cargo while its group is on the map; a lot
landed at a site store with no recipe, the carrier's unloading place, waiting for the carts), `storage` (the
warehouses; the households' food stores), `owned` (worn, kept at home, tools); `ordered` (a timer import, no carrier on
the map) stays out of the total. `SIM.stocks()` -> `{minute, order, by: {item: {total, production, transit, storage,
owned, ordered, use, days, low, out, wanting, day, today}}, day: {from, to, partial, jumped}, today, households: {n, low,
empty}, rule: {lowDays}}`: every good of the economy and every item kind (not `meal`). **The daily snapshot**:
`SIM.stocksStep` (the stepper's, after the economy) keeps the totals and the economy's and the items' running counters
at the first step of each world day; `day` is the last two snapshots' difference, `today` now against the last
(`SIM.stocksJump`: a jump of more than a minute marks the span `jumped`). A good's flows: `made`, `imported` (as it
enters the map: a carrier's lot from its arrival, a timer's on landing), `exported` (as it leaves the map: a carrier's
cargo when its group is gone), so that `change` = made + imported - exported - consumed, `used` (drawn from the warehouses or a site's own store), `stocked` (food bought into
households' stores: a move), `eaten` (meals at home, the items' new `stats.eaten`), `consumed` = used - stocked + eaten,
`unmet` (the economy's `short` and the items' `outOf`), `change`; an item's: `bought`, `issued`, `worn`, `broken` (the
items' new `stats.brokenBy`), `consumed`, `unmet`, `change`. **The marks**: `low`, days of cover (`SIM.economyUse`: the
use a day, the warehoused stock over it) under the economy's `imports.days`; `out`, an unmet draw or purchase over the
last day or today; `wanting`, the actors short of a kept set or with a broken tool now. `SIM.holders(item, top)` ->
`{item, count, total, list: [{id, type, name, state, n, as}]}`, most first; `SIM.placeAt(x, z, r)` the nearest place
that holds anything within its `r` (or `r` metres); `SIM.whereIs(id, t)` a place's, an actor's (its pose) or a group's
(its leader's) position. Voth's stocks panel and inspector (`settlements/voth/targets/voth-city/56e`) read only these.

**Animals** (a world's: the Voth city's 47-vc-sim-animals.js). An actor with `animal` is counted apart (the needs'
census leaves it out unless `opt.animals`); `herd` names the place it is kept at. A role's `needs.free` is its own list
of free-time choices (an animal's feeding, grazing, drinking, resting, loafing) in place of the world's `free`. A recipe's
`herd: {out, rate, tended}` makes `rate` units an animal-hour of the herd at home, times each one's `SIM.mood`
efficiency (`tended`: only while its workers are at work there), the young (`grownAt` still to come) left out; a
site's own inputs used count as used. `SIM.produce(place, good, n)` puts a one-off yield (a slaughter's meat) into a
place's store and counts it made. A food kind's
`quality` multiplies the meal it is in (cheese over milk).

**Commands and hooks** (`77-sim-3-actors.js`). `SIM.command(actor, {act, place, spot?, until | mins, by})` overrides
the actor's schedule, needs and errands until `until`: it does `act` at `place` (at `spot` when given), then is free
again (an arena's keepers sending a beast onto the sand; later a sergeant's order). `SIM.stepHooks` are a world's own
functions called with (minute, t) at the end of each `SIM.step`.

**The wake** (opt-in: `SIM.WAKE = true`, `77-sim-3-actors.js`). The stepper skips an actor until `a.wake`, the
soonest minute anything it wants could change (`SIM.wakeOf`): the next hour its schedule changes (midnight at the
latest), hourly with an errand waiting or in free time, a failed task's retry, a role's cycle, and the needs' and the
items' clauses (`SIM.needsWake`: a dwell ending, a meter reaching an interrupt; `SIM.itemsWake`: an errand done, a tool
worn through; a command's end). An actor whose wish and decision differ is asked again the next minute. A jump clears every wake.

**The lag** (opt-in: `SIM.LAG` minutes, `77-sim-3-actors.js`). Each actor's day runs `SIM.lagOf(a)` minutes (a hash
of the actor, 0 to `LAG`) behind the clock: its schedule, its weekday and its wake read the lagged minute, so a change
of schedule falls due over the hour's first minutes instead of all at :00 (the hour's turn), and its wish and decision
stay consistent (nothing waits). A world may add an actor's own `lagBase` minutes (the Voth city's trades in two
buckets, half of them a half-hour later).

## Settlements and their economies (P7a, 2026-10-19)

A page may hold several settlements, each with its own economy (`settlements/isle-demo/PLAN.md` section 9). It is
**opt-in**: a page that never names one runs one economy as before, and its results do not move (Voth's stocks proof,
`test-sim.js`).

- `SIM.settlement({id, faction, name?})` makes the record (kind `settlement`, registered on first use).
- A place belongs to one: `SIM.place({..., settlement: id})`. An actor belongs to its home's (`SIM.settlementOf(x)`
  takes a place id, a place or an actor).
- `SIM.economy(config, {settlement: id})` makes that settlement's own economy: warehouses, sites, recipes, carts,
  in-flight loads and books. Once one is keyed, every economy on the page must be (an unkeyed one throws).
- `SIM.store`, `recipe`, `produce` and `cart` route by the place or actor they are given. `SIM.supply(g, n, whole, s)`,
  `stockOf(g, s)`, `economyMeal(s)`, `economyDays(g, s)` and `economyReport(s)` take the settlement last, or run inside
  `SIM.withEcon(s, fn)`. A purchase draws on its shop's settlement, a meal out on its place's.
- `SIM.economyStep` and `economyJump` step every economy in turn. Inside a turn `SIM.ECON` is that economy, so the
  module's own code is unchanged.
- `SIM.stocks(s)` is one settlement's stocks, `SIM.stocksBy()` all of them; each keeps its own daily snapshots.
- **People.** A role may name its `settlement`: its actors live in that town's homes only, and every actor's work is
  dealt among the places of its home's town. `SIM.populate({settlement, prefix})` deals one town's roles over its own
  beds (call it once a town); its result counts `bySettlement`.
  A role's `work.near: true` (opt-in, any page) deals each actor the nearest place of its kinds with a post free.
- **The search.** The resolver looks for a place in the actor's own town first and anywhere only when its town has
  none (`SIM.placesFor(..., {settlement})` filters by town); an errand's seller likewise.
- **The items' books.** Each town's stocks count only its own households' food and its own people's things (by their
  home), and its item flows (bought, eaten, worn, issued, broken, unmet) from the items module's books by town
  (`SIM.ITEMS.statsBy[s]`), which also count its meals (`statsBy[s].meals`, the shape of `stats.meals`).
- **Trade between settlements** (`77-sim-6-trade.js`): `SIM.trade({id, stops:[{settlement, place}, ...], cap,
  carriers?, minutes? | line?, mins?, goods?, keep?, want?, most?})`. A carrier goes round the stops on a timer
  (`minutes` a passage, `mins` a stay) or as a `SIM.transport` line's vehicle. Leaving a landing it buys from that
  town's warehouses what the next town wants (its use plus its unmet draws a day) and this one can spare (above `keep`
  days of its own want), up to `want` days of the receiver's and `cap` in all; the sender books it **exported**. At sea
  it is in neither town's stock: `SIM.tradeOutbound(g, s)` and `SIM.tradeInbound(g, s)` count it, a town's stocks rows
  show it as `outbound` and `inbound`, and a town does not send for an import of what is already at sea toward it.
  Landing, it goes into the landing's store (or the emptiest warehouse) and the receiver books it **imported**.
  `SIM.trades(a, b)` gates it: one faction, or each faction's relation to the other not shut (`trade` false, `'none'`
  or `'closed'`; without `trade`, a stance of wary or better). `SIM.tradeReport(id?)`: voyages, refused, what went
  each way, landed, each carrier's load.

## The three levels (the contract for a settlement nobody is watching; P7d builds it)

A settlement runs at one of three levels, chosen by the player's window, never by what it holds:

| Level | When | What runs | What is drawn |
|---|---|---|---|
| **record** | always | the records exist: places, actors, stores, routes, the books | nothing |
| **abstract** | the settlement is loaded but away from the window | each place produces and consumes by the hour from its workers and recipes, as `SIM.economyStep` does; carts are counted, not walked (a load moves when its trip's minutes are past); trade routes tick; the books balance | nothing; no actor is posed |
| **presented** | the settlement is in the window | everything: actors posed, carts walking, groups on the map | everything |

**The rules between them.**
- The books are the same at every level: made + imported - exported - consumed = the change of the stock, per good and
  per settlement, over any span.
- Raising a settlement to presented places each actor where its schedule says it is at that minute (the wake), and
  each cart part-way along its trip (the lag). Lowering it keeps every record and drops only the poses.
- A carrier between two settlements is a record while away: it leaves one settlement's books (exported) and lands in the
  other's (imported) after its route's minutes; while at sea it is counted `in transit`.
- **In code** (`77-sim-7-lod.js`, P7d): `SIM.level(s, 'abstract' | 'presented')`, `SIM.levelOf(s)`. Abstract: `SIM.step`
  and `SIM.jump` skip the town's actors; a producer makes by the workers whose schedule says WORK at their job and its
  animals at home, at the efficiency they had when lowered; a cart's trip is the straight line times
  `SIM.ABSTRACT_DETOUR` at its speed, with no route; households eat from their stores (a mess from the warehouses) and
  restock when low (`SIM.itemsAbstractHome`), booked as a watched town books them. Meals out, errands and wear wait.
  Raised: every actor decided afresh (SIM.jump's rule), and a cart on a trip given its route, arriving at the same
  minute.
- The abstract-level week test (`settlements/isle-demo/PLAN.md` section 7) fast-forwards a week with one town in the
  window, then the other, and checks the books, every load and the arrival after days away.

## Navigation layers

`pedestrian` (people), `road` (wheels and caravans: routes ask `minW`), `water` (boats), `animal` (riders across
country), and in time `climb`, `air`, `interior`. A graph layer is `{nodes:[{id,x,y,z,tag}], edges:[{id,a,b,kind,len,w}]}`
(the NAV contract); a grid layer registers `route(ax,az,bx,bz)` and answers the same call. A graph layer whose levels
stack (terraces, storeys) passes `yWeight`: a point with a `y` then finds its node by `sqrt(dxz^2 + (yWeight*dy)^2)`
(Voth's city: 3). `SIM.nav.field(layer, [{node, d}], {max})` searches from many sources at once and labels every node
with its cost from the nearest and which one (`{d, src}`): Voth's city deals 22,000 jobs with it, one search a round.

## The export

`SIM.export()` -> `{format:'krator-sim', version:1, convention, clock, activities, factions, orgs, relations, presence,
places, roles, actors, groups, events, ports, transports, nav, log}` in these record shapes. The convention block is the atmos and
biome exports' (metres, +Y up, x east, z south, radians about +Y).

`SIM.exportMotion({times, actors})` -> `{t, times, actors, routes, rows}`: the motion a port replays (`ksim.gd`, `KSim.pose`):
each actor's baked task (legs by route index, speed, duration, back, side, mode; the spot, the wander) and pose fields, the
routes once each, and the trace `rows` (`SIM.pose` at `times` motion seconds after now: [t, actor index, hidden, moving, x,
y, z, h]). Lifted from Dhelv's export on 2026-10-20 (the isle demo's P8); Dhelv's builder and this one give the same bytes at
the same instant (651 actors, 3,906 rows).

## Audits (`window._sim`)

`audit()`: residents, places, roles, `unknownActivities` (a schedule asking for something nowhere offers), `capacity`
(hours when the residents wanting an activity outnumber its open slots: `{hour, activity, want, slots, short}`, the wants
filled scarcest activity first and a place's `cap` shared, so `short` can exceed `want - slots`; SOCIALIZE, REST and IDLE
fill last and are not reported), `unroutable` (places the reference point `SIM.REF` cannot reach on their layer; with
`SIM.REF.ports` also `port:<id>`), `routeFail`. A build adds its own checks to the same report with
`SIM.audits.push(fn(out))` (Shade: `onlyWayUp`, `events`, `routes`). `census()`: by activity, by role, moving, indoors, groups.
