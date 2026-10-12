# Voth citizen simulation: the owner's brief and the roadmap (2026-10-12)

The owner's brief of 2026-10-12 (part 1, kept here as a structured spec so later sessions work from the source) and the
roadmap it needs (part 2). It is a Voth-city instance of `core/simulation/PLAN.md` (the standardization plan, whose
"Phase 2: translate Voth" and "Phase 5: resources and supply" this is) and of `core/simulation/ROADMAP.md` (the owner's
earlier world-layer roadmap). Nothing here replaces those: new mechanics go into `core/simulation` as modules every
world can use, and the Voth city (`settlements/streetlab`, page `dist/voth-city.html`) is the first consumer.

**The owner answered the phase-A questions on 2026-10-12 (part 3, "Answers"). Phase A session 1 is done (branch `Voth-sim`,
2026-10-12): every lot building's interior, the residence rule's report, the cutaway on any building, the density overlay
and the job table. Its numbers and what is left of phase A are in `HANDOFF.md`.**

---

## Part 1. The brief, as a spec

### 1.1 Interiors (every Voth building except the Palace and the Temple, which wait for the owner's references)

- Every building gets an interior and the cutaway works on all of them, not only the cantons.
- Every building holds at least one piece relevant to its purpose (industry, storage or dwelling).
- A dwelling holds, per 2 residents, at least one bed, one item store and one food store, arranged as bedrooms and a
  dining or entertaining space wherever the plan allows. A dwelling too small for its residents is **reported, not
  forced**; the owner decides later.
- A **population density overlay** in the city builder.

### 1.2 Work posts and the 90% rule

- Work furniture for at least 90% of the working-age population at once; the other 10% have the day off.
- A day off is spent at: the market (household goods), a tavern or another's house (socialize), a shrine (pray), the
  arena (entertainment), a park (relax), the funerary district or the Ancestry canton (honour the ancestors), home
  (childcare), or a mix. Each such task is a piece of furniture (or a place) with a **capacity** and a **pull weight**.
- Deliverable once interiors and roles exist: a report and census, and a table with a row per job type and a column per
  furniture kind, with capacity, placement counts and locations.

### 1.3 The day and the week

- Shift start about 07:00–08:00 for most; later for some (night watch). Shifts 8–12 h by trade; farmers' and miners' days
  longer and harder, many of them slaves. After the shift, a few hours for needs, then bed until morning.
- Seven-day week; the seventh day is a rest day: only essential workers (guards, animal tenders...) and market workers
  work it, and get the next day off. Others attend to needs or go to the arena.
- Arena games on days 3 and 7 ("Wednesday and Sunday"); about half the animals and gladiators fight that day.

### 1.4 Needs, happiness, personality

- Needs: **eat, drink, socialize, relax, contemplate, sleep (NPCs only at first), material**. One task may fill several
  (a tavern: eat/drink, socialize, relax, each to a degree; the Ancestry canton: contemplate and relax).
- What fills a need varies by culture (a beast rider gets nothing from a Vothic shrine; relaxes with the mount,
  contemplates at a nature shrine) and by trade (warriors and monks need less material; monks and pilgrims more
  contemplation, less socializing). PCs: sleep off at first, lower material sensitivity.
- Each citizen has an unmet-need meter per need, ticking up over time. Unmet needs → unhappy → less efficient at work →
  eventually disloyal (fights, migration).
- Hunger and thirst creep up through the day; heavy labour raises thirst more and hunger a little. One meal in the
  morning and one in the evening (drinking at both); a drink during the shift means leaving work for a **well**
  (public or private; add wells around the map) to fill a waterskin (manual workers carry one).
- One personality trait each (chatty, loner, ascetic...): more happiness from some needs, or less unhappiness when they
  go unmet, about ±33%.
- Census: jobs worked by category during the workday and their average efficiency; average happiness by worker type
  and by social class.

### 1.5 Items, inventory, equipment

- Money is abstract. At market a citizen buys what fits their social class; fancier meals (more hunger filled, a
  relaxation bonus) by wealth score.
- Tools: one per job type (orchards, grain farms and mushroom farms may differ); a worker owns it or takes it from a
  rack at work (judgement: a warrior or caravan guard owns arms and armour, a town guard draws them; nets stay on
  the boat). A tool that wears out during the shift is replaced at the next opportunity **during work time**, never
  on time off. If no shop sells a tool, say so.
- Injury: a small chance per working day; the worker buys a poultice at an alchemist.
- Arms and armour for warriors, guards and wealthier citizens.
- Clothes: shirt, pants/dress, shoes; each citizen owns a number of sets rising with wealth, kept at home, wearing out
  (faster when worn); buying a set to keep the number, unhappy (material meter) when they cannot. Luxuries and
  household goods also fill material.
- Infinite inventory. Slots: torso, legs, feet, head, left hand, right hand. Torso and legs take one clothing item plus
  one armour item each; feet take shoes **or** armoured boots; head takes a hat, hood or helmet.
- Items other than food carry a wealth rating and stats that set price; all null for now except wear.
- Food: each item is one serving; two different foods cook into a meal worth 3× hunger and happiness. Voth foods: corn,
  peppers, mushrooms, fish, eggs, bread. Wheat must be baked into bread, and yields more to compensate. Crops are
  assigned to farms.
- Chinampa workers mostly live on the chinampas and carry a kayak, used automatically on water.
- Workers live close enough to their work to arrive on time, on foot or by transit.

### 1.6 Production, storage, transport

- Productive sites make items (food, metal...) into a fixed on-site store; carts move goods to warehouses (infinite,
  prefer the warehouse with the least of that good); from there to a settlement-wide store that markets draw on. A
  second porter layer (warehouse → market) later.
- Carts: fixed capacity (~500, to tune), prefer the site whose resource is most in demand (low store, high turnover),
  then the site with the most stored that no other cart is bound for, then the closest. Start with 50 carts.
- Off-map imports (herbs, charcoal or wood, cloth, wood...) by barge, ship and caravan: when a good will run out within 3
  days, a shipment spawns, delivers, leaves the way it came and despawns. Later these are world-map shipments a player
  can intercept.
- Caravans: deliver to a warehouse low on their goods, wait at the caravanserai, buy the good the city has most of
  with positive production, leave. 3–5 horses, oxen or beetles; per animal one driver and two guards; loose formation
  following the leader. River barges: same deficit/surplus logic, load and leave upriver at once; 6 bargemen, 2 guards.
  Ships: crew and capacity by size; Voth, Hykkousoi, Islander and salvager vessels may visit.
- Vessels avoid each other and structures (port original Voth's avoidance); pedestrians, carts and caravans respect
  land vs water.

### 1.7 Special populations

- **Guards:** patrol avenues and markets, circuit the side streets; watchhouses east, west, south and central (canton)
  issue equipment at shift start; man the walls; fewer night watchmen with lanterns. Crimes: pickpocketing, burglary,
  assault. 1 in 1000 citizens is a criminal (burglary, pickpocketing at markets); better odds unobserved, much better at
  night. Caught → the victim shouts, guards converge, the criminal flees; arrested → nearest watchhouse, garrison or the
  Fortress, one week. Assault: fights from unhappy citizens, the PC, rarely a hostile NPC faction; guards arrest the
  instigator (complies: 1 week; resists and survives: 1 month; murder: death).
- **Ordinators:** patrol markets and avenues, not neighbourhoods (except special tasks); guard the Palace and Temple;
  a coast-guard flagship patrols the harbour and docks at the Fortress for shift change; elite stats and gear. Ordered
  by the high priest, Tzintzun, their commander: hunt enemies of the state (History Monks), heavy backup against the PC,
  assassination of a hated trespassing PC.
- **Monks:** more contemplation, less of the rest; a fixed monastery schedule (early rising, prayer thrice daily at
  the chapel, communal meals, evening study); 10% wander the city's shrines and the Temple each day, all of them on
  the rest day.
- **Priests** live at shrines, chapels and the Temple; daily rituals raise visitors' contemplation; blessings raise
  happiness.
- **The high priest** (after the Temple interior): a ceremony schedule that triggers city events (the noon sacrifice
  on games days opens the arena); human sacrifice of captives held in a Temple cell, replenished by ship; on other days
  a circuit of shrines and monasteries, nearest least-visited first.
- **Arena:** a starting stock of animals and gladiators; original Voth's bout code, but a would-be death is a 66%
  chance of injury instead (poultice plus a week's rest); at 50% stock a ship brings a cohort.
- **Fishing boats** (original Voth's): collect fishermen by day, fish, land fishermen and fish at the dock by evening.
- **Water taxis:** 1 pilot, 8 passengers; go to the ferry dock with the most waiting that no other taxi is bound for.
- **Pleasure barge:** 20 upper-class passengers, 4 crew, 1 captain; the party fills relax, socialize, eat and drink.

### 1.8 Beyond the city (later phases)

- Production chains (the owner's list; see part 2, phase G, for the proposal): animals → hides, meat, fat → leather
  goods, waterskins, saddles, whips; fibre crop → cloth → clothes; wax or fat (+ wood) → candles and lanterns
  (long-lived); copper → electrical components → generators, wiring, gadgets; iron + flux + fuel (fuel by altitude) →
  steel → high-grade gear; ancient alloys (ruins only) → the best weapons; spice plants → spices; ranj tree → resin →
  smoke or tincture; brewable crops → beer, ale, vodka, sake by crop; pipeweed → cured → smoked; crude oil → petrofuel
  → electricity; wood, stone, iron, bamboo, scrap by culture; blueprints (Kenshi-like) and maybe a tech tree; scrap ±
  electrical ± relic components → repair or make artifacts; relic components (power cells, CPUs, servos, nanomodules,
  biogel, sensors); rare earth + electrical → power cells (Geomancers); biogel + gene recipe → gene mod; relic parts +
  cybernetic recipe → cybernetic mod; artifacts found in arcologies may need parts from another, or a tinker.
- A player outpost or city supplying a demanded good as a viable play; artifacts giving free power or production.
- Factions: tax demands in claimed territory (relation up or down; aid during raids; full membership by a loyalty
  quest); bandit and tribal factions raid or demand tribute on a spectrum; hostile factions (screamers, lizardmen,
  ghouls, mutants, renegade robots) always raid unless intimidated; challenge starts (play a lizardman); conquest at the
  top end (needs artifacts: a missile launcher against Iziz mechs).
- Party PCs vs faction NPCs, moved freely between the two; recruitment (taverns, quests, unhappy citizens, captives,
  slaves, hire) sets loyalty, efficiency and flight risk; enslaving a faction's people angers it when found out.
- NPC caravans to a large player settlement, with ordered goods at a premium; caravans raidable on the world map
  (piracy, sieges, tribute); infamy for doing it for oneself, punitive expeditions; bounties the other way; goodwill
  for clearing bandits (pirates, Screamers → near-universal goodwill on the Ring Sea).

---

## Part 2. The roadmap

### 2.0 What is already there (read these first in any session)

| Need | Exists | Where |
|---|---|---|
| A world clock with hour, day, run/hold, scale | yes: `KCLOCK`, a 72-minute day; `VC.clock` in the city page, `SIM.jump()` on the slider | `core/clock/20-core-clock.js`, `55-vc-host.js:616` |
| Actors with roles, `sched[24]`, places with activity slots, hours and access, groups, events (caravans, excursions), a per-minute resolver, audits and census, export | yes, run by Mungo and Shade; **the city page uses only its transport routes** | `core/simulation/77-sim-*.js`, `SCHEMA.md` |
| Needs, inventory, items, economy | **no** (PLAN.md reserves `77-sim-6-economy.js` and sketches needs in §8.3) | |
| A pedestrian nav layer for the city | **no**: the city has `water` and `strider` grids only (`34-vc-transit.js`), plus the road graph carts use | |
| Per-building interiors from a shell, with the residence rule, a bake with fingerprints, a slot read for SIM | yes, in Mav's Refuge (`MIX`), on the interiors kit's `planBuilding` | `settlements/mavs-refuge/src/57a-c`, `kits/interiors/API.md` §7, §10 |
| Canton interiors and the cutaway | yes, cantons only; furnished lazily per canton | `40-vc-interiors.js`, `56-vc-interiors-host.js` |
| Furniture → activity slots | `SIM.slotsFromFurniture` (bed → SLEEP, anvil → CRAFT, ...), `FURN_JOBS` (16 trades), `FURN_TASKS` | `77-sim-2-places.js:57`, `kits/catalog/krator-furniture-core.js:431` |
| A census of population, workforce and jobs from the plan's numbers | yes: `VC.census()`; 52,808 people, 26,404 workforce, 26,453 jobs | `36-vc-census.js`, `TUNE.census` |
| Voth furniture: beds, chests, larders, tables, forge, anvil, loom, racks, well, altars, bunks, stalls | yes | `kits/catalog/krator-master-furniture-voth.js` |
| Food, drink, supplies, containers as catalog pieces | yes, generic (bread, fish, eggs, mushrooms, produce, ale, water, medicine, herbs...) | `krator-master-furniture-generic-goods.js` |
| Vessels: taxi, pleasure barge, dhow (fishing), ferry, barge, hulk, junk; Hykkousoi, Islander, salvage, Iziz, Xanadu ships | yes | `kits/ringsea`, `ringsea.py` |
| Ship avoidance, arena bouts, fishing dhows, monks, temple, trade, citizens | in original Voth, as reference code | `settlements/voth/src/78a–j` |
| Buildings the brief assumes | **missing:** watchhouses, caravanserai, a coast-guard dock, weaver, tannery, brewer, butcher, a bakery outside the Granary | |

### 2.1 Rules for every phase

1. `core/simulation/PLAN.md` §5 holds (data first, `SIM`'s own RNG, decisions per simulated minute, poses as
   functions of time, everything in `SIM.export()`, `window._sim` diagnostics).
2. Every number the owner may want to tune is in `TUNE` (`15-vc-tune.js`) or a `world/*.json` overlay, never a literal.
3. Every phase ends with a **report** the owner can read in the page (a panel) and in `verify.py`'s output: what was
   placed, what fell short, and where. Deficits are the product; "it should be easy to tell what a citizen wants and
   where deficits lie" is the acceptance test of every phase.
4. Each phase is one to three sessions; a session ends with the page rebuilt, `verify.py --assert` passing, the port
   baseline refreshed for the two streetlab pages, and `HANDOFF.md` updated.
5. No build hashes change for a step that only re-expresses data (PLAN.md Phase 2 acceptance).

### 2.2 Phase A: interiors for every building, the density overlay (2 sessions)

The brief's first ask. Port Mav's Refuge's `MIX` to the city as `VC.IX` (a new `41-vc-building-interiors.js` data
fragment and `57-vc-building-interiors-host.js` host fragment), on the interiors kit.

1. **Shells.** Every lot building (`PLAN.lots`: poor, middle, rich, manor, shop, craft, tavern, clan, farm, civic,
   warehouse, industrial, garrison, muster, power, armoury), the chinampa huts, the village, the farmsteads, the
   monastery's dorms and the Voth landmark models (shrines, lighthouse, funerary temple, House of Healing) get a
   footprint polygon, storeys and street doors from their records. The captured Voth kit models have no plan data: the
   first session writes a `shellOf(building)` that derives the shell from the model's capture boxes (as `CANT.index`
   does for cantons), and a table of overrides for the kit keys where that fails.
2. **Programmes.** A Voth building programme table (`TUNE.ix.programmes`): class → room kinds per storey (poor: cottage;
   middle: living + bedroom(s); rich and manor: hall, bedrooms, kitchen, study; shop: shop below, dwelling above; craft:
   workshop below, dwelling above; tavern; warehouse: store; industrial: workshop + store; garrison: barracks, armoury,
   mess; civic by kit). A Voth interior set (`kits/interiors/sets/voth.js`) naming the Voth pieces for each role.
3. **Furnish and the residence rule.** `planBuilding` + `furnishRoom` per unit, the residence rule at one bed, one item
   store and one food store per 2 residents (`TUNE.ix.per`), bedrooms first, then a dining room. Residents come from the
   census (`TUNE.census.live` by class). **Shortfall** (beds < residents/2, or no room for a dining space) is a record
   on the unit and a line in the report, never a forced placement.
4. **Bake.** As Mav's: `bake_interiors.py` writes `interiors-bake.json`; the fragment uses the bake when the unit's
   fingerprint matches, else computes near the camera first. (The city has ~2,000 units; the bake is what keeps the
   page's load time.)
5. **Cutaway for all buildings.** `VC.cutBar` gains any building under the cursor: the clipping planes and the storey
   stepper already work per group; the building's group is made on demand from its record.
6. **Density overlay.** A builder step view: residents per hectare per lot, a diverging ramp (`dataviz` rules), the
   shortfall units hatched; a legend with the totals. A second mode: workplaces per hectare.
7. **Report.** `_sim`-style: units, rooms, pieces, beds/stores per unit, shortfalls by class and district, and the job
   table of 1.2 (rows: job types from `TUNE.census`; columns: furniture kinds; cells: capacity, count, where).
8. **New Voth kit models** (the owner's Q4 answer): a watchhouse, a caravanserai, a coast-guard berth, a weaver's, a
   tannery, a brewery, a butcher's and a bakery, as kit pieces in the Voth building catalog
   (`kits/catalog/krator-master-buildings-voth.js`, through `capture.py` where a Voth-page model is the source), each
   with a shell the interiors planner can read. Placed in phase B.

Acceptance: every building opens in the cutaway; the report's shortfall list is reviewed by the owner; the inspector
names any piece.

**Session 1 (2026-10-12), what was built and how it differs from the plan above:** `41-vc-building-interiors.js` and
`56b-vc-building-interiors-host.js` (not 57: that number was taken). Items 1 (for the lots), 2, 3, 5, 6 and 7 are done.
Item 4, the bake, turned out unnecessary for the lots: a lot's building is its kit model, so the city's 8,050 buildings
are 111 types, each planned and furnished once in the model's frame (about 6 s at load). The shell comes from the model's
boxes (the main block; round blocks as their inscribed square; a fallback of 60% of the footprint for 18 types, listed).
A home's bedrooms are `chamber`s that take up to four beds and their stores. Left: item 1 for the non-lot buildings,
item 8 (the new models), the fallback overrides, the Palace and Temple.

### 2.3 Phase B: places, work posts, wells and the missing buildings (1–2 sessions)

1. Every unit becomes a `SIM.place` with activities from its furniture (`SIM.slotsFromFurniture`, extended: `rack` →
   DRAW_TOOLS, `larder`/`store` → STORE, `well` → DRINK, `stall` → BUY/SELL, `prayer_mat`/`altar` → WORSHIP, `bench`
   in a park → RELAX, `tomb`/`ossuary` → HONOUR, `training_dummy` → TRAIN). A `pull` weight per activity per place
   (`TUNE.sim.pull`) for the off-day choice.
2. **Work posts vs the 90% rule:** the audit counts work slots per job type against 0.9 × workforce by type; a short
   type is a report line with the buildings that could take more posts.
3. **Wells:** `VC.wells` places `voth_well` on plazas, market squares and at ~every 150 m of residential street
   (`TUNE.wells`), private wells in manor and clan courtyards; each a DRINK place.
4. **Missing buildings** (the owner: new models, made in session A, placed here): four watchhouses at the east, west
   and south district centres and in the Fortress, a caravanserai by the land gate, a coast-guard berth at the
   Fortress, and the trades the chains need (weaver, tannery, brewer, butcher, bakeries) as `craft` lots with their own
   kit pieces.
5. The job table of 1.2 is produced here in full, in the page and by `verify.py`.

### 2.4 Phase C: citizens, schedules, needs, happiness (2–3 sessions)

1. **Pedestrian nav layer** (the precondition): streets (`SL` ways) + plazas + park walks + spans, causeways and canton
   decks + each building's `graph` from `planBuilding` + the interior stairs, as the `NAV` contract; `SIM.nav.layer
   ('pedestrian', ...)`. Chinampa cells on `water` for kayaks. Land vs water is the layer; nothing else enforces it.
2. **Population as actors.** `SIM.populate` from roles derived from the census: one role per job type and class
   (`roles.json` generated by the build, overridable), `count` from `PLAN.census.byJob`, homes dealt by nearest
   housing of the class within `TUNE.sim.commute` (walk or transit minutes), chinampa workers to chinampa huts.
   52,808 actors as records (question Q1): the decision step is already rate-limited (`SIM.STEP_MAX`), and the page
   embodies only those within `TUNE.sim.embodyR` of the camera (`77-sim-7-lod.js`, PLAN.md Phase 5).
3. **Schedules and the week.** `KCLOCK` gains `weekday()` (day % 7); roles get `sched` per weekday class (work day,
   the worker's rota day off (one of days 1–6, dealt by actor index), rest day, the day after a worked rest day); shifts
   per trade in `TUNE.sim.shifts` (farmers, miners 12 h from 06:00; night watch 20:00–04:00; market and essential
   roles on the rest day). A `slave` class (70% of farm and mine labour, `TUNE.sim.slaveShare`) housed at the site, no
   market trips, no material need, its happiness counted apart.
3b. **The test clock.** `KCLOCK.scale` from the page (a "fast" control: 20× and 60×) with `SIM.step` catching up by
   simulated minutes, so a week runs in minutes; the census and economy panels sample per day for the stability check.
4. **Needs** (`core/simulation/77-sim-6-needs.js`): per actor a meter per need, rates per trade and culture
   (`TUNE.sim.needs`), fill tables per activity (the tavern fills eat/drink/socialize/relax by degrees), the
   personality trait as a ±33% multiplier, happiness = f(meters), efficiency = f(happiness), loyalty bands (unrest,
   migration) as PLAN.md §8.2–8.3 scores with bands. Hunger and thirst with the labour multiplier; the midday well trip.
5. **Resolver changes:** after the shift the actor picks the activity whose meter × pull is highest among what is open
   and reachable in the hours left (one extra clause in `SIM.decide`); sleep at home.
6. **Census** panel: jobs worked by category now and their mean efficiency; happiness by trade and class; the unmet-need
   histogram; deficits named (which need, which district, which place is full).

### 2.5 Phase D: items, inventory, equipment, shopping (1–2 sessions)

1. `core/simulation/77-sim-6-items.js`: item kinds (`items.json`): food ×6 and meals, tools per job type, waterskin,
   kayak, poultice, clothes (shirt, legs, shoes) with wear, armour (torso, legs, boots, helm), hats and hoods, lamps,
   luxuries and household goods; `wealth` and `stats` null, `wear` live.
2. Actor inventory (unbounded) and the six slots with the brief's rules; clothes stored at home, the set count by wealth.
3. Wear per worn day and per worked day (`TUNE.sim.wear`); the replacement trip during work time; the clothes trip on
   time off; the material meter.
4. Shops: alchemist (poultices), smithy (tools, arms), clothier (clothes), provisioner and market stalls (food, goods),
   trader (luxuries). Stock is **abstract in this phase** (always available, every purchase logged as demand by shop),
   so deficits of shops, not of goods, show first. The report lists tools no shop sells.
5. Meals: the morning and evening meal at home from the food store (two foods → a meal), or at a tavern or stall.

### 2.6 Phase E: production, stores, carts, imports (2 sessions)

1. `77-sim-6-economy.js` (PLAN.md's reserved slot): goods (`goods.json`), a store per place with a capacity, production
   per worked slot-hour × efficiency, consumption per purchase and per meal, the settlement store, turnover and days-left
   per good.
2. Crops assigned to fields (`TUNE.farms.crops`: wheat, corn, peppers; mushrooms at the mushroom farms; fish at the
   docks; eggs at the beetle ranches; bread at the bakeries from wheat).
3. **Carts** (50): a `cart` role on the `road` layer, the brief's pick order, the lowest-stock warehouse rule; the
   warehouse → market porters later.
4. **Imports:** `days-left < 3` spawns a `SIM.event` (the schema's `caravan` kind, by the goods' route: sea, river or
   road), with the brief's crews and the caravanserai stay; departure by the same port.
5. The economy panel: per good, stock, production, consumption, days left, imports in flight; per site, its store and
   the cart bound for it.

### 2.7 Phase F: guards, Ordinators, monks, priests, arena, boats (3 sessions)

1. Guards and night watch: orgs, watchhouses as DRAW_TOOLS places, patrol routes as `cycle` over avenue and market
   places, wall posts; the crime model (criminals as a role on 1‰ of actors, a per-minute attempt, observation odds by
   hour and witnesses, the alarm as a `SIM.event`, arrest, the jail as a place with a stay).
2. Ordinators: Palace and Temple posts, the avenue circuit, the flagship on a transport route Fortress → harbour → Fortress.
3. Monks and priests: the monastery schedule, the 10% wanderers, the rest-day procession; priests resident at shrines
   with a RITUAL activity that multiplies visitors' contemplation fill.
4. Arena: port `78j`'s bout state machine as an arena place's event on days 3 and 7, injuries instead of deaths, the
   cohort ship at 50% stock; spectators from the off-day pool.
5. Fishing dhows, water taxis, the pleasure barge as transport routes or excursions (the schema's `excursion` kind),
   passengers through `SIM.board`.
6. Vessel avoidance: `lifeAvoidNudge2` from `78b` as a **visual** offset in the embodiment (PLAN.md §4.5: never a
   decision input); the phase sweep asserts zero berth conflicts.
7. The high priest waits for the Temple interior.

### 2.8 Phase G: chains, factions, the player faction (beyond the city page; PLAN.md Phases 4–6)

These are world-level and belong in `core/simulation` with `world/*.json` per settlement, not in the Voth page's
fragments. They are scheduled after F and each is its own plan when reached:

1. **Production chains** across cultures. The proposal, against what the materials and catalog systems hold today
   (`core/materials/PLAN.md`, `kits/catalog/*goods*.js`, `biomes/FRUIT.md`):

   | Chain | Raw (exists?) | Intermediate | Goods | Gap |
   |---|---|---|---|---|
   | Animals | beetle ranches (yes); hides, meat, fat (no items) | leather (material `hide` exists) | leather armour, clothes, waterskins, saddles, whips | items, a tannery, a butcher |
   | Fibre | cotton, flax, wool: **no crop anywhere** | cloth (`cloth.plain`, `cloth.canvas` exist) | clothes | a fibre crop per biome, a weaver building |
   | Wax or fat | no | candles (`generic_candle_supply`), lamp oil (`generic_lamp_oil`) exist as supplies | lamps | the source items |
   | Copper | no ore; `metal.bronze` exists | electrical components | generators, wiring, gadgets | an ore, a mine kind |
   | Iron, steel | mines (yes), iron (`metal.iron`), fuel (`generic_fuel`); flux: **recommend dropping flux** | steel | high-grade gear | smelter building; altitude → fuel rule |
   | Ancient alloys | ruins only | — | best weapons | arcology loot tables |
   | Spices | Xanadu spicer exists (`87-xa-spicer.js`); clove, nutmeg, pepper: no plants | spices (`generic_condiments`) | cooking | spice plants in a biome |
   | Ranj | **no tree, no item** | resin | smoke, tincture | the tree, the items |
   | Brewing | wheat, corn (yes), alecap, rice (no); brewer piece `voth_craft_brewer`, `voth_trade_still` exist | — | beer, ale, vodka, sake (`generic_ale`, `generic_spirits` exist) | a brewer building, rice and alecap |
   | Pipeweed | **no** (`generic_tobacco` exists as a supply) | cured | smoked | the crop |
   | Oil | no | petrofuel | electricity | wells, refinery (Locus has refinery carts: a model) |
   | Wood, stone, bamboo, scrap | `wood.*`, `stone.*`, `wood.bamboo`, post-apoc scrap exist as materials; sawyer and mason yards exist as pieces | — | furniture, buildings, goods by culture | items only |
   | Relic parts, rare earth, biogel | no | power cells, mods | artifacts | all |

   The biome fruits (43 catalog fruits across 13 biomes) are the one chain already fully itemised; the plan should make
   them the model for every other raw good (a biome species tagged `HARVEST` → a catalog piece → a store).

2. **Blueprints and tech:** a `recipes.json` kind (inputs, tool, place activity, knowledge) is enough for Kenshi-style
   blueprints; a tech tree is deferred until a second settlement runs the economy.
3. **Factions, tax, raids, tribute, infamy, bounties:** PLAN.md Phase 4 (relations, presence) plus a `claims.json`
   (territory polygons) and a monthly `SIM.event` per claim; aggression as a band on the relation score.
4. **Player faction, party PCs, recruitment:** PLAN.md Phase 6; the North Crater test.
5. **World-map caravans, interception, sieges:** needs the scale model's region streaming (`openworld/`) and the
   SupplyRoute records; the last item.

---

## Part 3. Questions for the owner, and the answers (2026-10-12)

**Answers given:**

- **Q1 Scale: individuals**, all 52,808 as records, and **every one of them stepped by the simulation whether or not it
  is embodied** (the decision step runs for all; only the embodiment is distance-limited).
- **Q2 Pace: yes**, keep the 72-minute day and add the fast test clock; it is wanted especially for fast-forwarding
  weeks to check long-term economic stability (phase E's acceptance runs on it).
- **Q3 Truth: see the shortfall first.** The census stands through phase A; the report and overlay show how far the
  beds fall short, and the owner decides after reading it.
- **Q4 Missing buildings: make models in session A** (new Voth kit pieces for the watchhouse, caravanserai, coast-guard
  berth, weaver, tannery, brewer, butcher and bakery; placed in phase B).
- **Q5 Slaves: yes to all of it.** About **70%** of farm and mine labour is enslaved; the Temple's sacrificial captives
  are the same pool (a `slave` class; the Temple cell draws from it).
- **Q7 Shops: abstract stock** in phase D.
- **Q8 The day off: a rota, one day off in the six workdays** (each worker is off on one of days 1–6, so a sixth of the
  workforce is off on any workday; day 7 is the rest day for all but essential and market workers). The 90% work-post
  target of 1.2 stands as the capacity rule; the rota's 83% attendance fits under it.

**Still open (the recommendation in the question stands until the owner says otherwise):** Q6 (class wealth bands and
clothes counts), Q9 (guard numbers and the day/night ratio), Q10 (arena starting stock), Q11 (import ports and the first
import goods), Q12 (order: phase A next, Palace and Temple when the references arrive).

**The questions as asked:**

**Q1. Scale.** 52,808 citizens as individual records (each a few dozen numbers: fine for the per-minute stepper) with
only the ~300 nearest embodied, or one record per household (~9,000) with the household's meters shared? *Recommend
individuals:* the deficits you want to read are per person and per post, and the census already counts people.

**Q2. Pace.** The world day is 72 real minutes (a 12-hour shift is 36 minutes; a week is 8.4 hours). Keep that for
play, and add a fast test clock (`KCLOCK.scale` 20–60 for a day in a minute or three) for the reports? The needs
rates will be tuned against the world day, not real minutes.

**Q3. Which number is the truth.** Today population comes from `TUNE.census.live` per class (a poor house: 7). Once
interiors exist, the beds say what fits. After phase A, do the beds set the population (a poor house holds what its
beds hold, the census drops), or does the census stand and the shortfall is reported and the house enlarged later?
*Recommend the latter, as the brief says ("make note of it"), with the overlay showing it.*

**Q4. The missing buildings** (watchhouses ×4, caravanserai, coast-guard berth, weaver, tannery, brewer, butcher,
bakeries). Reassign existing kits (a barracks variant, a clan compound with a yard, craft lots relabelled) now, or wait
for new Voth models? *Recommend reassign now;* models can replace them in place later since the records stay.

**Q5. Slaves.** "Many farmers and miners will be slaves": a `slave` class housed in dorms at the farm or mine, no
market trips, no material needs, their happiness counted separately (and a revolt band later)? Share of farm and mine
labour that is enslaved (half?), and whether the Temple's sacrificial captives are the same pool.

**Q6. Classes and wealth.** Use the lot classes as the wealth bands: slave 0, poor 0.2, middle 0.45, shop/craft 0.5,
rich 0.75, manor and clan 0.9, with the Palace household at 1? Clothes sets 1/2/3/4/6 by band?

**Q7. Shops in phase D.** Abstract stock (every purchase succeeds and is logged as demand) until phase E, so the first
deficits reported are "no shop sells X" and "the clothier is 40 minutes away", not "out of stock"? Or stock from day one?

**Q8. The 10% off.** Fixed per day by rota (each worker is off every tenth working day), or a daily draw? *Recommend the
rota:* deterministic and legible ("day off on day 4").

**Q9. Guards.** The garrison lots (240) and barracks (90) are the city guard, the Fortress's 300 the Ordinators, and the
watchhouses only issue gear? Target ratio about one guard on the street per 150 citizens by day, a third of that by night?

**Q10. Arena stock.** Starting counts: gladiators 40, animals 24 (the Arena interior holds 4 stables and 4 dorms today)?
The cohort ship brings 50% of the start?

**Q11. Where imports enter.** Sea goods by the harbour's edge port, river goods by the river's, road goods by the land
gate's road port (the transit ports exist). Confirm, and name the first import goods for Voth: herbs, charcoal, cloth,
wood, salt?

**Q12. Order.** Start phase A next session, with the Palace and Temple interiors inserted when the references arrive
(their programmes can be stubbed as `skip` today)? Anything in part 1 you want pulled forward (wells and the density
overlay are cheap and could ride phase A).

---

## Housekeeping left from the 2026-10-11 session

- The Port's "disconnected dock": three Voth-lifted harbour piers root in water near (759,−588), (767,−654), (788,−785);
  trim or reconnect them (`VC.inCanton` now stops city piers short of the cantons; Voth's own `PIERS` are not re-tested).
- ~~Run both verifies and refresh the two streetlab baseline rows~~ done 2026-10-12: the site page passes; the city page
  failed on the empty decks and the monastery (both fixed) and still fails on two embassies and the Arena and Fortress
  walks (`HANDOFF.md`). The two streetlab rows of `PORT-BASELINE.json` are refreshed; 91 other pages differ from it.
- Screenshots not yet taken: the Fortress (black, flames, dome drums, dungeon storey), the Arena gateway and beasts,
  the Port decks, the shoreline, the park grass, the House of Healing, the monastery compound, interior lights at night.
- README/HANDOFF do not yet describe the Fortress dress, dungeon, gateway wings and beasts, regild, dome drums, homes,
  grass, shoreline, House of Healing, monastery compound, `capturedHit`, `causewayClear`, furniture picking,
  interior lights and the cutaway bar.
