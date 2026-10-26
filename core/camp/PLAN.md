# core/camp: bands, camps and the journeys between them (plan, 2026-10-20; owner's answers 2026-10-26)

**Status (2026-10-26):** the census and the pitch are built (part of C1: `README.md`, `node core/camp/test-camp.js`),
with their first consumer, a Raptor band's camp in the isle demo (section 10, "The first build"). The rest is a plan.
It is written against `origin/main`'s `core/simulation` (settlements, trade
between settlements, the three levels: `77-sim-6-economy.js` `SIM.settlement`, `77-sim-6-trade.js`,
`77-sim-7-lod.js`).

**Settled by the owner (2026-10-26):**
1. **Nomad camps move here from `core/hamlet`.** Hamlet keeps its fixed villages.
2. **The record kinds go into the sim's schema** (`core/simulation/SCHEMA.md`), as kinds the sim registers (section 2).
3. **The folder is `core/camp`; the global is `KCAMP`.**
4. **Every tribe that rides land beasts roams.** Many of them are settled in a town for part of the year: the
   seasonal home (section 5). The Beast Riders' kit has a tent set already (section 3).
5. **The flyer tribes roam too, and they camp in trees.** That needs a module addition of its own: canopy camps,
   section 4.1.
6. **The caravan houses:** three Izani merchant houses, named procedurally from the tongues file (section 6.2). They
   use pack oxen and horses. A state-sponsored expedition sometimes takes mechs.

**Settled by the owner, second round (2026-10-26):**
7. **The Chichani caravans** use elephant bugs, beetles and horses.
8. **The Beast Riders are home in the wet season and roam in the dry.** Their homes are Pinnacle Rock, Girder, Mav's
   Refuge and the new settlement of **Talon** (scale model px 754,430). A few bands camp in the ruined Imperial forts
   in their territory: **Fort Kreia** (px 777,406) and **Fort Ordo** (px 788,501). **Fort Vaklu** (px 712,582) is in
   Iziz's hands and is not a Beast Rider site.
9. **Nusidi** (px 724,540), a half-ruined Izani colony, is raided back and forth by Iziz and the Beast Riders: a
   standing contest the raid rules must keep balanced (section 6.1).
10. **The flyers camp in any tall stand where the air pressure lets their mounts fly** (section 4.1).
11. **The Godsgate is on the scale model**: a 6.0 km pass at 0.75 atm, on the road south to Xanadu.

**The first build** (owner, 2026-10-26): a Raptor band's camp in the isle demo, with the region grown a little into
the mainland jungle, to test the camp and its interactions (section 10, "The first build").

The questions still open are in section 12.

A core module for **groups that live on the move, and the camps they pitch**:
- **Nomad bands** (40 to 70 people and their beasts) wander a territory. They pitch camp at a site, hunt, gather,
  graze and sometimes mine there, strike camp and move on.
- **Leaders' camps** are a faction's seat: hundreds of people, the advanced trades, and few moves a year.
- **Raids:** bands gather into a raiding camp of hundreds, pick a settled target, strike it and go home with the
  spoils. Sedentary raiders (the Painted Men, the Screamers, the Free Giants, the Lizardmen, the Yeti, the Fellgangs and
  the north-western bandit factions: owner, 2026-10-26) split a war band off a
  town instead, and it comes back to the town.
- **Caravans** carry a trading faction's goods between settlements. They stop at caravanserais or pitch a night camp in
  the wild.
- **Expeditions:** a nation sends a party to a distant ruin, node or crop for relics, rare ore or reagents.
- **Later, armies:** an army camp is a raid camp at a larger scale, laid out in rows.

The player meets every one of these on the world map. Each can be traded with or, if hostile, fought.

**One idea runs through all of it.** A **band** is a settlement that moves. A **camp** is the layout it pitches. A
**venture** is a journey with a purpose. Wandering, raiding, trading, expeditions and (later) campaigns are all the
same machine: a band or a detached party moves between sites on the world map, carries its stock with it, and pitches a
camp of a known kind where it stops. They differ only in where they go, why they go and what the camp holds.

## 1. Why a core module, and where the line runs

**What exists, and what this module takes from each:**

| Module | What it already gives | What this module does with it |
|---|---|---|
| `core/simulation` | `SIM.settlement`; an economy and books per settlement; carriers between settlements with in-transit books (`SIM.trade`); the record, abstract and presented levels (`SIM.level`); groups and itineraries (`SIM.event`, `groupLeg`); factions, orgs, relations and `SIM.stance` | A pitched camp **is** a `SIM.settlement` while it is loaded. A caravan **is** a `SIM.trade` carrier on land. A march column **is** a `SIM.group`. The module owns what the sim lacks: the **world tick** for groups nobody has loaded, and moving a settlement |
| `core/hamlet` | separable census, program and siting (`KHAMLET.census`, `program`, `siteFor`); `gatherAt` and `fieldCapacity` (pasture, fish, salt); OBB overlap (`rect`, `overlap`); `idHash`; the felling clock (state as a pure function of the day) | Read in place for ground, gathering and overlap. A camp's census runs the other way to a village's (section 3), so the camp gets its own census and layout |
| `core/space`, `core/rand`, `core/tags`, `core/sched`, `core/clock` | `KSPACE` overlap; `KRAND.hash` and `child`; the `KTAGS` registry; `KSCHED.timeline` and `formation` (pure of t); `KCLOCK` world days | Every placement and decision as the house rules say. Pitching, striking and the march are `KSCHED` timelines. The cycle runs on `KCLOCK` days |
| `kits/scyvoi`, `kits/desert-nomads`, `kits/ash-nomads`, `kits/lizardmen`, `kits/beast-riders` | tents by size and role, chiefs' tents, trade tents, pens, pack beasts and carts (the ger cart, the pack camel with its rolled tent, the millipede with chitin frames), all registered in `core/tags`. The Beast Riders' tent set (`src/70-79`) also carries `BR_CAMP` (`79-br-camp.js`, `[G data]`): what a band of each of the twelve tribes pitches | The camp's records name these keys. The kits draw them. `BR_CAMP` is the Beast Riders' camp program, read in place. **No kit lays a camp out on open ground**: Pinnacle Rock pitches its eighteen band grounds from `BR_CAMP` in its own page code, which is the precedent this module generalizes |
| `kits/fauna`, `kits/resources`, `kits/crops` | rideable and pack traits, `lifeOf` yields and `herdedBy`; resource nodes and their grades; wild crops by climate | What a site yields to a band (section 5) |
| `openworld/*`, `tools/scale-model` | world frame `x = (px - cx) * 2000`; streamed terrain; `settlements.json` (97 places); `regions.json` (20 political polygons: Nomad Country, Scyvoi, Beast Riders, Painted Men, Screamer Country, Giant Country, Lizardmen, Free Clans and others) | Territories come from the political polygons. Sites come from the rasters. Bands and ventures are drawn at world-map distance (section 9) |

**The camps leave core/hamlet** (owner, 2026-10-26). `core/hamlet/PLAN.md` had named nomad camps as its first "other
small settlement". They are this module's, for two reasons:
1. A camp's census runs the other way to a village's. In a village, people follow the work: the works' jobs come from
   the resource. In a band, the people are given and the tents follow the households.
2. What makes a camp hard is the movement, the world tick, raids and caravans, and none of that is hamlet's business.

Hamlet keeps its fixed villages, and its plan now points here. This module reads hamlet's helpers in place and does not
copy them.

**The Godot rule** (as `core/city`'s and `core/hamlet`'s):
- Everything in this module is `[G data]`: no three.js, no DOM, records keyed by stable ids, edits as deltas by id,
  rules as plain functions on records.
- Every decision draws from `KRAND.hash(world, band, day, salt)`, never from a stream's draw order. A band's choice on
  day 412 is the same whether the world was stepped from day 0 or loaded from a save on day 400.
- Overlap goes through `KSPACE`. Every pitched record goes into `core/tags` before it is drawn. A builder draws a
  record and does not decide where it goes.
- A GDScript twin ships when Godot runs the world tick (section 10, C9). It is checked against a golden trace, as
  `ksim.gd` is against Dhelv's.

## 2. The records

**The kinds are the sim's** (owner, 2026-10-26). Each gets a row in `core/simulation/SCHEMA.md`, a place in the sim's
`KINDS` and `PLURAL` (`77-sim-0-core.js`) and in `SIM.check()`, and a section in `SIM.export()`. They are registered on
first use, as `SIM.settlement` is (`77-sim-6-economy.js`: "made on first use: an unkeyed page's registry is as it
was"). A page with no band or venture has the same registry, the same check and the same export as before. So Voth's
stocks proof, Dhelv's golden trace and the baseline do not move.

**Who owns what.** The sim holds the records (`SIM.add('band', ...)`, `SIM.all('venture')`). `KCAMP` holds the rules
that act on them: the census, the pitch, the wander cycle, the ventures and the world tick. The fragments live in
`core/camp` and are listed by any build that takes them, as `core/city`'s are.

```
faction   (core/simulation's)       plus  nomadic: true, seat: band id of the leader's camp, aggression, raidBudget
territory {id, faction, poly:[[px,py]...] (scale-model px), ranges:[range ids]}
range     {id, territory, band, poly, sites:[site ids]}          one band's share of its faction's territory
site      {id, range, px, py, x, z, kind: 'pasture'|'water'|'hunt'|'mine'|'muster'|'serai'|'night'|'base'|'canopy',
           water, slope, yields:{good: per day}, cap (person-days), regrow (days), lastLeft (day), season:[from, to]}
band      {id, faction, org, culture, tribe?, kind: 'band'|'seat'|'warband'|'caravan'|'expedition'|'army',
           pop:{adults, children, elders, warriors}, households, beasts:{key: n}, stock:{good: n},
           at: site id | null, state: 'camped'|'striking'|'marching'|'pitching', since (minute),
           leg:{from, to, route, t0, t1} | null, parent: band or settlement id, venture: venture id | null,
           home: {settlement, ground, season:[from, to]} | null}         the seasonal home (section 5)
camp      {id, band, site, formation, seed, records:[...], born, struck}       the pitched layout (section 4)
venture   {id, kind: 'wander'|'raid'|'caravan'|'expedition'|'army', faction, org, bands:[ids],
           from, target (settlement, ruin, node or site), goal, phase: 'muster'|'march'|'work'|'assault'|'trade'|
           'return'|'disband', plan:[legs], cargo:{good: n}, spoils:{good: n}, captives, losses, log:[op ids]}
op        {id, minute, who, what, args}      the world tick's decisions as a log of deltas (section 7)
```

**How the records map onto the sim:**
- A `band` that is loaded **is** a `SIM.settlement` (`id` the same), with `mobile: true`.
- Its tents are `SIM.place`s: homes, workshops and the chief's tent. Its people are `SIM.actor`s with roles from the
  culture row.
- Its `stock` is the settlement's economy store while it is pitched, and the column's cargo while it marches.

**The books stay one identity everywhere:** made + imported - exported - consumed = the change of stock, per good and
per band, over any span and across every hand-over between this module and the sim.

## 3. A band: who is in it

**The census.** A band is 40 to 70 people. The culture row gives the shares:
- households of 5 to 8 (a family tent each);
- unmarried young men, herders and guests (sleeping tents, 6 to 10 a tent);
- one chief's household (the chief's tent, which receives guests and holds council);
- one or two of each trade: the smith, the hidemaker or chitin worker, the shaman or seer, and the supply tent. Each
  trade is a role with a workshop tent.

The census deals people into households and households into tents. **The tents follow the people.**

**The beasts.** The culture row gives per-head ratios:
- mounts per warrior;
- pack or draught beasts per tent: one ger cart, one pack camel or one millipede carries a tent of a given size;
- herd per person: goats, sheep, bison, emu, ash runners.

The herd is the band's warehouse on legs (hamlet's phrase): it feeds the band (`lifeOf` yields: milk, meat, hides) and
is the most important stock it has.

**The culture rows** (`10-camp-cultures.js`). Each row names the kit's keys by role, the formations it uses, the
ratios, the move rule (section 5) and what its people do at a site.

| Row | Kit | Tents (family / sleeping / chief / trades) | Beasts | Notes |
|---|---|---|---|---|
| `scyvoi` | `kits/scyvoi` | gers and Tibetan tents / bell tent / `tent-chief` and `wagon-chief` / smithy, hidemaker, cartwright, `ger-shaman` | salamanders (riding, war, draught), bison, goats | Wheeled. The camp train is ger carts. The fire-season seat is the **baelu** (the leader's camp, section 4) |
| `nomad` (Eastern) | `kits/desert-nomads` | bayt and khaima / hide wedge / `tent-sheikh` with its guest pavilion / smithy, hidemaker, seer, supply | camels (riding, war, pack), horses, sheep and goats in zaribas | Tents ride rolled on pack camels. Water decides the cycle |
| `ashnomad` | `kits/ash-nomads` | spire tents and domes / lean-to / `tent-chieftain` and `tent-assembly` / smithy, chitin worker, shaman | beetles (riding, war, pack), millipedes, ash runners | No wheels. The tents ride on `millipede-pack` |
| `beast-rider` | `kits/beast-riders` (the tent set, `src/70-79`) | `br_tent_dome_family` and `_dome_double` / `_dome_small` / `br_tent_chief` (the barrel pavilion) and `_council` / the Scyvoi set's trades: `_shaman`, `_smithy`, `_hidemaker`, `_trader`, `_tackmaker`; `_shrine` | the tribe's mount and herd. Pens: `_corral`, `_hitch_line`, `_lunge_ring`, `_kennel_row`, `_crawler_shed`, `_mammoth_paddock`, `_spider_grove`, `_pond_nets`; thorn hedge and rail fence (`BR_RUN`) | One row with twelve **tribe** sub-rows: the program is `BR_CAMP`'s lower ground for that tribe, read in place. Every ground tribe roams and comes home to its town's ground for part of the year (section 5). The flyers (Quetzal, Wingclaw, Nightwing) camp in trees (section 4.1). The hardshell and the mammoth are not in `kits/fauna` yet |
| `lizardmen` | `kits/lizardmen` | `lc-hide`, `lc-shield`, `lc-seer`, `lc-sail` | | War camps only (a raid from the Rift, section 6) |
| `painted`, `screamer`, `giant` | none | **gap** | | War bands. The Screamers may not camp at all (a short night run from the Hexahedron) |
| `yeti`, `fellgang`, the north-western bandits | `kits/yeti` (buildings); none for the others | **gap** | | Raiders (owner, 2026-10-26): the Yeti Kingdom raids the lowlands and the coast from the Outer Wall above Farside (LORE); the Fellgangs from the fells (LORE, the tunnel wars); the bandits of the dam basins from their camps in grounded Ancient ships (Boatmurder, px 494,74). Each needs a war-camp row |

## 4. The camp: formation, pitching and striking

`KCAMP.pitch({band, site, formation, seed, ground:{ok, h}, dims}) -> camp` lays the band's tents out as records:
`{id, key, role, x, z, ry, w, d, h, household?, pending}`, the shape hamlet's records have. A `pending` key is a tent
the kit lacks, drawn as a stand-in at its box.

The tent records' ids are `band:role:index`. The same tent keeps its id from site to site, so one family's tent is the
same record wherever it is pitched, and an edit to it (a delta by id) survives a move.

**Formations** (`20-camp-pitch.js`). Each is a plain function from the census to slots:
- **`ring`**: the chief's tent at the centre or the head of the ring, family tents round a common ground, doors in
  (or to the sunrise, if the culture row says so), trades at the gap that faces the way in, pens outside on the
  downwind side, the fire and the council ground in the middle.
- **`horseshoe`**: a ring open on the water or the road side.
- **`line`**: tents along a stream or a ridge's lee where the ground is narrow.
- **`ordo`**: the leader's camp. The leader's great tent at the centre. The bands' rings stand round it as quarters,
  by rank. A market street runs from the gate, with guest pavilions for traders (the player trades here) and the
  advanced trades: armourer, saddler, physician, scribe.
- **`rows`**: a war camp or an army. Tents in streets by unit, mount lines, a feasting or command tent at the head,
  no herds. The Scyvoi's Tibetan great tent is their war band's feasting tent. Later, the Izani castra (the lore puts a
  legion camp under Hook's pyramid at game start).
- **`laager`**: a caravan's or an expedition's night camp. Carts or kneeling camels in a ring with few tents, or a
  camel line and a fire.
- **`court`**: the caravan stops at a caravanserai. It pitches nothing. It reserves the serai's slots (Verge already
  reserves caravanserai slots).

**The ground.**
- Each slot is searched near its ideal spot with `KCITY.prim.huntNear`, under `ground.ok` (slope, water, no flora
  trunk) and `KSPACE` overlap.
- The site point is the coarse site (section 5). The fine spot is found on the page's own ground when the camp is
  presented, seeded by `hash(world, band, site, visit)`. A band that comes back to a site in a later year pitches
  in the same place.
- **No tents on cliffs.** Probe-check the pitched camp the way the trees are.

**Pitching and striking** (`25-camp-strike.js`). Both are `KSCHED.timeline`s, pure functions of t:
- **Striking:** each tent goes `pitched`, then `striking` (its crew's minutes, by the tent's size), then `packed`,
  loaded on its beast or cart. The order is the culture's: outer tents first, the chief's last.
- **Pitching:** the reverse. The chief's tent is first, and the households follow in the order of the march.
- **The march column:** a `SIM.group` with members and beasts in formation (`KSCHED.formation` offsets). Scouts and
  riders go ahead, the herd goes in a cloud behind the train, and outriders ride the flanks.
- Each tent's state is a function of (strike minute, its index, its crew). The page draws a packed tent as its kit's
  packed piece (the ger cart's load, the rolled tent on a camel), so a camp can be shown half struck at any minute.
  The kits have the loaded beasts. They may need a "pitched halfway" pose per tent (question 3).

### 4.1 Canopy camps: the flyers' camps in trees

The Quetzal, Wingclaw and Nightwing bands roam like the ground tribes but camp **in the crowns** of the tallest trees,
not on the ground (owner, 2026-10-26). Their beasts roost and hunt from the air, and a camp needs height and a clear
launch more than pasture. This is a module addition of its own, `25-camp-canopy.js` (`[G data]`). The formations above
assume flat ground; a canopy camp is a graph of trees instead.

**The trees.**
- A canopy camp needs the real trees, not the coarse site. On a streamed page the flora is placement seeded by cell
  (`openworld` `85-world-flora.js`: `KRAND.hash(seed, kit, pass, cx, cz)` per 512 m tile). So the trees of any tile
  can be computed without drawing them: each with its position, species, height and crown radius, from the biome kit's
  species record.
- The coarse site (section 5) is **any tall stand where the air pressure lets the band's mounts fly** (owner,
  2026-10-26): hypertrees in the hyperjungle, the tallest species of the monsoon forest round Pinnacle Rock, or any
  other. The site table scores stands by height and spacing from the biome kits' species heights, not by pasture.
  A stand is a site only where the air pressure (the scale model's pressure field, `region.json` `pressure`) is
  within the mount's range. That range is a trait each flyer gets in `kits/fauna` (`traits.flyPressure: [lo, hi]`
  atm, to add): the giant flyers need the crater's dense air.

**The layout** (`KCAMP.canopy({band, trees, seed}) -> camp`):
1. **Choose the trees.** From the stand's trees, take a cluster whose crowns clear the canopy round them by a set
   margin. The flyers need a clear launch.
2. **The chief's tree.** The chief's platform goes in the tallest tree. The family platforms go in its neighbours, the
   trades below the families, and the perch frames on the crown tops (`br_tent_perch_frame`: the quetzals' great
   perch log, the wingclaws' two-level frame, the nightwings' hanging bar).
3. **The platforms.** A platform is a ring or a deck round the trunk at a height in the crown band, sized to the tent it
   carries. The tent stands on it: the kit's dome or pavilion on a deck, or a hanging tent where the deck is small.
4. **The bridges.** Rope bridges join the platforms: a minimum spanning tree of the chosen trees, under a maximum span.
   A tree out of reach of every other is dropped from the cluster.
5. **The way down.** Ladders or a hoist from one platform to the ground, for the band's people who do not fly.

**The rules.**
- **Walking:** the platforms and bridges are `core/walk` floors and strips (`KWALK.floor`, `strip`). The actors can walk
  the camp, and the sim's `climb` and `air` nav layers reach it.
- **Felling:** a tree that carries a camp is marked not to fell (`core/hamlet`'s felling marks), for as long as the camp
  stands.
- **Pitching and striking:** done as on the ground (section 4), with the hoist instead of the carts. The flyers carry
  the packed tents.

**Kit work.** The Beast Riders' kit has the tents and the perch frames. It needs:
- a **tree platform** (a deck on a trunk, parametric on trunk radius and deck size: `buildAsset(key, x, z, ry,
  {variant, trunkR, deckR, y})`);
- a **rope bridge** (parametric on span and sag, like `BR_RUN`'s pieces);
- a **hoist** and a ladder.

Mav's Refuge's platforms and its rookery decks are the style to follow.

## 5. The wander cycle

**The territory.**
- A faction's political polygon on the scale model (`regions.json`) is its territory. `extract_region.py` has to
  carry the political polygons into the region data. Today it carries only settlements.
- The territory is cut into one **range** per band. The cut is a seeded Voronoi on the polygon, weighted by
  carrying capacity: a band's range is however much ground feeds it, which is small in rich grass and large in
  desert.
- The leader's camp holds the best ground at the centre, or the faction's seat site (the baelu for the Scyvoi,
  Shade's basin for the Eastern Nomads).

**The sites.**
- `tools/scale-model/extract_sites.py` (new) scores the rasters (heights, slope, rain, drainage, biome) at the model's
  2 km pixel for each range's candidate sites: water within reach, flat ground, and pasture, hunting and gathering.
- It writes a site table per territory: `data/sites.json`, built and committed like the region data.
- Each site has its yields per day, a capacity in person-days, a regrowth in days and the seasons it is good in.
- **Yields:**
  - **Pasture:** `KHAMLET.fieldCapacity` where a biome kit has the `gather` tag. Otherwise rain and biome.
  - **Hunting:** the biome kit's wild fauna and their `lifeOf` yields, by density.
  - **Gathering:** `CROPS.forBiome` / `CROPS.at` wild crops.
  - **Mining:** a `kits/resources` node within reach, at its grade. It is light work: a band carries little ore, and
    the work takes workers off herding.

**The day** (a pure function, `30-camp-range.js`):
- A camped band takes from its site: its people's food, its herd's fodder and its water.
- The site's remaining capacity falls. When the band leaves, the site regrows from `lastLeft` as a pure function of the
  days since: hamlet's felling rule, no stored state.

**The move rule** (per culture row):
- A band strikes camp when the site has fewer than `minDays` of its needs left, when its season is ending (the
  Scyvoi go to the kopjes and the baelu before the fire season, then down to reap after the burn), or when the
  leader's camp or a venture calls it.
- The next site is the best-scoring one in its range by remaining capacity, distance (a move is 5 to 30 km, one or
  two days' march), season and the band's memory (not the site it just left).
- The draw is a hash, so two bands of one faction with the same scores still choose differently, and a replay
  chooses the same.

**Growth, splitting and merging.** The census drifts with births, deaths, raid losses and captives.
- A band over 70 splits at its next strike: a household group and a share of the herd go to a new range cut from the
  faction's free ground or from the weakest neighbour's.
- A band under 40 merges into a neighbour, or into the leader's camp.

This keeps the 40 to 70 rule without a cap that hides the numbers.

**The seasonal home** (owner, 2026-10-26). Every tribe that rides land beasts roams, but many of them settle in a town
for part of the year. So a band's year has two parts: a **home season** at its town and a **roaming season** in its
range. The band's `home` says which town, which ground and which days.
- **The ground is the town's.** The town reserves a camp ground for each band that comes home to it: Pinnacle Rock's
  eighteen band grounds (`settlements/pinnacle-rock/PLAN.md`, the upper and lower camp grounds) are the first. The
  Scyvoi's baelu (its raised tent platforms) and Shade's camel lines and tent ground are others.
- **The Beast Riders' homes** (owner, 2026-10-26) are Pinnacle Rock, Girder, Mav's Refuge and Talon. Each band is
  given one home. Girder, Mav's Refuge and Talon need camp grounds of their own, laid out as Pinnacle Rock's are.
  - **The ruined Imperial forts:** a few bands make their home in the ruined forts in their territory, Fort Kreia and
    Fort Ordo, pitching inside the old walls. A ruin's ground is found in its footprint, not reserved by a town.
  - **Fort Vaklu** is held by Iziz and is no Beast Rider site.
- **A band at home pitches on that ground**, by the ground's own layout. Pinnacle Rock's grounds are laid out already;
  when they move onto `KCAMP.pitch`, the band and the ground keep the same tents by id.
- **At home, the band stays its own settlement.** It does not join the town's.
  - It holds a `SIM.presence` in the town (status `RESIDENT`).
  - It trades with the town as two settlements trade, at no distance: its hides, meat and beasts for the town's grain
    and iron.
  - Its warriors can take a turn in the town's defence. Its herd grazes the town's pastures, inside its own hedge.
- **Going home and leaving** are moves like any other. The home season's start is a season end in the move rule, with
  the town as the only site. Leaving, the band takes the best site in its range.
- **Which way the year turns is the culture row's.**
  - The Beast Riders' ground tribes are home in the wet season and roam in the dry (owner, 2026-10-26).
  - The Scyvoi are home at the baelu in the fire season and roam after the burn.
  - The Eastern Nomads come in to Shade's water when the wells fail.
- **The flyers have a home too.** The Quetzal, Wingclaw and Nightwing bands' homes are Pinnacle Rock's upper grounds by
  their Wings' roosts. Their roaming season goes from canopy site to canopy site (section 4.1), over a range several
  times a ground band's, because they hunt from the air.

**Time.**
- A world day is 72 real minutes (`KCLOCK`). A stay of 3 to 12 days is 4 to 14 real hours, so camps visibly come
  and go during play.
- The year is 365 days (LORE §2). `KCLOCK` has no year or season today. This module needs
  `KCLOCK.season(day, latitude)` (a small `core/clock` addition), or the world clock's day-of-year.

## 6. Ventures: raids, caravans, expeditions

**Every venture has one life:**
1. **muster:** parties leave their bands or town and gather at the muster site, which pitches a camp of the venture's
   kind.
2. **march:** the column moves on the world map, with night camps.
3. **the work:** `assault`, `trade` or `work`.
4. **return:** the column goes home.
5. **disband:** the people, beasts and goods go back to their bands or town and into those books.

Each phase is an op in the log (section 7). Between ops, the venture's position is a pure function of t along its leg
(the sim's rule for poses).

### 6.1 Raids

**Who goes.**
- **A nomad raid:** a share of each joining band's warriors (the rest stay to herd and guard), plus their war
  mounts. The bands left behind lose those workers until the raid comes home, which is a real cost: the herd is less
  well kept and less is gathered. The muster is a `rows` camp of hundreds.
- **A sedentary raid:** a war band split off a town (a `band` with `parent` set to the town). Its warriors leave the
  town's population and jobs. The town's production drops while they are away. A town the size of Drum feels a raid
  less than a hamlet does.

**The target.** The `aggression` dial and the faction's `raidBudget` (raids a season) say when. The target is the best
by:
- the stance (`SIM.stance` hostile or wary);
- the distance (within the column's supply: days of food carried);
- the wealth (the target's movable stocks, from the sim's books);
- the weakness: `standing`, below;
- how lately it was raided (a cooldown per target and faction).

A player settlement joins the candidates by the same rules (`core/simulation/ROADMAP.md` §31, the North Crater
example). Nothing is scripted for the player.

**The goal** is per culture:
- loot (the Eastern Nomads' dune raiders, the Scyvoi on Drum);
- captives (the Screamers, who take people and convert them, so captives move from one settlement's population to
  another's);
- tribute (the faction gets a payment instead of a fight, which raises the relation);
- revenge (after a punitive expedition).

**Resolution at the record and abstract levels** (`55-camp-raid.js`). A pure function of the two sides' numbers and
a hash:
- **Raid strength:** warriors x arms x mounts x morale.
- **Defence:** the target's militia share of its adults, its garrison, its walls (from its city records: a `wall`
  record), and allies with `presence` there.
- Their ratio picks a band of outcomes: **repulsed** (raiders lose 10 to 30 per cent), **skirmish** (a little loot, a
  few dead each side), **success** (loot and captives, within the caps below), **sack** (only when the target is
  already broken).

**The balance rules.** Without the player, raids do not change who holds a region:
1. **Standing.** Each settlement has a `standing`: its strength (people, garrison, walls, stocks) over its baseline.
   The baseline recovers by a set share a week.
2. **Caps per raid.** A raid takes at most a share of movable stock (default 15 per cent), and never the staples
   below a floor (14 days of food). It kills or takes at most a share of the population (default 2 per cent). It
   cannot destroy a building at the abstract level.
3. **Only a broken town can be sacked.** A settlement can be sacked, or emptied and abandoned, only when its standing
   is under the broken threshold (default 0.4). Caps 1 and 2, with recovery, keep raids alone above about 0.7. Only
   something else (the player, a war, a famine) brings a town to 0.4. So the player can set up a sack: kill the
   garrison, burn the granary, cut the caravans.
4. **Budgets and fatigue.** Each faction has a raid budget a season. A beaten raid costs the faction morale and delays
   the next. A town that is raided often gets a garrison grant from its polity (the relation's `aid`), and the raider's
   relation with it falls.
5. **Retaliation.** A polity hit too often mounts a punitive **expedition** (6.3) at the raiders' nearest band or
   seat, under the same caps. This is the natural brake.
6. **Contested ground.** Nusidi (owner, 2026-10-26), a half-ruined Izani colony, is raided back and forth by Iziz
   and the Beast Riders. A contested site is a target for both sides at once, so the cooldown and the caps apply to
   each side. Neither can hold it for long without the player: whoever holds it when the other raids loses under the
   caps, and wins it back on its own turn. It is the balance proof's test case for a target that changes hands.

**The balance proof** (`test-camp.js`, and a `--balance` run like Voth's stocks proof). It runs the whole crater at
the record level for ten years with no player, from three seeds, and checks:
- no settlement is sacked or abandoned;
- every settlement's population ends within 10 per cent of its start, and each faction's within 15 per cent;
- raided goods total less than 2 per cent of the crater's production;
- every band stays in its territory, and none starves.

Each check has a negative: with the caps off, a town falls. It is committed with its table, and any change that
moves it says so.

**Spoils.** The loot rides home as the venture's cargo, in transit, out of the target's books (exported, under a
`raided` column so the stocks panel can tell theft from trade). It lands in the bands' or town's books when the raid
disbands. Captives are a population transfer, booked the same way.

### 6.2 Caravans

**A caravan is a `SIM.trade` carrier on land.**
- `SIM.trade` today moves goods between settlements by sea, with books in transit. A caravan is the same record with
  a land route: the `road` or `animal` layer, and the world map's highways (`roads.json`) between settlements.
- Its stops are caravanserais (`tal_caravanserai`, `zj_caravanserai`, Shade's Khan, Serai, Yuni's Caravan Gate).
- Between stops it marches by day and pitches a `laager` or `line` night camp wherever the day's march ends: 25 to 40
  km a day for camels, less for carts.

**The trading faction is an org of a civilization.**
- **The Izani merchant houses** run Talia's trade east over the passes and the Empire's roads. They use **pack oxen
  and horses** (owner, 2026-10-26: `kits/fauna`'s farm ox and horse, with packs and carts). Their caravan camp is a
  `laager` of carts with a house pavilion. Five houses. The first three were named procedurally (proposed, for the
  owner's approval and then LORE §6.2). The owner added the last two by their English names (2026-10-26), worn into
  Izani by the same rules:

  | House | Said | From | Its road and trade |
  |---|---|---|---|
  | **Goldanda** | Goldanda | *gold hand* | proposed: the bankers' house, with coin, credit and bullion on the eastern road to Yuni |
  | **Saltroda** | Saltroda | *salt road* | proposed: salt and staples from the salt pans to the jungle cities |
  | **Istberar** | Ist'berar | *east bearer* | proposed: Talia's house, with spice, relics and petrol from the desert and the abyss |
  | **Farguogar**, the Far-walker | Farguogar | *far walker* | the owner's: treks the roads **west to the Eternal State** (LORE §6.19: the trade routes over the Inner Wall) |
  | **Getmastarz**, the Gatemasters | Getmast'arz | *gate masters* | the owner's: treks **past the Godsgate, south to Xanadu**. The Godsgate is on the scale model: a 6.0 km pass at 0.75 atm. It is a hard road for any caravan beast |

  The two long roads are the houses' longest caravans: weeks on the road, most nights in a night camp, and the most
  segments through other factions' ground (danger by segment, below).

  - **How they were made.** They follow the pattern of the Izani names already in the tongues file. *Duxun* is "duke's
    son" worn into one word, so a house name is an English two-word phrase worn into one Izani word.
  - **The script.** `tools/names/izani.py` applies the "From English" table of `lore/tongues-of-krator.html` and
    reproduces every example in it that it was tested on (21, plurals included). It is run on a merchant vocabulary (a trade or a
    direction, then what the house is), with the pairs drawn by `hash('kcamp', 'iziz-houses', i)`.
  - **The same script names further houses**, and a tongue's rules written the same way would name a band or a camp
    (section 10, C0).
- **Chichani clan caravans** (owner, 2026-10-26) use **elephant bugs, beetles and horses**. Voth's staghorn beetles
  are in `kits/fauna`. The elephant bug is not there yet (kit work, section 10).
- The Republic's Salvagers' Guild runs relic and scrap convoys on `kits/motor-vehicles`' crawler and caravan truck.
- Eastern Nomad caravaneers.
- The Yuni, with the desert nomads (LORE §11).

**Other rules:**
- The org's caravan row gives its beasts or vehicles, its guards per wagon or camel, its tents and its goods.
- Jimjam's day-keepers decide departures: "caravans wait for a good day to set out" (LORE §6.14). This is a hook on
  the departure day.
- **Danger by segment.** Each leg crosses ranges and territories. A leg through a hostile faction's ground can be
  intercepted by a raid or a wandering band (6.1's resolution, with the caravan's guards as the defence). This is how
  caravans come to be lost, and how the player can protect or rob them.

### 6.3 Expeditions

**A party goes out, works a target for some days and comes home.**
- **A nation's org sends it:** the Republic's Salvagers to an arcology, the Geomancers to a rare-earth node, Iziz to a
  reliquary, a punitive column to a raider's seat.
- **The target is a record:**
  - a ruin with its own state (`core/simulation/ROADMAP.md` §28: relics remaining, deplete as they are taken);
  - a `kits/resources` node (rare earth, silver), at its grade;
  - a reagent or dye crop's wild stand (`kits/crops`).
- **The camp:** a **base camp** (`laager` with stores, a workshop and guard tents) at the target, plus forward camps.
- **Mechs, for a state's expedition, sometimes** (owner, 2026-10-26). An expedition sent by a state, not a guild or a
  house, may take one or two of Iziz's walkers from `kits/mechs`:
  - the **Castra** (`iz_castra`, the four-legged cargo strider). Variant #1, the Supply Train, carries the stores.
    Variant #0, the Road Camp, has a ballista on its roof and is the base camp's strongpoint.
  - the **Speculator** (`iz_speculator`), the prospector with long sampling arms, for a node or a ruin.
  
  The venture row gives the chance and the count. A mech adds to the expedition's defence and its haul, so it lowers
  the risk (6.1's resolution). It is also a prize: a wrecked mech is salvage, and the Salvagers will want it. Mechs
  walk at the column's pace, on the `road` layer, with `minW` set by the walker's stride.
- **Yield and risk:** the yield per worker-day comes from the target. The risk comes from the ground's fauna and from
  the territory it is in (a raid on the camp).
- **The return:** the goods are imported into the home settlement's books.

The player's own expedition (`core/simulation/ROADMAP.md` §13: travel, temporary camp, explore, salvage, return) is the
same record with the player as its leader.

### 6.4 Armies (later)

An army is a venture of kind `army`: tens of thousands at most, laid out in `rows` as castra, with a supply train
that is itself a chain of caravans. A siege is a venture that camps at its target for weeks. The same balance rules
apply, but a war is what moves a town's standing below the broken line. This waits until ventures and raids are
proved.

## 7. The world tick: groups nobody is watching

**The gap in the sim.** The sim's three levels are for settlements a page has loaded. Bands and ventures cross the
whole crater, almost all of them far from any window. This module adds a **world level** under the sim's record level:

| Level | Who | What runs | Time step |
|---|---|---|---|
| **world** | every band and venture on the crater | `KCAMP.tick(day)`: needs and yields, moves, splits, ventures' phases and outcomes, and the books in bulk | one world day (or the hour the op falls in) |
| **record / abstract** (the sim's) | a band within the loaded region | the camp is a `SIM.settlement` at the abstract level: tents are places, the economy ticks by the hour, the march is a group record | the sim's minute |
| **presented** (the sim's) | a band in the window | everything: actors posed, the column walking, tents pitching and striking | the sim's minute |

**The op log.** `KCAMP.tick` writes each decision as an op:
- `strike(band, minute)`
- `march(band, from, to, t0, t1)`
- `pitch(band, site, formation)`
- `split(band, new)`
- `muster(venture)`
- `resolve(raid, outcome)`

Between ops, everything is a pure function of t: where a column is on its leg, how much of a site is left, how struck
a camp is. So:
- **A position at any minute** is known without stepping. `KCAMP.at(id, minute)` gives `{x, z, state, heading}`.
- **A save** is the log since the last snapshot. A Godot replay is the same ops.
- **Catch-up after a jump** is ticking the days in between. A ten-year run is 3,650 ticks over a few hundred records,
  well under a second in node.

**The hand-overs.**
- **Into the sim.** When a band comes within the loaded region, `KCAMP.load(band)` makes its `SIM.settlement` (kind
  `camp`, `mobile: true`). The camp's places come from its pitched records, its actors from the census, and its store
  from the band's `stock`. It starts at the abstract level.
- **Presenting.** When it reaches the window, the sim raises it to presented: the wake places each actor where its
  schedule says.
- **Out of the sim.** Going the other way, `KCAMP.unload` folds the settlement's books back into the band's `stock`.
  The identity holds across both hand-overs, and the abstract-level week test (`settlements/isle-demo/PLAN.md` §7) gets
  a third case: a band that is loaded, struck, marched and unloaded.
- **A march in the window** is a `SIM.group` with the column's members and beasts. Today `SIM.fire` starts groups only
  at a port. It needs a small change: start a group at a point on the map, the column's position at that minute.
- **A caravan between two loaded towns** is already `SIM.trade`'s. It is a world-level venture only while neither end
  is loaded.

**Determinism and the sim's draws.**
- The world tick draws nothing from `SIM.rng`. Every choice is a hash of (world, id, day, salt).
- Loading a band draws from `SIM.rng` only as raising a settlement does, so the sim's existing takers keep their
  traces: Voth's stocks proof, `test-sim.js`, Dhelv's golden trace and the baseline must not move.

## 8. Trade and fighting with the player

**Meeting.** `KCAMP.near(x, z, r, minute)` lists the bands and ventures near the player. What the player sees depends
on the distance:

| Distance | What is shown |
|---|---|
| Beyond 30 km | Nothing, or a smoke column for a large camp. There is a map marker only if the player has scouted it |
| 5 to 30 km | The camp as an HLOD block or impostors (`openworld`'s town tiles), or a dust plume over a column |
| Within the window | The pitched records through the kit, and the sim settlement presented |

**Trade.** The band's trade tents and its chief's or sheikh's guest tent are `SIM.shop` places. What they sell and buy
is the band's `stock` and the culture's wants. The leader's camp is the big market: a nomad faction's version of a
town.

**Hostility.**
- A hostile band treats the player's party as a raid target by 6.1's rules: a moving target is just a short raid
  with the player's strength as the defence.
- At the presented level a fight is the combat engine's, which is not this module. The engine reports the outcome
  (dead, beasts, goods taken), and the outcome comes back as an op.
- The player can raid a band, a caravan or a raid's spoils on its way home. Relations and infamy move by the sim's
  relation rules (`settlements/voth/SIM-ROADMAP.md` §1.8: infamy, bounties, goodwill for clearing bandits).

## 9. Drawing (host side, not this module)

The module returns records. A page draws them:
- **The pitched camp:** the kit's tent keys through the kit's own builder (`place(key, ...)` on the Scyvoi engine,
  the lizardmen kit's on the Islanders engine), with tags first.
- **The column:** fauna and carts on the kits' loaded pieces.
- **The world-map markers:** `openworld`'s places layer.

The world page is the first host. It is new browser-side code, in host fragments, never in the `[G data]` fragments.

## 10. Phases

### The first build (2026-10-26)

The owner asked for a Beast Rider camp of the Raptor tribe in the isle demo, with the region grown a little into the
mainland jungle, to test the camp and its interactions. What is built:
- **The region.** A fourth area, "east jungle", on the mainland hyperjungle east of the north-east isles (scale model px
  712-738, 370-406; about 3,000 km2, the union now 34,792 km2), in the Beast Riders' country. Cut from scale model 4.23
  with `extract_region.py --keep` (new): the frame's origin and the heights' 16-bit range are kept from the old cut, and
  every old height cell is kept exactly where the model agrees (all 5,056 did), so the isles, the towns and every world
  coordinate are unchanged. The biome indices are kept too (a new biome takes the next free one).
- **core/camp:** the culture row (`beast-rider`), the census and the pitch (ring and horseshoe), with the node test.
- **The camp** (`openworld/isle-demo/src/48k-world-camps.js`, `[G data]`; `88k-world-camps.js`, `[web]`): sited on the
  first disc of good ground (150 m) nearest the survey point, its way in toward Kautoa; the Raptor band's program read
  from the kit (`BR_CAMP.raptor.grounds.lower`); 48 people (6 households), 20 tents and pens, 284 pieces of hedge and
  rail; registered in core/tags; the jungle cleared inside the hedge; drawn with the kit's own tent set (added to the
  page's CAT bundle: `settlements/isle-demo/bundles.py` `cat_bundle(tents=True)`; the city page's bundle is unchanged).
- **The camp on the sim:** the Beast Riders' faction (cordial with the Islanders, trading), the camp a settlement of
  kind `camp`, its own walking layer (the hearth, the doors, the gate, the hunting and gathering grounds out in the
  forest), 23 places and the census's 48 people as actors with their homes and work. Presented while the camera is
  within 2.5 km, abstract beyond. The hunters and gatherers go out through the gate by day; the trainers and herders
  work the pens; everyone eats in their tents and meets at the hearth at night. Drawn as stand-ins near the camera.
- **Verified:** `verify.py --assert` has the camp's check (pitched whole, 40 to 70 people, no overlap, on good ground,
  inside the hedge, cleared, tagged) with two negatives.

**What the next steps wait on** (owner, 2026-10-26): further work on this module depends on two other layers.
- **The fauna layer.** The herds a band lives on, the game it hunts, its mounts and pack beasts, the raptors in the
  kennels: `kits/fauna` has to grow (the Beast Riders' mounts, the hardshell and the mammoth, the elephant bug, the
  flyers' pressure range) and be placed on the map with densities a site's yield can read.
- **Resources on the map.** The site table (section 5) and the expeditions (6.3) read the resource nodes, wild crops
  and pasture where they are: `kits/resources` nodes and the biome kits' `gather` tags placed on the open world, not
  only in a settlement's own patch.

**Next, for interactions** (once those are in): the band's economy (its herd, the hunt's and the gathering's yield as goods, its trader's
tent a shop the player and the towns can buy from), then a trade route to Kautoa (a land and canoe carrier on
`SIM.trade`), then the world tick (C3) so the band strikes camp and moves. The raptors themselves are not drawn yet:
`kits/fauna`'s `ridge-raptor` in the kennels and with the riders.


Each phase ships its node test, with a negative for every check, in the session that builds it. A core module ships
with its first consumer (GODOT-PLAN rule 11).

| Phase | What | Proof | First consumer |
|---|---|---|---|
| **C0** | Owner settles section 12. The kinds go into `core/simulation/SCHEMA.md` and the sim's `KINDS`, registered on first use. Culture rows for `scyvoi`, `nomad`, `ashnomad` and `beast-rider` (its twelve tribes from `BR_CAMP`). `extract_region.py` carries the political polygons. `core/tags` gets the job vocabulary (herder, hunter, gatherer, raider, caravaneer, salvager). `KCLOCK` gets the day of the year and the season. `tools/names/` gets a rules file per tongue as needed (Izani is done) | `test-sim.js` unchanged with the kinds registered and none used; doc review | none |
| **C1** | `KCAMP.census` and `KCAMP.pitch`: ring, horseshoe, line and laager, for the four tent kits | `test-camp.js`: no overlap, everyone housed, chief central, pens downwind, doors as the row says, the same seed gives the same camp | a camp sheet on each tent kit's page (pitch a band at each formation): `verify.py --assert` |
| **C2** | Striking, pitching and the march column (`KSCHED` timelines, packed pieces) | state at any minute is pure; strike then pitch gives the same records | the same sheets, with a scrub bar |
| **C3** | Territories, ranges, sites (`extract_sites.py`), yields, regrowth and the move rule, at the world level | a one-year run: every band stays in range, none starves, the sites regrow, the books balance, a replay from a mid-year save gives the same log | node only |
| **C4** | The hand-over to the sim: a camp as a mobile `SIM.settlement`, load and unload, a march as a group from a point | the abstract-level week test's third case; Voth's stocks proof and `test-sim.js` unchanged | **`openworld/little-demo`** (the eastern desert): Eastern Nomad bands in Nomad Country round Shade, drawn and presented. Its region already holds Shade, Yuni, Locus and Talia |
| **C5** | The leader's camp (`ordo`), splits and merges, the faction seat, **the seasonal home** | ten years: every band between 40 and 70 at every strike; every band home in its home season and in its range out of it | the little demo, a seat camp near Shade; Shade as the Eastern Nomads' dry-season home |
| **C5b** | **The Beast Riders:** Pinnacle Rock's band grounds pitched by `KCAMP.pitch` (same tents by id), its bands roaming out of season; **canopy camps** for the flyers (section 4.1) on the flora's own trees | Pinnacle Rock's camps check unchanged; canopy: every platform on a tree that clears the canopy, every bridge under the span, the camp walkable from the ladder, no camp tree felled | `settlements/pinnacle-rock` (its page, and its region on the open world when there is one) |
| **C6** | Caravans on land: `SIM.trade` over roads, serai stops, night camps, danger by segment | the books balance through a serai stop and a night camp | the little demo: an Izani house's caravan Talia to Shade to Yuni |
| **C7** | Raids: muster, target, resolution, the balance rules, spoils and captives, sedentary war bands | **the balance proof** (6.1), with its negatives | the little demo: the dune raiders on a caravan, and on Shade at the abstract level |
| **C8** | Expeditions: targets with state, the base camp, the punitive column | an expedition's goods are booked from the ruin to its town | a Salvagers' expedition to a ruin in the region |
| **C9** | Player meeting: `near`, markers, HLOD, trade, the combat hand-off as an op. **GDScript twin** of the world tick and the pitch, checked against a golden log | Godot replays the same ops with 0 differences | the little demo, and Godot |
| **Later** | Armies and sieges (`rows` castra); Painted Men and Free Giant war camps once their kits have tents | | |

**Kit work the phases need (each is its kit's own task, not this module's):**
- **Beast Riders:** the canopy pieces of section 4.1 (a tree platform, a rope bridge, a hoist and a ladder), for C5b.
  The ground tents exist.
- **Painted Men:** a war camp (lean-tos, a totem, a war canoe cache?).
- **Free Giants:** no kit at all.
- **The tent kits:** a half-pitched pose per tent, if C2 wants it.
- **The Izani merchant houses:** a house pavilion and loaded ox carts and pack horses, perhaps in `kits/talia` (the
  caravan city). `kits/fauna` has the ox and the horse; their packs and harness are tack on its anchors.
- **`kits/fauna`:** the hardshell and the mammoth, which the Beast Riders' bands herd.

## 11. Risks

- **Scale.** The crater might hold a few hundred bands and ventures. The world tick is cheap. The world map's markers
  and HLOD are the cost: only bands within 30 km are ever more than a marker.
- **Balance creep.** Every dial (aggression, caps, recovery) moves the balance proof. It is a committed table, as
  the Voth stocks proof is, so a change has to say what it moved.
- **The sim's draws.** Loading and unloading a band must not shift the draws of the sim's existing takers. Keep the
  world tick on hashes and run the sim's proofs on every C4+ change.
- **The sim's export.** The new kinds add sections to `SIM.export()`. Registered on first use, they leave an unkeyed
  page's export byte for byte as it was. Check that with the baseline before C4.

## 12. Questions for the owner

Answered on 2026-10-26: the first draft's questions 1 to 4 and 7, then the Chichani beasts, the Beast Riders'
seasons and homes, the flyers' trees, Nusidi, and where the Godsgate is (the Status at the top). Still open:

1. **The house names.** Are Goldanda, Saltroda and Istberar right (section 6.2), with the trades proposed for them?
   Is Farguogar (said as written) and Getmastarz (said Getmast'arz) right for the Far-walker and the Gatemasters?
   When settled, the five go into LORE §6.2 and the tongues file's names table.
2. **Scale and numbers.** How many bands a faction (for example 20 to 40 Scyvoi bands)? How large is a leader's camp
   (300 to 800)? How large is a raid (200 to 600)? How many raids a faction a season (2 to 4)?
3. **How much pitching is shown.** Is a tent's halfway state wanted, or a cut from packed to pitched behind a short
   dust and crew animation?
4. **Captives.** Are the Screamers' captives the only population transfer, or do others (Voth's slave trade) take
   people on raids too?
5. **Which band goes home where.** Which tribes' bands come home to Pinnacle Rock, Girder, Mav's Refuge and Talon, and
   how many bands live in the forts?
