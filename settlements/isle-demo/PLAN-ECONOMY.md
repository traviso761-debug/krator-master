# Isle demo: the economy's extension plan

ChatGPT's review of 2026-10-28, added to the repo by the owner's word on 2026-11-01. **A proposal: no phase is started, and its gates are
the owner's.** Re-check its statements against `KNOWN_ISSUES.md` first: they describe the source as of 2026-10-28. The isle demo stays
the economy's test case (`CLAUDE.md`), and a `core/simulation` change keeps Voth's stocks proof, `test-sim.js` and the baseline unchanged
unless it means to move them.

### What the demo actually contains

The repository identifies the Isle demo as the `core/simulation` economy test case (`CLAUDE.md`, `settlements/isle-demo/PLAN.md`). The source is substantially beyond a visual demo: two settlements (Kautoa and Valapo) have separately keyed economies, residents and work roles, food/item use, producers, warehouses, carts, abstract-level simulation, spoilage/governor rules, and inter-town trade.

Key flow and source map:

- `settlements/isle-demo/src/15-isle-tune.js` is the declarative tuning table: foods, goods, inputs, producers, rates/caps, starting stocks, cart behavior, governor, trade routes, diets and hamlet rules.
- `40-isle-sim.js` binds the sim, configures needs where enabled, registers/declares town places, populates residents and steps the simulation.
- `42-isle-people.js` derives roles and schedules from jobs/posts, beds and census/age assumptions. `43-isle-items.js` configures items, shops and household food.
- `44-isle-economy.js` determines what each town can actually make by fixed-point reachability from its registered producer outputs and input graph; declares `SIM.economy`, warehouses, recipes and carts; assigns opening food and good stocks; and configures the imported food diet. This means an input chain with an unavailable upstream good is excluded from town production rather than silently assumed possible.
- `47-isle-trade.js` declares the two canoe routes over town landing places with site stores, derives hourly demand/want, and records beyond-island buyers as exports. The current route goods and import/export bookkeeping are quantitative flows; beyond-island purchases are scheduled and remove stock.
- `47h-isle-hamlets.js` creates optional resource hamlets and their own economies, recipes, carts and paired road routes to their parent town. It adds hamlet resources and inputs to the town economy. The host page must supply the hamlet world records.
- `48-isle-week.js` collects per-town stock/economy/needs/trade results and checks balance over a simulated period; `49-isle-govern.js` adapts Isle tuning to core governor/spoilage/seasoning rules.
- `core/simulation/SCHEMA.md` documents canonical world records: factions, orgs, relations, settlements/presence, places, roles/actors, events, ports, transports. It also documents opt-in needs, items and economy. `77-sim-6-economy.js` provides stores, recipes, goods inputs, production, consumption, carts, timed imports, carrier stops and economy reports; `77-sim-6-trade.js` provides route carriers and in-transit accounting; `77-sim-6-govern.js` provides production governor, spoilage, keep and seasoning; `77-sim-7-stocks.js` exposes stock/flow snapshots. `77-sim-7-lod.js` handles abstract simulation for distant/unwatched towns.
- `settlements/isle-demo/KNOWN_ISSUES.md` is valuable current-state evidence: it records unresolved links between world resource records and simulated production, hamlet movement/rendering, abstract-vs-watched discrepancies and trade limitations. Re-check its timestamped status before implementation.

### Already present versus missing

| System | Present in the inspected implementation | Still missing or limited |
|---|---|---|
| Settlement inventories | Per-place site/warehouse stocks; producer output stores; cart cargo; household food; ownership/transit/storage categories in `SIM.contents`/`SIM.stocks` | A player-editable, policy-driven inventory interface and general stockpile rules; inventories are still mostly quantities without lot quality, provenance, spoilage age beyond targeted rules, or ownership/account ledger |
| Resource production | `SIM.recipe` out/rate/cap and good-input consumption; workers at work, mood efficiency; Isle farms, fisheries, works and hamlet recipes | Map-node depletion and ecology coupling; resource world nodes and their extraction simulation do not yet reconcile (KNOWN_ISSUES); production is a single rate/output recipe abstraction rather than full work orders and multi-stage time queues |
| Labor | Jobs/posts, resident schedules, role/work assignment, needs/mood efficiency, optional abstract daily work | No demonstrated skill progression/qualification model, wage/payroll, labor market, hiring/firing rules, worker-owned tools materially gating every task, or production allocation by labor policy |
| Logistics/trade | Driven carts, road/sea timed carrier routes, imports/exports, in-transit stock accounting, capacity, route wants/keeps, goods filtered by route; Isle uses road and canoe movement | Sea route presently timer-based and not a drawn vessel/route (`KNOWN_ISSUES`); road loads convoy/lumpy and hamlet production not fully tied to map resources; no general multi-leg route network/cost accounting or contracts/settlement between buyer/seller |
| Prices/scarcity | Governor observes use, shortfalls and total supply line to regulate production; goods have stock-days and shortages are reported; external buyers remove specified amounts | No price formation, currency, money balances, wages, credit, tax, tariffs, market clearing, bids/asks, transaction records, or price-driven substitution. Trade currently moves quantity; exterior sales remove goods without a money return (KNOWN_ISSUES). Scarcity impacts governor and shortage books, not prices or household purchasing power |
| Factions | Canonical faction/org/relation/presence records and trade permissions; Isle towns are separate settlement economies and the line checks trade relations | No faction-level consolidated treasury, stock ownership, revenue/expenses, tax/subsidy or inter-settlement balancing policy evidenced |
| Player-facing visibility | Debug/report APIs: `SIM.economyReport`, `SIM.contents`, `SIM.stocks`, trade reports, Isle week books and checks | No in-game inventory/production/trade inspector or economy overlays demonstrated; limited inspector/debug UX and no general trace from a specific unit through recipe → store → cart → town/market consumer |

### Recommended architecture and phases

Keep the simulation engine as the authoritative source of economic state. Make rendering/UI inspectors read-only projections of records and books; debug tools should not mutate simulation state. Extend Isle first as a controlled test case, preserving the project's policy that core simulation changes must keep Voth/Mungo/Shade/Dhelv/Verge behavior and baselines unchanged unless deliberately targeted.

#### Phase 0 — Canonical accounting contract and baseline

1. Write down units and ownership for each good: unit kind, settlement, owner, location, quality/condition, and whether in production, stored, household-owned, cart/ship transit, or ordered. Build on the existing contents/stocks categories rather than making parallel counters.
2. Define balance invariants per good and settlement: opening + produced + imports − consumed − spoilage − exports = closing, with transit and outstanding orders shown separately. Make cross-settlement routes reconcile sender, receiver and in-flight records.
3. Extend the Isle week test with deterministic small scenarios and negative cases before adding gameplay. Keep the full 21-day/abstract watched-vs-unwatched check as an integration scenario.
4. Identify the migration path for current world JSON and exported sim records. Preserve stable IDs and current save/export behavior.

#### Phase 1 — Settlement inventories, buffers and resource linkage

1. Give settlements explicit stockpile policies: minimum/target/maximum per good, reserved quantities, public/private access, and optional storage class. Map those policies to existing warehouse/store records and governor targets.
2. Add resource-site state keyed to stable world node IDs: remaining amount, grade, regeneration/depletion rule, extraction rate, and resource type. A recipe at a mine/farm/fishery must draw from that node; depleted sites reduce or stop output and report why.
3. Reconcile the world’s visible resource records with simulation sources/sinks. Start with the outstanding hamlet mismatch noted in `KNOWN_ISSUES.md`; expose the same quantity in world visualization and sim books.
4. Add perishable lot age/quality only where needed; support storage spoilage and FIFO/quality selection as explicit policy. Don’t force lots into every nonperishable good.

#### Phase 2 — Production chains, labor and recipes

1. Promote recipes from output/rate metadata into stable recipe records: input quantities per batch, output quantities/byproducts, labor-hours by skill, tools/equipment, facility requirements, duration, capacity, and waste. Keep a compatibility adapter for current `SIM.recipe({out, rate, cap})` records.
2. Use explicit work orders or a small deterministic batch queue so scarce inputs, labor, tools and facility capacity are claimed once. Each tick should have ordered phases for assignment, input reservation, work progress, completion, output deposit, consumption, and logistics.
3. Add worker skills/experience and optional qualification/efficiency curves. Retain current roles/posts and mood modifiers, but separate “has a role” from “is productively assigned to a valid order.” Model wages only after the money ledger exists.
4. Make intermediate input sourcing explicit: local producer store, shared warehouse, or delivered input. Current economy inputs permit production when the required good exists in the supply chain but do not model recipe-specific procurement contracts/queues; the extended system should report “blocked: missing X” and make hauling/input reservation observable.
5. Convert representative chains first: crop → food processing → household/shop; cotton → cloth → garments/nets; ore + charcoal → iron → tools; timber → wood tools/buildings. Add tests for no-input, partial-input, labor-short, capacity-full, depleted-node and byproduct cases.

#### Phase 3 — Logistics and inter-settlement trade

1. Represent routes as reusable network edges with mode, travel time, capacity, operating cost, risk, schedule and transfer points. Preserve current timer routes as the first adapter; later connect `SIM.transport` to visible sea movement.
2. Add shipment orders with source/destination, quantity, priority, owner, expected arrival and status. Reserve source stock at dispatch; count in transit once; land or return/loss exactly once. A route policy should decide what is available after local reserves.
3. Add contracts/market orders between settlements: requested good/quantity, delivery window, price or barter terms, and failure/cancellation rules. Distinguish external demand from simulated faction counterparties so exports are not destroyed into an accounting void.
4. Add road convoys and ports to the same logistics abstraction; hamlet routes should be a specialization, not a second bespoke trade model. Add tests for capacity, delay, route closure, partial delivery and simultaneous competing routes.

#### Phase 4 — Prices, scarcity and household purchasing power

1. Introduce currency only with an explicit ledger: household, firm, settlement/faction treasury, transfers, wages, purchases, taxes and trade payments. Every purchase/sale should balance cash and goods.
2. Begin with settlement market prices derived from a transparent base value and bounded stock-days/shortage signal, with smoothing and price floors/ceilings. Log price history and demand/supply rather than burying a price formula in the governor.
3. Make consumer demand respond to prices and budgets: substitutions/preferences, affordability, rationing and unmet needs. Keep essential goods and subsistence behavior explicit so scarcity does not create impossible negative inventories.
4. Test stable and scarce cases for oscillation, hoarding, price spikes, inability to afford staples, and external arbitrage. Keep production governance (capacity targets) distinct from market pricing (exchange incentives).

#### Phase 5 — Faction-level economy and institutions

1. Aggregate member settlements' stocks, flows, prices, trade exposure and treasury into a faction ledger; do not duplicate stock amounts at faction scope.
2. Add explicit policies for tax, transfers, procurement, subsidies, strategic reserves and infrastructure spending. The faction can influence settlement targets through policy messages, while local production and inventories remain settlement-owned.
3. Use existing `faction`, `org`, `relations`, `presence`, and trade access records to govern tariffs, embargoes, permissions, and risk. Add political/accounting events as stable records, replayable through export/import.
4. Grow from two Isle towns and one polity; then test a second faction and hostile/closed trade relation, before broader world simulation.

#### Phase 6 — Player-facing inspectors and debug visualization

1. Add read-only inspectors for settlement, stockpile, good, recipe/facility, workforce, shipment/route, market and faction. Show current value, recent flows, target, shortages/blocker and source record ID.
2. Add a production-chain graph: producer inputs → work order → outputs/byproducts → store → shipment → consumer, with quantity and time in each stage. Selecting a missing output should reveal the first blocked input/labor/route/resource cause.
3. Add world overlays for resource remaining/depletion, production sites/rates, stock-days/shortage, active shipments and route capacity. Use the existing `SIM.economyReport`, `SIM.contents`, `SIM.stocks`, and Isle reports as backing projections.
4. Provide deterministic tick/step controls and an event/transaction log for debugging. Make inspectors clearly separate simulated state from planned targets and forecasts.

### Suggested order and decision gates

Do Phase 0 first, then Phase 1 resource linkage and Phase 2 minimal work orders; these turn the already-real Isle production/hamlet setup into a coherent supply chain. Add logistics contracts before prices, because prices without counterparties, ownership and balanced transactions have no useful interpretation. Add currency and faction budgets only after goods movement and ledgers reconcile. Inspectors should arrive alongside each phase so new state can be diagnosed rather than added as invisible complexity.

At each gate require deterministic tests, balanced ledgers, no double counting across stores/transit, unchanged unrelated build baselines, and an Isle report that can explain each shortage from source node through consumer. Defer broad simulation until the compact Isle and existing regression consumers prove the contract.
