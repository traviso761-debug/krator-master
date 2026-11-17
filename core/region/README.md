# core/region: the region host

The code that turns a census, its towns and their villages into economies on `core/simulation`. It was the isle demo's
page code (`settlements/isle-demo/src/40-49`, under `ISLE.*`). Phase S0 of `core/simulation/PROPOSAL-LONGSONG-PINNACLE.md`
lifted it here (the owner, 2026-11-11), so a second economy runs on the same code: Longsong's valley.

## How a page takes it

```js
KREGION.use(H);        // the page's host object: every part loaded after this runs on it at once
// ... then the core/region fragments, by path, in the order below
```

- The isle demo's host is `ISLE`: `settlements/isle-demo/src/39-isle-region.js` calls `KREGION.use(ISLE)` before the
  parts.
- `settlements/isle-demo/build.py` (`CITY_DATA_JS`) and `openworld/isle-demo/build.py` (`ISLE_DATA_JS`) list the parts by
  path, interleaved with the page's own fragments exactly where the page's 40-49 stood (47 and 47k, 47x, 47y are still
  the page's: the canoe line, the colony, the sea expeditions). So every part runs where it ran before, on the same
  object, and the isle's tests give the same results.
- `KREGION.install(H2)` runs every part again on another host.
- Inside the lifted parts the host is named `RH`: `ISLE.` was renamed `RH.`. It is not `H`, because the isle code's own
  functions declare locals named `H`, which shadowed the host on the first try.

A host carries its culture as data: `H.TUNE.sim`. That is the isle's `15-isle-tune.js`, or Longsong's
`settlements/longsong/src/15-ls-tune.js`. `H.TUNE.sim.culture` names the culture's own literals, with the isle's values
when it is absent (S0 step B):

| Key | Default (the isle) | Read by |
|---|---|---|
| `faction`, `factionName` | `islanders`, "The Ring Sea Islanders" | 40 |
| `keys.farm`, `keys.orchard`, `keys.quay` | `ie-farm`, `ie-farm-poor`, `ie-quay` | 40, 47h |
| `hamletRow` | `islander_east` (a spec's own `row` first) | 47h |
| `names` | `islander` (core/hamlet's name list) | 47f |
| `tag` | `islander` (the guild's tag culture) | 47c |
| `herders.perHousehold` (in the tune's `herders`) | 5 | 47n |

## The parts

| Fragment | What |
|---|---|
| `00-region-core.js` | `KREGION`: `use`, `part`, `install`, `parts` |
| `40-region-sim.js` | the binding (`simInit`), the places from a city plan (`simPlaces`), `simDeclare`, `simRun` |
| `41-region-nav.js` | the walking graph from a core/city plan's ways |
| `42-region-people.js` | roles by job and age, households mixed, demography |
| `43-region-items.js` | the items, households and shops |
| `44-region-economy.js` | each town's producers, warehouses, carts, governor |
| `45-region-sim-checks.js` | the checks per town |
| `46-region-stocks.js` | the stocks panel's id map |
| `47b`, `47c`, `47f`, `47h`, `47m`, `47n`, `47r`, `47u` | building and upkeep, crime, founding, the hamlets, money, herders, refugees, unrest |
| `48-region-week.js` | the week's books and checks |
| `49-region-govern.js` | the governor's and spoilage rules |
| `50-region-valley.js` | **a valley at the abstract level** (S3): settlements declared from a plain spec, not a city plan; works as their own stores; the people eating by the hour; tithe roads; a road's `want` and `most` passed to SIM.trade (a long road needs a want that covers the gap between its carriers); the transfers. Longsong's valley and the Xanadu Sultanate run on it. **X1** (2026-11-16), each inert where absent: a settlement's own `scale`; a work's `site` (SIM.site: a lode that runs out, a fishery or the Dome's fall that regrows a night); a road's `stops` (a round of three or more, one leg time: SIM.trade lands a boat's whole load at the next stop, so a round is a relay and its stops `expect` the round's wares) |
| `51-region-allot.js` | **the Allotment** (Z1-Z2, `core/simulation/PROPOSAL-LIZARDMEN.md`, 2026-11-17): a command economy's plan, opt-in by a valley spec's `allot` (inert without it, so every other tune runs as before). At each quarter-day the planners weigh every place's stock, make, use and reserve and issue loads, the heaviest need first, from below a lighter place's reserve when they must (`deep`); no carrier buys or sells. Each load rides the Coil (two loops meeting at a hub, its season's way round, `hold` days at each stop); gifts go round the coil each way a year (bronze outward, bone inward) and leave memory debts; a place's sunk goods (the relics) go to its `sink`. `H.allotRoute`, `H.allotCheck` (taken = landed + on the road). Records by id: `S.allot.loads`, `turns`, `gifts`, `giftLog`, `debts` |
| `52-region-raid.js` | **the raids** (Z4, 2026-11-17): opt-in by a valley spec's `raids` (inert without it). At each raiding season the faction spends its budget: a war band chooses its target (core/camp's `KCAMP.raidChoose`), takes its provisions from home, marches, resolves the assault (`KCAMP.raidOutcome`), takes within the caps (`raidTake`, `raidDead`), and lands the plunder and the dead of both sides in its store. A target in the same valley is raided in its own books (booked exported); an off-map target is a record that restocks. Standing and recovery, a fort's `state` (damaged, ruined, repaired after a season), the polity's garrison grant and punitive expedition as events. `H.raidReport()`; records `S.raids.raids`, `events`, `targets` |
| `data/lz-tune.js` | `LZ_TUNE` (`[G data]`, Z0): **the Lizardmen's country**, about 58,000 in ten places in Xanadu's frame: Basilisk the capital (once Sauropolis) 15,000, Tuatara, Komodo, Gila and Iguana 3,000 each, the Tubes 1,000, the warrens 30,000 in bulk, the two reliquaries; Gila built from its own records (`settlements/gila/src/88-gl-records.js` `GL_REC`); the bronze hall, the smiths, the Coil and the Allotment's weights. `LZ_TUNE.valley({allot: true})`. Plan of work: `core/simulation/PLAN-LIZARDMEN.md` |
| `data/xan-tune.js` | `XAN_TUNE` (`[G data]`): **the Xanadu Sultanate's tune** (`core/simulation/PROPOSAL-XANADU.md`, step X0): about 350,000 people in 62 settlements: the towns and their works, the eight provinces' countrysides in bulk, the 21 lake towns and 4 islands, Erehwon's and Qiblai's rings (from `openworld/xanadu-oidong-highrift/plan/sites.json`), the work camps and forts, the four gateways, the dues and grants. `XAN_TUNE.valley(plan)` is the valley spec. Read in place. **X2** adds the gold and opal lodes as fields of short veins, the Geomancers' oil (Yuni's mission) and its power, and three merchant houses (the Two Horns, the Golden Tears, the Rare Devisers) whose take is road `cut`s |
| `data/east-rift.js` | `EAST_RIFT` (`[G data]`, X2): the Sultanate and Longsong's valley as one economy. `EAST_RIFT.valley(Pxan, Pls)` joins `XAN_TUNE` and Longsong's `LS_TUNE`, unchanged. Longsong runs at 10 people an actor, with its windows prefixed `ls.`. Its caravan goes to Strongbow and its fealty to the citadel |
| `tools/export-east-rift.js` | runs a year of the East Rift and writes its census (every settlement's pixel, people, works and books; every road's kind and landings; the cuts and transfers) for the census page |
| `WEST-RIFT-SCOPE.md` | the West Rift's preliminary scope (2026-11-16, not built yet): its settlements, ~120,500 people with the owner's figures (Ledge and Nulab ~10,000 each, Blakhed 5,000, the basin's rural at 2.5x, the Tungangs ~20,000 in their lojes, the Kimr 12,000), the Line, the flows and a build order W0-W6 |

## Still the isle's

The isle demo's tests still run its `plan.js`. Some couplings are still isle-only, but each is inert where its tune
section or route is absent:
- the lakatoi in 47h (`SIM.TRADE.routes.lakatoi`);
- the foreign ships' account in 47m (`money.foreign`);
- the two-town week in 48 (`simWeek`'s `other`);
- salt as the keeping good in 49.

Lift them into the tune when a culture needs them otherwise.

## Tests

- **The isle demo:** `node settlements/isle-demo/tests/test-isle-*.js` (they run its `dist/isle-city.plan.js`), and
  `settlements/isle-demo/tools/export-sim.js` for the golden books.
- **Longsong's valley:** `node settlements/longsong/tests/test-ls-economy.js`. It runs a year by the hour, about 6 s.
- **The Xanadu Sultanate:** `node core/region/tests/test-xan-economy.js` (on `tools/ktest.js`). It runs a year by the hour
  on 472 actors, about 50 s, and holds it to PROPOSAL-XANADU's X0 and X1:
  - X0: everyone fed, the books balanced, the gold chain and the Fifth, the dues and grants, the lake's fish, the gateways, the iron, the seasons, the size;
  - X1: the sites (the lode drawn down, the Dome's scrap capped, the fisheries holding), the lake's four market-boat rounds, the countrysides at 200 people an actor, the gateways staged at Strongbow and Thalaba;
  - X2: the fields of veins, the Two Horns' tally and margins and the Sultan's toll, the Geomancers' oil, the Rare Devisers' expedition, the Golden Tears' camp and escort, the power.
- **The Lizardmen (Z0-Z2):** `node core/region/tests/test-lizardmen.js` runs two years of the Lizardmen's country with the Allotment (about 55 s): declared at the owner's numbers, a season on their own make, the books and the plan's own accounts, everyone fed (a plan that moves nothing goes hungry), salt and bronze to every place, the capital fed from below the warrens' reserve when Iguana's harvest fails, **Gila held to `GL_REC`** (the second year sends 273 t of salt against the records' 275), every load round the Coil, the gifts home once a year each way, the relics sunk; each negative a pair.
- **The Lizardmen's raids (Z4):** `node core/region/tests/test-lz-raids.js` runs two years with the raids, and again with the caps off (about 30 s): both war bands within the budget, the forts holding and the villages and the Tears' camp raided, every raid within the caps (negative: caps off), the balance (no target under 0.7; negative: caps off), the plunder and the dead home and the books balanced, the Sultanate's events (assaults, garrison grants, punitive expeditions), everyone fed, inert without `raids`.
- **The East Rift (X2):** `node core/region/tests/test-east-rift.js` runs a year of the Sultanate and Longsong joined. It checks: declared, the books, everyone fed, the fealty and esteem, Longsong's caravan to Strongbow and its toll, the Order's goods out by Iziz, its crafts, the time.

  The salt runs about 8 % short in the first year (38 % before X1 staged the gateways); the owner expects a shortfall
  until the caravans from the north are built (2026-11-16).
