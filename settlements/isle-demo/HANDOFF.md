# Isle demo: handoff (2026-10-19)

For the next session on the isle demo (Kautoa and Valapo, M6, the economy's test case). Read `PLAN.md` first: its
status at the top, then sections 7 to 10. `core/hamlet/PLAN.md` holds the hinterland villages.

## Where it stands

| Phase | State | Where |
|---|---|---|
| P1-P5 | done: the Islanders kit, the ringisles biome, the open world, the site planner, the owner's drawn towns | `kits/islanders`, `biomes/ringisles`, `openworld/isle-demo`, `site/isle-site.json` |
| P6 | done: both towns on `core/city` (`dist/isle-city.html`), Ridertown on the Beast Rider ports | `src/20-34`, `58`, `60`, `98` |
| P6b | in place: the city page's `verify.py --assert` checks `registry, materials, terrain, city` and reports the M6 target (3 of 13 met) | `verify.py` `EXPORT_PROFILE`, `EXPORT_TARGET` |
| P7a | done: settlements, an economy, stocks and the items' books per settlement; the population dealt per town; the search scoped to one's own town; trade between settlements (`SIM.trade`, a timer or a transport line); the three levels in `SCHEMA.md`; 30 two-settlement checks | `core/simulation/77-sim-6-trade.js`, `77-sim-6-economy.js` (end), `77-sim-6-population.js`, `77-sim-7-stocks.js` (end), `test-sim.js`, `SCHEMA.md` |
| Hamlets H1-H4 | done: four resource villages in the open world (salt 112, mine 307, lumber 263, ranch 245), felling on the 72-minute clock | `core/hamlet`, `openworld/isle-demo/src/48-world-hamlets.js`, `88h-world-hamlets.js` |

**Decided by the owner (2026-10-19):** the M6 export case is the region's open world, not a page per city (PLAN.md
section 7, "Where the export case lives"). A city is its site file and programme on `core/city`; `core/city` itself
registers the export's `city` section for every instance on a page.

## Next, in order

1. **P7b, the isle host:** the towns' places, people, items and economy declared on the city page, Valapo first (the
   template is Dhelv's `74-dhelv-sim.js`; the key map from Voth's census trades to Islander keys is `IS_TRADES`).
   Populations: Kautoa about 6,300, Valapo about 2,150 (P6's census is to be re-tuned to these). Each town's roles
   carry `settlement`, and `SIM.populate({settlement, prefix})` runs once a town. Then P7c: the canoe line as a
   `SIM.transport` between the two trade landings and `SIM.trade({line})` on it (the timetable is the owner's: PLAN.md
   section 9). Any core/simulation change: diff Voth's whole `verify.py --assert` output against `main`'s page with the
   timings stripped (the method P7a used).
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
