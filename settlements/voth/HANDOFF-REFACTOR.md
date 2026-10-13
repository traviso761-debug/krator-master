# Voth-sim into full-refactor: the handoff (2026-10-13)

The `Voth-sim` branch (head `0df22599`, 61 commits since its base with `full-refactor`, `da9e1f06`, 2026-10-12) is
the Voth citizen simulation of `SIM-ROADMAP.md`, phases A to E, plus the animals and the pets the owner asked for on
the way. `full-refactor`'s `ROADMAP.md` stage 5 already says the simulation starts from this branch "merged as that
branch hands it over". This note is that hand-over: what the branch carries, how to merge it (a trial merge was run),
where it lands in the refactor's plan, and what is left. `HANDOFF.md` has the session-by-session detail; `README.md`
the design; `SIM-ROADMAP.md` the brief and the phases.

## 1. What the branch carries

**`core/simulation`** (every module opt-in; a world that calls none of them decides exactly as before; Shade, Mungo
and the SIM example rebuilt and verified on every change):

| Fragment | What it adds |
|---|---|
| `77-sim-3-actors.js` | week schedules (`SIM.weekday`, rota days off); lazy legs; **the wake** (`SIM.WAKE`, `SIM.wakeOf`: an actor is asked only when its wish could change); **the lag** (`SIM.LAG`, `SIM.lagOf`, an actor's `lagBase`: its day a few minutes, or a bucket's half-hour, behind the clock); **`SIM.command`** (a forced act at a place until a minute); itinerary legs naming their place and an economy `stop`; `to:'same'`; `SIM.stepHooks`; carts (`driven`) left to the economy |
| `77-sim-2-places.js`, `-4-nav.js` | the place grid (nearest-first, exact); a grid layer's route gets the ends' heights (`ay`, `by`) |
| `77-sim-5-motion.js` | lazy legs posed (straight line when asked cheaply) |
| `77-sim-6-needs.js` | needs: meters, rates by role, fills by activity, traits, happiness, efficiency bands, loyalty, need-driven free time, interrupts (the well trip), `needsWake`; a role's own `needs.free` (an animal's choices); censuses leave out carts, crews and animals |
| `77-sim-6-items.js` | items: six slots, wear (clothes by the day, tools by the worked hour), errands in free or work time, issued kit (the slaves), household food stores and meals, eating out, treats; with the economy: purchases draw goods, food bought by what is on the shelf, food `quality` (cheese) |
| `77-sim-6-economy.js` (new) | goods, site and warehouse stores, production by worked hour x efficiency, herds (`herd: {out, rate, tended, share}`, the grown only), carts (the brief's pick order, the emptiest of the nearest warehouses), `SIM.supply`, `SIM.economyMeal`, `SIM.produce`, turnover and days left, imports by carrier groups (`SIM.fire` itineraries) or by timer, exports capped at the day's surplus, a snapshot report |
| `test-sim.js` | 157 checks, each with its negative (`node core/simulation/test-sim.js`) |
| `SCHEMA.md`, `PLAN.md` | the needs, items, economy, carriers, animals, commands, hooks, wake and lag |

**`settlements/streetlab`** (Voth's city plan, the canonical Voth): `targets/voth-city/41`-`47` (interiors for every
lot building, places and posts, the pedestrian layer, 53,387 citizens and slaves with homes, jobs, rotas, needs and
things, the economy, the animals and pets), the host fragments `56b` (the report's sections) and `56c` (the run, the
bodies, carts, carriers and animals drawn near the camera, `VC.simDay`, `VC.simDays`), `15-vc-tune.js`
(`TUNE.sim.*`), `33`/`36` (the livestock pens, their jobs), `verify.py` (week, needs, items, economy, animals, pets
and bucket checks), docs.

**`kits/catalog`**: the Voth buildings for phase B (watchhouse, caravanserai, coast-guard berth, weaver, tannery,
brewer, butcher, bakery, village shrine, shipwright's dock) and furniture fixes (the oven, the lantern shrine).

**`kits/fauna`**: the whole of `origin/ccr-05259b8d-kuy4pm` (the fauna session's work: 125 animals, the Meshy models,
the rig tools), which `full-refactor` does not have yet, merged here; plus one change of ours: `fauna_bundle.bundle(...,
mdl=[groups])` packs only those groups' models (the city takes the pets' two).

## 2. The numbers at hand-off (`verify.py dist/voth-city.html --assert`, alone on the box)

- Every check passes but the known one: `embassies: Hykkousoi, Iziz, Jimjam, Republic, cantons not walkable: Arena,
  Fortress` (pre-existing: the Arena walk drops off a 28.7 m ledge, the Fortress walk is blocked inside).
- Step cost on a workday: p50 76-89 ms, p90 290-310 ms, **worst minute 1.7-1.8 s** (it was 4 s before the lag and
  the buckets); the rest day p50 139 ms, worst 2.8 s. A whole simulated workday costs about 175 s of compute (161 s
  without the half-hour buckets: they trade 9 % total for a smoother day; `TUNE.sim.run.buckets: [0]` turns them off).
- 53,387 people, 845 farm animals in 56 pens, 8 arena beasts, 1,334 dogs and 1,334 cats, 50 carts. Happiness about 90.
- Economy: 280,000 servings of food a day; a week's run (`VC.simDays(1, 7)`) holds every staple at three to four days.
- The page is 10.4 MB (the pets' two baked models are 1.9 MB of it).

## 3. Merging into full-refactor

A trial merge (`full-refactor` + `Voth-sim`, in a throwaway worktree) gives **25 conflicts, 2 of them in source**:

1. **`core/simulation/77-sim-5-motion.js`, the arrived pose.** `full-refactor` stands a group member `back` metres
   *along* its route; `Voth-sim` handles a lazy leg (no route yet). Keep the refactor's, and let a lazy leg use its
   straight line as the route:
   `var Rl = lastL ? (lastL.route || (lastL.lazy ? straight(lastL) : null)) : null;` then the refactor's lines with
   `Rl` for `lastL.route`, and its `else` for no leg. Run `node core/simulation/test-sim.js` and the Dhelv golden
   trace (`godot/tests/dhelv/dhelv_sim_test.gd`) after.
2. **`core/simulation/SCHEMA.md`, the records table.** Both added fields to the same rows: take `Voth-sim`'s rows and
   add the refactor's `spread` (events) and `y`, `node` (ports).

`77-sim-3-actors.js` merges cleanly (the refactor's `spread` and port heights sit beside the itinerary's stops).

The other 23 are generated: every `dist/` page and `build-manifest.json` both sides rebuilt (Mungo, Shade, Streetlab,
the SIM example, the catalog, the fauna kit and its three nomad consumers, interiors, ancients-interiors),
`INDEX.md`, `PORT-INDEX.md`, `core/PORT.md`, `kits/catalog/PORT.md`, `PORT-BASELINE.json`. Do not hand-merge them:

```
git merge origin/Voth-sim                       # on full-refactor; settle the two source files as above
git diff --name-only --diff-filter=U | grep -E '/dist/|build-manifest.json|INDEX.md|PORT.md|PORT-BASELINE.json' | xargs git checkout --theirs --   # any side: rebuilt next
# rebuild everything both branches touched, in this order:
(cd kits/catalog && python3 build.py) ; (cd kits/fauna && python3 build.py)
for k in scyvoi desert-nomads ash-nomads interiors ancients-interiors; do (cd kits/$k && python3 build.py); done
for s in streetlab shade mungo; do (cd settlements/$s && python3 build.py); done
(cd core/simulation/example && python3 build.py)
python3 tools/audit_port.py ; python3 tools/make_index.py
python3 tools/test_all.py                       # the refactor's push checks: node tests (test-sim.js is picked up), rebuilds, baseline
```

The built pages are LFS objects on `full-refactor` (`.gitattributes`): the merging checkout needs `git lfs`. Rewrite
the baseline rows only for the pages rebuilt above, then verify the ones `Voth-sim` changed:
`settlements/streetlab/verify.py dist/voth-city.html --assert` (40 minutes; run it alone), Shade, Mungo, the SIM
example (`check.py`), `kits/fauna/verify.py`. `settlements/streetlab/verify.py` still has its own harness helpers
(the refactor did not touch it); moving it onto `tools/harness.py` is a separate step.

## 4. Where it lands in the refactor's plan

- **Stage 5 (the simulation).** Replace its first bullet with: *"Done on `Voth-sim` and merged: Voth's citizens on
  `core/simulation` (places, the pedestrian layer, 53k actors with homes, jobs and rotas; needs, items, economy,
  carriers, animals; the wake, the lag and the buckets). Next: the Phase F roles, then Verge onto the same core."* The
  three levels of ChatGPT section 22 map onto it already: records (every actor), abstract (the wake skips them, the
  economy counts them), presentation (the bodies, carts, carriers and animals drawn within 220 m).
- **One spatial index** (section 8, `KSPACE` in stage 1): the simulation's place grid (`77-sim-2-places.js`, the
  nearest places for an activity) is a fourth index. It is exact and tested against a full sort; putting it on
  `KSPACE` is a refactor task, not this branch's.
- **Godot** (stage 4, `ksim.gd`): Godot replays baked tasks; it does not re-plan. Two things to carry: a lazy leg
  must be resolved (`SIM.legRoute`) before a task is baked for export; and `77-sim-8-export.js` exports none of the
  new state (meters, belongings, stores, stock, herds, commands, lags). Until Godot steps decisions itself, export the
  baked motion only, and add the economy's and the animals' records to the export when the runtime needs them.
- **Rules kept:** placement by `KRAND` hashes (never draw order), `x == null ? d : x`, data fragments tagged
  `[G data]` and free of the DOM (`tools/check_port.py` passes), UTF-8 and `/` in the builds, nothing from the
  "leave to the refactor" list touched (`Batch.absorb`, the biome core's placement, `core/terrain`, Voth's mask).

## 5. What is left

**Known defects and gaps (fix first):**
1. **River barges by timer.** The `water` layer finds no way from `VOTH.RIVER`'s upstream end to the quays; river
   imports (wheat, corn, wood) arrive by timer. A river channel on the water grid opens it.
2. **Happiness drifts down over a week** (91.8 to 84 in the 7-day run): scraps rise and clothes went short on day 3.
   Not yet traced.
3. **The arena:** a commanded beast walks a straight line through the canton's body to the sand; the stables'
   decorative beasts (`56-vc-interiors-host.js`) are still drawn, so a fighting beast shows twice in the cutaway; the
   Arena and Fortress interior walks still fail (pre-existing).
4. **Verify's windows:** the page opens on day 2 and verify runs days 1-2, before any meat animal grows (the check
   accepts "the next within a day"); the rest day's numbers are its first run's (a second run reads half).
5. **Scarcity by design, worth a decision:** milk (4,600 a day), cheese (570), pork and fowl (a pig or two a day, by
   the one-birth-per-slaughter rule) against 280,000 servings; the 487 warehouses spread stock thin.

**Phase E's remainder:** the warehouse-to-market porters; the barges (above); the animals' feed as a good (fodder
from the fields, drawn by FEED); breeding and real maturity times (the owner: "to come later"); cattle for beef.

**Phase F** (`SIM-ROADMAP.md` 2.7): guards and the night watch (patrols, the crime model, the jail), the Ordinators,
monks and priests, the arena's full bouts (`78j`'s state machine, spectators, bout days), fishing dhows, water taxis
and the pleasure barge, vessel avoidance as a visual offset. `SIM.command` is ready for the guards' orders.
**Phase G:** chains, factions, the player faction.

**Performance (if it matters):** pets cost about a fifth of a rest morning (each is mobile all day): a random walk
along the street graph near home, without a place search, would cut it; the place search itself (0.12 ms a call)
onto `KSPACE`; the half-hour buckets cost 9 % total for a smoother day (keep or drop by the owner's call).

## 6. The owner's calls on this branch (2026-10-12 to 13)

Voth is Streetlab's plan; all 52k citizens are records and stepped; slaves 70 % of farm and mine labour, issued
their kit; shops abstract in phase D, real in E; clothes a year or more, tools a working year, from a hashed start;
the shipwright's dock and nets from the weaver; "add pigs, ducks, cow ranches / coops", milk to cheese, a better
food; "a new animal is born every time one is slaughtered for meat and it takes 1 year to grow up"; "1 dog and 1
cat per 40 citizens, no food demand for now, wander the city and seek socialize"; the decision spreading and "2
buckets separated by 1/2 hour".
