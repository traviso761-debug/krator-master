# iziz-variants (dev target): tower stumps, and the Iziz variants check

Work item: the paused low-priority items from the 2026-09-29 handover.

## BASE WARNING (read first)

This branch was cut from `1672677` (the port round 3 merge), which does **not**
contain `ancients-resume` (ahead by ~100 files, including the towers QA round 2:
stance changes, `skyShards`, `skyRooms`, `skyHoist`, `tick()`). The brief says to
`git reset --hard ancients-resume` in that case; the reset was refused by the
session's permission classifier, so everything here was built and verified on
the OLD base. All the work is in new files plus three small additive edits, so it
should merge onto `ancients-resume` cleanly, but it must be re-verified there
(one `verify.py` round of this target).

## 1. Iziz variants: these already existed

- **Towers on small plinths** — `targets/iziz-style` (`izsShowTower`): Skyscrapers
  A-F are measured (`measureKit`), their podiums trimmed (`trimPlinths`) and the
  shaft lowered onto a small stepped square plinth (`izsShowPlinth`), exactly as
  the Iziz city places them (`settlements/iziz/targets/city/90b-city-build.js`,
  `placeKit` + `citySkyPlinth`). They call the kit builders, so they pick up the
  round-2 shards, rooms and hoists by themselves. Nothing rebuilt.
- **The Sky C tripod market** — `src/77z-iziz-style.js` `tripodMarket`, shown on
  the repaired C in `iziz-style` and used by the Iziz city (`IZ_TRIPOD`): three
  great awnings hung from the leg pairs at 38 m out to masts, stalls under each
  and in the open triangle. Not rebuilt. Raised where it fell short:
  - **BUG (on `ancients-resume`):** it hardcoded the legs at r=62. Round 2 moved
    them to r=50, so every awning, mast and stall would hang 12 m off the legs.
    `tripodLegR(G)` now reads the foot radius off the built tower (the three leg
    groups at y=5), falling back to 62; the awning line follows `LR-(LR-20)*...`.
  - **No crowd.** 90 figures (the kit's `figB`/`figH`, as `figures()` lays them)
    through the shade and the open triangle, clear of the leg feet, on the plinth
    top. Placed by position hash, not `rng()`, so nothing built after the market
    moves (matters in the Iziz city, which calls it mid-stream).
  - Vendoring: `settlements/iziz` vendors `77z-iziz-style.js`; its
    `--vendor-check` will report this drift until it is re-vendored.

## 2. Tower stumps — `src/8an-iz-stumps.js`

One helper, `skyStump(scene,gx,gz,d,fam,o)`, and per-family builders
`buildStumpA..K` (map: `STUMP_BUILDERS`, keys `stumpA..stumpK`). It does not
redraw any tower: it runs the family's own builder, then snaps it (comment at the
head of the fragment has the whole method):

1. turns the sibling by `ry` about its axis (a different face and hole pattern
   from the ruined tower beside it, which comes from the same seed);
2. drops every triangle and instanced item above a ragged break: a plane falling
   toward +z (the row camera) by `slant`, with an fbm edge;
3. keeps the band just above the break (shell, lining, plates; not glass) as two
   or three fallen pieces of the tower's own fabric, rolled outward and dropped
   (`dropFragment`) beside the foot, plus a talus and broken slabs;
4. turns and cuts the registered volumes; drops those wholly above the break.

Per-family numbers in `STUMP_FAM`: `f` (break height as a fraction of the
tower's registered height), `band`, `ry`. Decay: 0/1 = snapped ruin (sibling at
decay 1), 2 = snapped lower (f*.62), 3 = the sibling at decay 3 (the scene's
HOLES and repairPass camp in it). `o` overrides f/ry/band/slant per call.

Seeds: parent seed + 5 (`9105+d` ... `9175+d`, `9765+d`, `9775+d`, `9785+d`),
claimed N..N+4 by the scan, clear of everything on both this base and
`ancients-resume` (checked with `git grep`). The allocated 9990-9994 is
`buildDish` on `ancients-resume` (and 9995+d is `buildMega`), so it was not used.

Because the stump is built from the tower's builder, it inherits whatever the
tower has on the branch it is built on (round-2 shards/rooms/hoists included).
Builders that publish per-decay site data (`SI_SITE`, `SJ_SITE`, `SK_SITE`) are
saved and restored around the sibling build, so a stump never moves a tower's
presets.

## Shared-file edits (for the coordinator)

- `build.py`: `TARGET_OUT['iziz-variants']` (one line).
- `src/91-probe.js`: one `Object.assign(BUDGET.type,{stumpA..stumpK:'sky'})`
  line after `BUDGET`.
- `src/77z-iziz-style.js`: `tripodLegR` + crowd in `tripodMarket` (above).
- No kit rows added.

## Verification (on the old base, 2026-10-01)

`build.py --target iziz-variants` -> `jscheck.py` PARSES OK -> `verify.py --assert`:
error panel clean, every invariant PASS (90 registered volumes non-empty, no NaN,
per-type budgets, showcase 3.45 M / 6 M scene triangles, 454 / 900 draw calls at
the worst view). Shots read for every family row and the close stump views.

Bugs found by the shots and fixed: a triangle-count slip (`lost` compared
triangles to indices) left J's core uncut whenever the counts happened to match,
and inflated the per-type tally; a centre-only test kept long instanced items
(J's mast, K's campanile) whose middle sat below the break, so items now go when
their top is >3 m above it; fallen pieces landed among A's struts and C's legs, so
they now lie past the podium edge.

Triangles per stump (scene triangles, sibling tower at decay 1 for comparison):

| | tower d1 | stump d0/1 | stump d3 |
|---|---|---|---|
| A | 107 212 | 67 235 | 77 806 |
| B | 182 038 | 118 328 | 129 236 |
| C | 179 796 | 150 339 | 160 511 |
| D | 74 716 | 65 032 | 69 909 |
| E | 63 558 | 52 648 | 63 820 |
| F | 65 854 | 60 605 | 62 882 |
| G | 97 356 | 90 461 | 97 667 |
| H | 90 594 | 72 723 | 83 015 |
| I | 67 044 | 56 898 | 54 036 |
| J | 114 292 | 95 269 | 113 556 |
| K | 175 894 | 124 328 | 132 531 |

The stumps keep most of a tower's triangles because the podium, legs, base
blocks and dressing are the bulk of each type; C keeps its whole tripod by design.
`mktC/3` (the tripod market check row: repaired C + market) is 230 094.

## Round 2 (after the merge into ancients-resume)

- FIXED the floating block in 'Stump G': the break took G's top-tier core and
  bridges but kept the one surviving top-tier block whole, 10 m above the tier
  under it. Step 2b of `skyStump` is a support check for every stump: a mesh whose
  kept fabric starts more than 8 m up must have another kept mesh or instanced
  item reaching from at/below its underside to within 6 m of it, over its
  footprint, or it falls (repeated until stable). What it carried goes with it
  and it leaves rubble below. Across all eleven families at decays 0 and 3 only
  G drops anything (that one block). A first try with a 3 m gap also dropped
  E's and F's whole shafts, which stand 5 m clear of the podium top on their
  cores; 6 m keeps them and still drops G's 10 m gap. Verified on the merged
  base: invariants PASS, error panel clean, shots read (G from the kit's angle, E, F, A, H).
- Not mine: the ruined Skyscraper G itself keeps a top-tier block over the 10 m
  tier gap (the builder's own stack design).

## Open

- Re-verify on `ancients-resume` (see BASE WARNING). Expect the stumps to carry
  the round-2 shards/rooms/hoists and the A/B/C podiums at 92/66/80.
- The tripod market's awnings are one-sided-dark from below at kit scale (their
  normals follow the cloth's winding; the Iziz city sees them at .3 scale from
  the street). Not changed.
- The stumps share their sibling's seed, so a stump is the ruined tower's base
  turned by `ry`. Distinct enough in the shots; a per-stump hole seed would need
  an edit in every tower builder.
- Kit rows for the stumps are the coordinator's (`stumpA..K` beside each tower;
  suggested `ds:[1]` or `[1,3]` at an x the row has free).
