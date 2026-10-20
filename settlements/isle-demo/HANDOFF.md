# Isle demo: handoff (2026-10-19)

For the next session on the isle demo (Kautoa and Valapo, M6, the economy's test case). Read `PLAN.md` first: its
status at the top, then sections 7 to 10. `core/hamlet/PLAN.md` holds the hinterland villages.

## Where it stands

| Phase | State | Where |
|---|---|---|
| P1-P5 | done: the Islanders kit, the ringisles biome, the open world, the site planner, the owner's drawn towns | `kits/islanders`, `biomes/ringisles`, `openworld/isle-demo`, `site/isle-site.json` |
| P6 | done: both towns on `core/city` (`dist/isle-city.html`), Ridertown on the Beast Rider ports | `src/20-34`, `58`, `60`, `98` |
| P6b | in place: the city page's `verify.py --assert` checks `registry, materials, terrain, city, sim, items, buckets, textures, fixtures, stage` (interiors and furniture may read empty) and reports the M6 target (9 of 13 met) | `verify.py` `EXPORT_PROFILE`, `EXPORT_TARGET` |
| P7a | done: settlements, an economy, stocks and the items' books per settlement; the population dealt per town; the search scoped to one's own town; trade between settlements (`SIM.trade`, a timer or a transport line); the three levels in `SCHEMA.md`; 30 two-settlement checks | `core/simulation/77-sim-6-trade.js`, `77-sim-6-economy.js` (end), `77-sim-6-population.js`, `77-sim-7-stocks.js` (end), `test-sim.js`, `SCHEMA.md` |
| P7e | Done (2026-10-20): the `sim` export section (`50`), in the profile, failing stubbed, passing filled | `src/50-isle-export.js`, `tests/test-isle-export.js`, `verify.py` `SIMX_JS` |
| P7d | Done: the town in view presented, the other abstract (`ISLE.simWatch`); the week test (a week each way: books balance at either level, every load landed or at sea, loads to the abstract town booked there, abstract food a worker a day near the watched rate, no decisions in the abstract town), with negatives, in verify and `tests/test-isle-week.js` | `48-isle-week.js`, core/simulation `77-sim-7-lod.js` (the core branch `claude/isle-p7d`) |
| P7c | Done: a canoe stop at each trade landing (berths on the plan, a place with a store), the lakatoi line (two a day, one each way) and the oruwa on SIM.trade, each town's hourly use of the other's goods as the want, the docked vessel drawn; verify checks with negatives | `src/32` (canoeStops), `47-isle-trade.js`, `61-isle-canoes.js`, `15` (`trade`) |
| P7b | Done: the citizens near the camera (`59`, stand-ins, with a verify check). Both towns declared (Kautoa 6,235 people on its farm ring, Valapo 2,155), the run loop (`57`, held at first), the stocks id map (`46`); verify's Valapo page checks both towns. Before that, Valapo done: declared on core/simulation from its plan (619 places, one walking graph, 2,155 people, 805 workers, its own economy: crops, fish, pork, bread, 14 carts, 39 warehouses); verify's Valapo page and `tests/test-isle-sim.js` check every census trade's lot a place, every resident housed and every worker employed in the town, the food made, hauled and eaten with nothing short for a day (each with a negative). No core/simulation change | `src/15-isle-tune.js`, `40`-`45`, `verify.py` `SIM_JS` |
| Hamlets H1-H4 | done: four resource villages in the open world (salt 112, mine 307, lumber 263, ranch 245), felling on the 72-minute clock | `core/hamlet`, `openworld/isle-demo/src/48-world-hamlets.js`, `88h-world-hamlets.js` |

**Decided by the owner (2026-10-19):** the M6 export case is the region's open world, not a page per city (PLAN.md
section 7, "Where the export case lives"). A city is its site file and programme on `core/city`; `core/city` itself
registers the export's `city` section for every instance on a page.

## Next, in order

1. **P7b, P7c and P7d are done** (the canoe line, `47`, `61`; the levels and the week test, `48`; the economy governed
   and spoiling, `49`, with its checks in the week test; the wear plan (PLAN.md 9b: tools by trade, pots, salt, injuries,
   arms, clothes by class) and needs with treats, each with a week-test check). **P7e is done** (2026-10-20, `50`): the
   `sim` export section, in the page's profile, failing stubbed and passing filled (`tests/test-isle-export.js`).
   **P8's books are read in Godot** (2026-10-20): `tools/export-sim.js` writes `godot/data/isle`, and
   `godot/tests/isle/isle_books_test.gd` (`KratorIsleSim`) derives the checks and agrees with the page. **Kautoa's
   ceremonial centre opens in Godot** (2026-10-20): `godot/data/world-isle-kautoa`, `godot/tests/export/isle_test.gd`
   (buildings, records, sim joins, citizens replayed, canoes); core/export's scene reader (lifted from Iziz) and
   `SIM.exportMotion` (lifted from Dhelv) carry it; the stage, the doors (fixtures) and **Valapo's case**
   (`godot/data/world-isle-valapo`) followed. Next: windows and lamps from the kit, the lakatoi and bodies in Godot,
   then the open world (M7). A sea route
   (`SIM.transport` between the landings, `SIM.trade({line})` on it) comes with the open world. Any core/simulation
   change: diff Voth's whole `verify.py --assert` output against `main`'s page with the timings stripped (the method
   P7a used); the core work goes through the isle-demo build session.
2. **Move the towns into the open world** (their `KCITY` plans run live there, as the hamlets do), then move the export
   profile to `openworld/isle-demo/verify.py` and grow it.
3. **The compliance items** in PLAN.md section 10: the city page onto `core/host`, its sky and sea, `terrain=field`, and
   little-demo's shared fragments (ask: both worlds' hashes move).
4. **Hamlets:** the `gather` tag on the other biome kits (only ringisles has it); fishing and farming villages (H6); the
   villages in the sim once P7a's trade lands (H5).

## Watch out for

- **The shared checkout.** Other sessions work in `krator-master` at the same time and leave uncommitted rebuilds (on
  2026-10-19: Voth, Verge, Mungo, the isle city page, many biome pages). Work in your own worktree; never stash or
  overwrite theirs. After their commit lands, the pages that take `core/city` and `core/simulation` must be rebuilt again
  from the joined sources.
- **Voth's verify fails on `main` already** (embassies Hykkousoi, Iziz, Jimjam, Republic; the Arena canton not walkable).
  It is not this work's; compare against `main`'s page before believing a failure.
- **Verge's verify** sometimes fails on a shader error with an empty log under software GL: re-run; none of this work
  writes shaders.
- **World pages need the browser pane in view** to run frames; headless they stall at the skylight. Read
  `window._hamlets` for data checks.
- **LFS:** a fresh worktree needs `git lfs pull` of the `tex/` folders a page bundles (fauna, voth, islanders, iziz,
  beast-riders, girder, mavs-refuge), or it builds silently with placeholder textures.
- **Open questions for the owner:** "park 2" was read as the drawn "Park 3"; "Islander extraction" ships as Islander
  bulk carriers (PLAN.md 8a); the stable and rookery on the ranch are the Beast Riders kit's; the kiln has no job tag
  (the catalog's vocabulary has no charcoal burning: a `core/tags` change); the lumber stand is nearly all saplings at
  the default felling rate (`KHAMLET.FELL.treesPerWorkerDay`).
- **The gallery is not updated** for any of this (owner, 2026-10-19).
