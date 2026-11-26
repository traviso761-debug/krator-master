# core/water/tide: the scale model's tides (`KTIDE`)  [G data]

`23-core-water-tide.js` reads the tides record the scale model's tidal calculator bakes
(`tools/scale-model/model/data/tides.json`, made by `tools/scale-model/tides/bake_tides.py`) and answers, anywhere on
Krator's seas, the sea's level about its mean at any time, the day's range, highs, lows and slack, and the peak current.
It replaces the single hand-set sinusoid of `WATER.tide({amp, period, phase})` with the tide the basin's shape gives:
amphidromes where the range is nil, funnelled bays and straits where it is several metres, the Ring Sea's own small tide.

Plain data and pure functions: no three.js, no DOM (Godot reads the same record; see the end).

## The record

`{kind: 'krator-tides', version: 1, pxM: 2000, constituents, encoding, basins: [...]}`; per basin `{id, name, level,
open, x0, y0, cell, nx, ny, amp1, amp2, ph1, ph2, vmax, depth, stats}`. The grids are cell-centred, `cell` scale-model
pixels a side (3 px = 6 km), row-major from `(x0, y0)` in scale-model pixels:

| grid | bytes | meaning |
|---|---|---|
| `amp1`, `amp2` | u16 LE, base64 | D1 (24 h) and D2 (12 h) amplitude in mm; 65535 = dry |
| `ph1`, `ph2` | u8, base64 | phase lag in turns / 256 |
| `vmax` | u8 | the peak depth-mean current, 0.02 m/s a step |
| `depth` | u16 LE | the solver's depth in m |

The level is `eta(t) = A1 cos(w1 t - p1) + A2 cos(w2 t - p2)`, `w1 = 2 pi / Day`, `w2 = 2 w1`, `t` in seconds from the
forcing's epoch (core/clock's seconds; a world that keeps its own clock passes `lag` or shifts `t`). Basins so far:
`nwocean` (the open North-West Ocean, sea level 0) and `ringsea` (the enclosed Ring Sea, level -1500).

## API

```js
const T = KTIDE.load(KTIDE_DATA, {origin: [cx, cy]});   // origin: the scale-model pixel at world (0, 0) (core/world W.px)
T.at(x, z, reach)       // {basin, level, a:[A1,A2], p:[p1,p2], vmax, depth, coast} at world metres, or null
T.atPx(px, py, reach)   // the same at scale-model pixels
T.level(x, z, t)        // metres about the basin's mean, or null on land
T.range(x, z)           // the day's range (high minus low), or null
const S = T.site({x, z} | {px, py}, {gain | range, lag, reach});
S.level(t); S.rate(t);  // metres, metres a second
S.state(t, slack)       // 'flood' | 'ebb' | 'slack'
S.range; S.high; S.low  // the day's range and the times (s in [0, Day)) of its highs and lows
S.waterTide()           // the dominant constituent as {amp, period, phase} for WATER.tide
const unbind = KTIDE.bindWater(WATER, S, {time});   // WATER.seaLevel(t) = PRESETS.sea.level + S.level(time(t)); unbind() restores it
S.day(d); S.spring(t); S.nextSpring(t); S.nextNeap(t)   // springs and neaps (below)
KTIDE.worldSeconds(KCLOCK); KTIDE.decode(b64); KTIDE.OMEGA; KTIDE.DAY
```

- **Interpolation:** the phasors `(A cos p, A sin p)` bilinearly over the wet corners, so the phase never wraps wrong
  across an amphidrome. A point on land within `reach` cells (default 3, 18 km) takes the nearest wet cell's tide (a
  harbour inside a 6 km cell's coast); farther, null.
- **A settlement's own tide:** a 6 km grid cannot see a harbour's own funnel. Keep the place's phase and shape and
  scale it: `T.site(p, {range: 14})` (the Arch's 14 m spring range) or `{gain: 1.5}`; `lag` (s) delays it up a ria.
- **Springs and neaps:** the record's `inferred` list adds the Week's and the Thirteen's semidiurnal tides, inferred
  from each cell's D2 (a constituent close to D2 in frequency answers the basin as D2 does). They beat against D2 every
  3.5 and 6.5 days and are in phase with it at the **Double Dark** (both moons new, world day -0.5) and the **Double
  Full** 45.5 days on: the greatest springs, D2 x 1.45; the deepest neaps fall between, D2 x 0.55. At the Fleetborn Cove
  (mean range 14 m) a day's range runs 9.5 to 18.3 m. `level(t)` and `rate(t)` carry them; `range`, `high`, `low` are the
  mean day's (so `{range}` sets the mean range); `site.day(d)` is world day d's own tide; `site.spring(t)`,
  `nextSpring(t)`, `nextNeap(t)` read the cycle; `{springs: false}` gives the mean tide, the same every day.
- **Time:** the tide's `t` is world seconds, `KTIDE.worldSeconds(KCLOCK)` = (day x 24 + hour) x 3600 (t = 0 is game
  start's midnight). The water's draw calls `seaLevel` with motion time, so bind with
  `KTIDE.bindWater(WATER, S, {time: () => KTIDE.worldSeconds(clock)})`.
- **core/hazard:** where `KHAZ.bindTide` exists (the floating city's tide hazard), `KHAZ.bindTide('sea', S.level)`
  makes the walker's flats and the water one tide.

## Taking it into a build

1. List `core/water/tide/23-core-water-tide.js` by path (after `20-core-water.js` if you bind it; it needs nothing).
2. Inline only your region's cells (the whole record is about 0.8 MB): in `build.py`

   ```python
   sys.path.insert(0, os.path.join(ROOT, 'core', 'water', 'tide')); import tide
   rec = tide.slice_box(tide.read(), x0, y0, x1, y1)      # scale-model pixels round the site
   parts.append('var KTIDE_DATA=' + json.dumps(rec, separators=(',', ':')) + ';')
   ```

   or from the shell `python3 core/water/tide/tide.py --box X0 Y0 X1 Y1 --js KTIDE_DATA > src/24-tides-data.js`. A
   60 x 60 px slice is about 10 KB, and `KTIDE.load` reads a slice as it reads the whole.
3. `const S = KTIDE.load(KTIDE_DATA, {origin: [WORLD.px(0), WORLD.py(0)]}).site({x, z}); KTIDE.bindWater(WATER, S);`
   so open water, shores and anything on `WATER.seaLevel` rise and fall with it.

## Proof

`node core/water/tide/test-tide.js [tides.json]` on the baked record: both basins decode; the mean tide repeats each Day;
springs at the Double Dark and the Double Full, the day's range swinging round the mean, next spring and neap found; a
site's range is the spread of its own levels; a site scaled to 14 m has 14 m; a lag delays the curve; high water is
slack; the interpolated amplitude stays within its corners; a coast point within reach finds the sea and an inland one
does not; `waterTide()` is the dominant constituent in `WATER.tide`'s shape; `bindWater` drives and restores
`WATER.seaLevel`; and a record of another kind, a later version or a grid of the wrong length is refused.

## Godot

The record is plain JSON with base64 grids: `Marshalls.base64_to_raw`, then `decode_u16` / index. The functions are the
three above (bilinear phasor sample, `eta`, its derivative) and port line for line; no Godot side is written yet.
