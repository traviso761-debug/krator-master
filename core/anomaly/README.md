# core/anomaly (`KANOM`): where physics fails

The zones of the Ancient's Valley where gravity grows or reverses, time slows or races, the land bends, space is larger
inside, or a door leads elsewhere (`biomes/ancientsvalley/PLAN-ANOMALIES.md` sections 4 and 14). Built 2026-11-10 for the
valley's next stations, the Stilled Ground and the Press (the owner: "work on effects we're gonna need for stations 1 and 2").

| File | Tag | What |
|---|---|---|
| `20-core-anomaly.js` | `[G data]` | `KANOM`: the records and the arithmetic. No THREE, no DOM |
| `host/90-anomaly-walker.js` | `[web]` | `KANOM.bindWalker(C)`: the host camera's walker in a zone (opt-in by path) |
| `test-anomaly.js` | | `node core/anomaly/test-anomaly.js`: 42 checks, each with a negative |

## The rules (PLAN-ANOMALIES.md 2)

- **Records first.** `KANOM.add(o)` checks and fills a record; `KANOM.register(T)` puts every record (and every later one) in
  a `core/tags` registry, with its hazard on `core/hazard`, before anything is drawn.
- **Bounded and graded.** A circle or a polygon; the strength ramps from 0 at the edge to its full value at `rim` metres in
  (a smoothstep), and is 0 outside its height band.
- **Free when absent.** With no record in reach, `KANOM.at` returns `KANOM.NORMAL` (one frozen object), `KANOM.walk` returns
  `KANOM.WALK0` and `KANOM.squash` returns `KANOM.IDENTITY`: a reader can test identity and do nothing.
- **Deterministic.** A record's seed is `KRAND.hash(registry seed, index, 'ANOM')`; overlaps combine in id order.

## Calls

```
KANOM.add({kind: 'time', shape: {type: 'circle', at: [x, z], r: 140}, rim: 70, time: 1e-4})     the Stilled Ground
KANOM.add({kind: 'gravity', shape: {type: 'circle', at: [x, z], r: 140}, rim: 60, g: 3})          the Press
KANOM.at(x, y, z)        -> {g, time, bend, k, ids}   gravity and time multiplied in log scale (3 g at half strength: 1.73 g)
KANOM.walk(at)           -> {speed, eye, step, bob}   factors on the walker; speed never below PRESETS.walk.min (.12)
KANOM.squash(at | g)     -> {sy, sxz, sink, floors}   the Press's placement: shorter, spread, sunk, storeys kept (1/g)
KANOM.owed(S, rate, dt)  -> S {owed, aged}            the world's time owed on leaving a slow zone (capped at a day)
KANOM.hazardOf(rec)      -> core/hazard's record      time < 1: `time` (stasis); > 1: `aging`; g > 1: `crushing`; g < 0: `lift`
KANOM.near(x, z, r), KANOM.zones(), KANOM.export(), KANOM.create({seed}) (a registry of its own), KANOM.reset()
KANOM.bindWalker(C, {anom, hook}) -> Wk {step(dt), state, unbind()}   bind after ATMOS.init (it hooks ATMOS's frame)
```

## The hazard rows

`crushing` (the Press: its own row, the owner 2026-11-04; fatal at the core), `aging` (fast time) and `lift` (reversed gravity)
are `KANOM.HAZARD_KINDS`. They are put into `KTAGS.VOCAB.hazardKinds` when the file loads (or at the first add), only where a
row of that name is missing, so a page without `core/anomaly` is byte-identical: PLAN-ANOMALIES 8 had them in `core/tags`, which
would have rebuilt every page for rows only the valley reads. `tags.anomaly` joins the keys the same way. Radiation (`rad`,
`PLAN.md` 9) is not here yet: its dose and soak want their own row when Necropolis is built.

## Drawing it

The records draw through the shared effects: `core/atmos/fx/89-atmos-fx-localtime.js` (`ATMOS.localFx`, the frozen and the heavy
particles: pass `rate: (x, y, z) => KANOM.at(x, y, z).time` and `g: (x, y, z) => KANOM.at(x, y, z).g`), placement through
`KANOM.squash`, the Bend through `KWARP` (`core/shader`). `core/atmos/fxdemo` shows them (`#scene=stilled`, `#scene=press`).

## Not yet

The walker's vertical state (`vy`, the lift felt), `KCLOCK`'s jump on leaving (the owed time is counted; jumping the world is
the host's), fast time's age bands, portals and the House as `KANOM` records (the House is still the valley's own: `41c`, `75`),
a GDScript twin with golden vectors (the module is plain data, so it is a port, not a rewrite).
