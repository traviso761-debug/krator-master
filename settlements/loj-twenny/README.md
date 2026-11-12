# settlements/loj-twenny: Loj Twenny (20), the first Tungang hold

The hold at station 3 of the Line (the Twenny junction), under the great shaft (the owner, 2026-11-11), laid on core/city's
cavern setting over the Line's own station, drawn with the Tungang set, run on the simulation layer. `PLAN.md` is the plan (where it is, the hold, the sim, its
core adoption).

- **Page:** `dist/loj-twenny.html`.
- **Build:** `python3 tools/build.py settlements/loj-twenny` (runs `build.py`, records `build-inputs.json`).
- **Check:** `python3 verify.py dist/loj-twenny.html --assert` (`KRATOR_GL=gpu` for the real GPU), with `--all-views` for the
  walk-through's shots; `node tests/test-lt-sim.js` (the hold's sim three days: stocks, turns, trades, the Big Meeting, the books, the needs, the meals, the rot and the ice, the hold's mood; then a blight of the beds in a second process, to grumbling and a refused demand: `PLAN.md` 4.1).

| Key | What |
|---|---|
| F | walk; walk through an open door of the segment's train to board, E by a seat sits |
| V | the follow camera |
| X, ] [ | the deck cut and the deck; H the rock cut; U the band; C the section |
| M, L | the map with the deck band; the line map (station 3 between Shelf and the G2 gap, the great shaft up to the fells) |
| O | the stocks (SIM's) |
| `?hour=` | the hour the page starts at (8.4 by default: the train stands at the east platform) |
| `?state=` | the station's state (`kept` by default; the Line's `built` and `abandoned` are its what-ifs) |

| Fragment | Tag | What |
|---|---|---|
| `src/20-lt-plan.js` | [G data] | `LT`: the hold's plan on `KCITY.cavern.lineHold` |
| `src/40-lt-sim.js` | [G data] | `LTS`: the hold on `core/simulation` |
| `src/42-lt-ride.js` | [G data] | `LTR`: the segment's train as a ride source (station 3 to the G2 gap), its cars as walk frames |
| `src/50-lt-cavern.js` | [G data] | `LTC`: one KCAVERN: station 3's own primitives and the plan's |
| `src/60-lt-scene.js` | [web] | the stage the Line's drawing reads, the rock drawn, the hold's ways' bands and lamps |
| `biomes/line/stations/...` | | station 3, read in place: 44z, 44zs, 47, 47b, 47c, 48 (data), 85, 86, 87, 88 (drawing); `kits/ancient-transit` 40-56c |
| `src/64-lt-hold.js` | [web] | the sites registered and drawn by `TG.tg.draw` |
| `src/66-lt-train.js` | [web] | the segment's train's cars posed |
| `src/70-lt-light.js` | [web] | KCAVELIGHT's records and host |
| `src/80-lt-life.js` | [web] | the clock, the sim stepped, the people, the count wall |
| `src/90-lt-checks.js` | [web] | `LTCHK`: the page's checks and their negatives |
| `src/98-lt-take.js` | [web] | `KHOST.take` with the underground pieces |
