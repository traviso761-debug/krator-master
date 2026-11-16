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

## The books (the accounting contract; PLAN-ECONOMY.md Phase 0)

`77-sim-7-ledger.js`: read only, on the existing books; it adds no counter. `SIM.ledgerSnap()` takes a snapshot of plain data, `SIM.ledger(a, b)`
gives the statement between two.

**A good.** Every good of an economy has a **unit** (`goods[g].unit`: the isles' servings of food and lots of the rest) and an **owner**: for now the
settlement whose economy holds it (no private or faction ownership yet: the row carries the field so a later phase fills it, not adds it). Its
**location** is a stocks state: `production` (a maker's store), `transit` (a cart, a carrier on the map, a landing), `storage` (warehouses and
households' food). **Items** (a shirt, a tool) are not goods: a purchase consumes the good it is made of, and the ledger stops there.

**The balance, per good and settlement.** opening + made + imported - consumed - spoiled - exported = closing, where consumed = used - bought +
eaten - spoiled (a household's purchase moves food, it is eaten later). Spoilage has its own line, though it stays booked `used`, so older
readers of `used` are unchanged. Inbound, outbound and ordered stand beside it, in no settlement's closing.

**Across settlements.** For each route leg and good, shipped = landed + the change at sea: a load is counted once, in one settlement, on a route,
or off the map. A sender's exports less what it shipped is **abroad** (never negative); so is a receiver's imports less what landed. A good
leaving the map has no counterparty yet: the isles' check holds abroad equal to what the ships bought.

**Resource sites and stockpiles (Phase 1).** `SIM.site({id, kind, goods, grade, yield, amount, regen, capacity, settlement})` keys a resource to its
world record's stable id, and a recipe's `site` draws on it: `yield` multiplies the rate, `taken` counts what it gave, and the ledger holds that
to what its settlement made. `amount` unset is endless; a number (the owner's rule since 2026-11-02: core/hamlet/PLAN.md)
depletes, blocks as `depleted: id`, and takes `regen` back a night. `SIM.stockpile(settlement, {good: {min, target, max, reserve}})` is a settlement's
policy: `min` floors the governor's target, `target` replaces it, at `max` the good's makers stop (its supply line, with the governor's `pool`), and no
trade route takes `reserve`.

**Batch recipes (Phase 2).** `SIM.recipe(place, {batch:{in, out, by, hours}, cap, site})`: `hours` worker-hours make one batch. A place holds one batch in hand
(`P.order`). Its `in` are claimed once when it starts, all or none, its own store first and then the warehouses, booked `used`; its `out` and byproducts `by` land
when it ends, booked `made`. A site gives the `out`, not the byproducts. `rate` is batches a worker-hour, so the governor sets it as any, and `in` become the good's
derived demand. `SIM.blockedReport(settlement)` says why each stopped: `{reason: 'missing', goods}`, `'full'`, `'depleted'`, or `'no workers'`; a running batch has no entry.
A recipe of `{out, rate}` runs as before. Skills, wages and queues of work orders are later phases.

**Crime and punishment (`77-sim-6-crime.js`, 2026-11-02; opt-in by `SIM.crime(config)`).** The Voth brief's rules (settlements/voth/SIM-ROADMAP.md 1.7),
proved on the isle demo. Criminals are a share of the eligible, by a hash of the person. Each hour (SIM.step's last act): a criminal in a free hour at
a market picks a pocket (the victim's material meter up, the thief's down), at night burgles another household of its town (a share of its food store
to its own: the town's books unchanged); anyone unhappy among company may start a fight (the victim hurt: the items' `hurt`). The odds it is seen rise
with the witnesses (a guard much more), fall at night; seen, it fails, the nearest guard on duty within reach comes (a `SIM.command` for some minutes)
and arrests by its distance (a town at the abstract level: its guards on duty a head); the arrested are held at the nearest jail place by a
`SIM.command` (`by: 'jail'`, act `JAIL`) for a week (a month resisting), and lie low after. A commanded actor is not counted at work at the abstract
level (`77-sim-6-economy.js`), nor its tool worn (`itemsAbstractDay`). Every roll is a hash: no draw from `SIM.rng`. `SIM.crimeReport(s)`,
`SIM.crimeEvents(since)` (kept apart from the trimmed `SIM.LOG`), `SIM.jailed(a)`.
**The thieves' guild** (`guild`, opt-in; owner, 2026-11-02): one a settlement, the place of its `kinds` (a tavern) farthest from its nearest jail
(`P.guild`). A criminal seen within reach of it, nearer it than the coming guard, hides there (a `SIM.command`, `by: 'hide'`) and is not arrested;
nobody picks a pocket inside it. A burglar's loot is a lot `{from, food, items}` on `a.loot`: the food sits in its home's store (still storage, so the
books balance) and the things (spare clothes kept at home) leave their owners' `inv`; in a free hour the thief goes to the guild and fences it: the food
into the guild's store, the things into its `stash`, its material meter down. Arrested first, the loot goes back. For the world's own actors (the
player): `SIM.crimeHide(a)`, `SIM.crimeFence(a)`, `SIM.crimeLoot(a, lot)`, `SIM.crimeAlarm(a, kind, at)`; `SIM.guildOf(s)`, `SIM.hidden(a)`.

**Money (`77-sim-6-money.js`, 2026-11-03; opt-in by `SIM.money`; PLAN-MONEY.md M0).** Each nation has its currency, each at a rate to the
Izani Talent (the trade's money). An account `{id, owner, kind, currency, settlement, ownedBy, balance}` holds a whole number of its currency's
smallest unit; its id is stable (`hh:<home>`, `wp:<place>`, `treasury:<settlement>`, `guild:<settlement>`, `changer:<currency>`). Money moves four
ways, each booked by its reason: `SIM.mint` (a faucet), `SIM.burn` (a sink), `SIM.pay` (a transfer within a currency, never overdrawing; between
settlements booked out of one and into the other) and `SIM.exchange` (two transfers through the money changers, at the rates less their spread).
The ledger's snapshot carries `money` (every balance, every settlement's books), and its statement holds, exactly, opening + minted - burned + in -
out = closing per settlement and currency, what left the settlements equal to what came in, and no account below zero. `SIM.moneyReport(s)` is
the monthly report's numbers: supply, accounts, minted, burned and paid by reason. **M1** (`SIM.money({m1})`, 2026-11-03): each good's price is its
labour cost (its makers' worker-hours a unit at the pricing wage, plus its inputs', down the chain; an import its maker town's) times a markup set
after a warm-up and some calibration days so the households' spending meets the wage bill (with `ration`, the earners' own keep); at midnight the
day's takings are swept to the workplaces' owners, the payroll pays each employed person's rota hours into its household (not while held), and the
treasury shares out a ration a dependant from what it holds over a day's wages; a purchase is paid from the household, the rest on the dole
(`SIM.moneyBuy`, called by the items). `SIM.moneyM1()` gives the markups, rations and each day's wages, rations, spending, dole and anything unpaid. The ration is m1's default (`ration:
false` turns it off). **M2** (`SIM.money({m2: {k, lo, hi, smooth, level}})`): each night a governed good's price is its cost x markup x its scarcity,
(target / supply line)^k held to [lo, hi] and eased in over `smooth` days (`SIM.MONEY.m1.rel`); with `level`, the markup moves toward what makes the
households' spending meet the wages and the full rations, at most `step` a night, the ration with it (a day's history keeps the price index, `cpi`). **Spending** (`m1.spend: {bands: {cls: [lo, hi]}, days, treatDrop}`): each night a household's
savings in days of its keep set its people's `wealth` within their class's band (`SIM.moneyFill(home)`); the treat's bar falls by `treatDrop` at a
full purse (`SIM.moneyTreatDrop`); a treat or a meal out by choice only with money in hand (`SIM.moneyCan`, asked by the items before the wish and
again at the counter for a treat). **Stations** (`m1.stations`): a person's `station` (worker, merchant, prince, noble) and its `rises`; a
household buys a vacant place of the next station's kinds (its workplace account's `ownedBy` becomes the household's, `merchant` the riser) and its
runner rises; an owned place pays `wholesale` to the treasury, its takings swept to the household, its wages covered from it; a household that
cannot cover them falls. `SIM.moneyStations()` -> rises and falls by settlement and station, and their events. Happiness modifiers:
`SIM.happinessAdd(a, n, days, why)` (a.hmods, fading; a negative n a cheer), `SIM.happinessPool(s, classOf?)` (77-sim-6-needs.js).

**Building and upkeep (77-sim-6-build.js, PLAN-POLITICS.md section 4, 2026-11-03).** A LOT {id (a place), kind, settlement, state: empty |
building | built, project}; its recipe is `build` (the economy's worked hours at it go to its project, it makes nothing). A PROJECT {id, lot,
kind, settlement, bill: {good: n}, got, miss, local (gathered on the spot: a good its town's economy does not keep), hours, done, m0, m1,
state}: its materials drawn as the work goes (booked used; what is wanted anew and missing booked short once), `done` never past the share of
its bill delivered. A town's UPKEEP: each standing building `of` a kind with a `life` wears its bill over it, drawn hourly (`taken`), the
rest `owed` (drawn first when the good returns); the neglected share (owed over `grace` days of upkeep) shown on a hashed share of the
buildings (`SIM.buildWorn`). `SIM.buildReport(s?)`, events start, built and settled. GROWTH (opt-in): a town's `due` households
(people x rate / 365 / per a day) settle into finished lots no one lives in (`L.settled`, the host's `settle` makes their people), and a
project starts only while the houses ready or going up are fewer than `ahead` plus the households waiting; `onFull(s)` asks the host for
more lots when they are out (the isles' streets outside the gates). `waiting(s)`: households waiting outside the houses (a refugee camp's),
counted as demand and housed first (`settle` returns 'moved'). At the abstract level a town's households and its people's abstract days are
listed again each midnight (77-sim-7-lod.js), so a home filled or a person come since the town was lowered is fed and lives its day.

**Unrest (77-sim-6-unrest.js, PLAN-MONEY.md M6, 2026-11-03).** Per settlement: `level` and `stage` by key (`all`, and each class), the stage one
of calm, grumble, demand, strike, treason (the deepest line the level is under; eased back `hyst` over a line); `demands` [{id, m, key, keys,
kind: goods | ruler, goods, due, answer: granted | refused, answered, asked, came, sent: {'<sender>><good>': n}, why}]; `strikes` [{m, key, keys,
held: [place], until}] (the places' recipes held, reason 'strike'); `treason` [{m, key, level}]. A shipment is booked exported by its sender and
imported by the asker, so a settlement's books hold. `SIM.unrestReport(s?)`, `SIM.unrestArrest(s)` (crime's arrest odds read it),
`SIM.unrestSpare(s, g)`. **Needs at the abstract level** (77-sim-6-needs.js `SIM.needsAbstract`): the meters of an unwatched town's people are
lived by schedule from their clock to the minute asked (`a.absAct`, `a.absIntr` its state), so any reader of an abstract actor's meters gets
its lived day; a household's abstract meals set `P.absBoost`, its people's EAT. **Vital needs** (`SIM.needs` `vital: {need: line}`): past its
line a vital meter caps happiness, 100 at the line to 0 full.

**A work camp's controls (core/camp 40, 2026-11-02).** `SIM.recipeHold(place, reason, until)` stops a recipe (its workers' hours lost, the blocked
report giving `reason`) until the minute `until`; `SIM.recipeSite(place, site)` points it at another site; `SIM.siteRestore(id, amount)` raises a
site grown back while nobody worked it and books it `regrown` (as the nightly `regen` now is), which the ledger allows. A site feeding a batch
recipe has its take booked when the batch starts and its out made when it ends: the ledger holds the take less the batches in hand (`wip`) to
what was made.

**Better tools (an item kind's `prefer` and `base`, 77-sim-6-items.js).** A tool kind's `prefer: [kinds]` are bought in its place when its
seller sells one and the buyer's settlement holds that kind's good (declared in its economy and in stock); a miss is booked `short` of the better
good, so its want shows where nobody could buy it. A better tool bought in place of another remembers it (`a.tool.base`) and, worn out, is sought as that one again (a
field hand's hoe, a smith's stone tool); a kind's `base` is the fallback for one given at the start. So a town out of the better good falls back. The ledger sees only goods: an iron tool bought is one `irontools` used.

**Migration.** The ledger reads records and changes none, so a world's JSON, its ids and the `krator-sim` export are unchanged, and a page that
does not call it is unaffected. A snapshot carries `version` (`SIM.LEDGER_VERSION`), and two of different versions do not compare. New fields
join a row; an existing field's meaning does not change. The export takes the statement as an added section when Godot needs it.

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
