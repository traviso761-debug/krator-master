# settlements/loj-twenny: Loj Twenny (20), the first Tungang hold

A cavern loj at the far end of the 25 km branch from the Twenny junction (station 3 on the Line), laid on core/city's cavern
setting, drawn with the Tungang set, run on the simulation layer. `PLAN.md` is the plan (where it is, the hold, the sim, its
core adoption).

- **Page:** `dist/loj-twenny.html`.
- **Build:** `python3 tools/build.py settlements/loj-twenny` (runs `build.py`, records `build-inputs.json`).
- **Check:** `python3 verify.py dist/loj-twenny.html --assert` (`KRATOR_GL=gpu` for the real GPU), with `--all-views` for the
  walk-through's shots; `node tests/test-lt-sim.js` (the hold's sim three days: stocks, turns, trades, the Big Meeting, the books).

| Key | What |
|---|---|
| F | walk; walk through an open door of the shuttle to board, E by a seat sits |
| V | the follow camera |
| X, ] [ | the deck cut and the deck; H the rock cut; U the band; C the section |
| M, L | the map with the deck band; the line map (the branch, the junction, the great shaft) |
| O | the stocks (SIM's) |
| `?hour=` | the hour the page starts at (8.4 by default: the shuttle stands at the platform) |

| Fragment | Tag | What |
|---|---|---|
| `src/20-lt-plan.js` | [G data] | `LT`: the hold's plan on `KCITY.cavern.lineHold` |
| `src/40-lt-sim.js` | [G data] | `LTS`: the hold on `core/simulation` |
| `src/42-lt-ride.js` | [G data] | `LTR`: the branch shuttle as a ride source, its cars as walk frames |
| `src/50-lt-cavern.js` | [G data] | `LTC`: the rock carved in KCAVERN from the plan |
| `src/60-lt-scene.js` | [web] | the scene, the rock drawn, the terminus's works, the lamps as records |
| `src/64-lt-hold.js` | [web] | the sites registered and drawn by `TG.tg.draw` |
| `src/66-lt-train.js` | [web] | the shuttle's cars posed |
| `src/70-lt-light.js` | [web] | KCAVELIGHT's records and host |
| `src/80-lt-life.js` | [web] | the clock, the sim stepped, the people, the count wall |
| `src/90-lt-checks.js` | [web] | `LTCHK`: the page's checks and their negatives |
| `src/98-lt-take.js` | [web] | `KHOST.take` with the underground pieces |
