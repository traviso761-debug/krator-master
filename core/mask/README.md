# core/mask: a city's placement raster

The four mask-placed cities (Iziz, Dalab, Erewhon, Roketstad) paint a buildable mask and a street-class map onto 2D
canvases and read the pixels back to place every plot, house and tree. A canvas anti-aliases, and a GPU-backed canvas
and a CPU-backed one draw those soft edges differently, so placement depended on the machine (Dalab's
`willReadFrequently` stopgap, `settlements/dalab/KNOWN_ISSUES.md`), and Godot could not reproduce it at all. This
module is that canvas as data (GODOT-PLAN.md Phase 2 item 5).

| File | Tag | What |
|---|---|---|
| `25-core-mask.js` | [G data] | `KMASK.canvas(w, h)`: a drop-in for `document.createElement('canvas')` on a mask. Its `getContext('2d')` does the calls the painters make, rasterised by an integer-exact rule. `KMASK.hash`, `KMASK.ops`, `KMASK.export` |
| `test-mask.js` | | the node test: each rule with its check and a negative, a fixed city-like scene's hash, `golden.json` |
| `kmask.gd`, `kmask_test.gd`, `golden.json` | | the GDScript twin: replays the ops to the same bytes (passing in Godot 4.5, 2026-10-05); copied to `godot/tests/mask/` by `godot/tools/sync_core.py` |

```
node core/mask/test-mask.js                 # 'all passed'; --write rewrites golden.json after a meant change
python3 godot/tools/sync_core.py && godot --headless --path godot --script res://tests/mask/kmask_test.gd
```

## The rule

A pixel (i, j) is painted when its centre (i + .5, j + .5) is inside the shape: hard-edged, no anti-aliasing.

- **fill**: polygons by the nonzero winding rule (all of a path's subpaths together, so a reversed inner ring is a
  hole); a full-circle `arc` is a disc, distance <= r.
- **stroke**: distance to the polyline <= `lineWidth / 2`: round caps and round joins whatever `lineCap` and
  `lineJoin` say (every painter sets round). A stroked full circle is a ring, | distance - r | <= `lineWidth / 2`.
  Each pixel is painted once per stroke.
- **fillRect**: centres in [x, x + w) x [y, y + h).
- **colour**: `#rgb`, `#rrggbb`, `rgb()`, `rgba()`. Opaque replaces; alpha a < 1 blends, round(src * a + dst * (1 - a)).
- **only full-circle arcs** (0 to >= 2 PI): a partial arc would need trig, which is not bit-exact across engines.
  `getImageData` and `putImageData` take the whole grid; `getImageData` returns a copy.

The arithmetic is +, -, *, / and comparisons in a fixed order (no sqrt, no trig), so `kmask.gd` gives the same
bytes. What a painter computes before it paints (a circle's points from `Math.cos`) is recorded as numbers in the
ops, so Godot replays the ops, not the painter. A `putImageData` (Erewhon's base classes, computed per pixel from its
terrain) records only its hash: replaying it needs the bytes (`KMASK.export(c, { data: true })`).

## Who takes it

Each city's `85-*-paint.js` makes its mask and class canvases with `KMASK.canvas(CS, CS)`; nothing else in the painter
changed. The albedo stays a real canvas. The build lists `mask` in `TARGET_CORE` for its city target, and its
`93-*-ui.js` publishes `window._masks()` (the two hashes and the op count).

| City | Placement, before → after (records) | GPU and CPU canvas loads |
|---|---|---|
| Iziz | 783 → 784 | same placement hash, same mask hashes |
| Dalab | 3349 → 3378 (hard road edges free plots the soft edges blocked); the far forest keeps off the fields by a list of field discs, not by reading the horizon canvas | same |
| Erewhon | 2794 → 2912. Its infill pass still places nothing: the soft edge was not the cause (`settlements/xanadu/KNOWN_ISSUES.md`) | same |
| Roketstad | 3348 → 3482; its furniture moved with its buildings (5513 → 5818 pieces), `core/furnish/fingerprint.json` re-recorded for it | same |

Moving a city onto the mask moves its rubble once (GODOT-PLAN.md section 7): each move was checked with a screenshot
pair from the same view and the hash baseline rewritten.
