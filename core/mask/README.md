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
| `27-core-mask-distance.js` | [G data] | `KMASK.distance(mask)`: the distance from every pixel to a region (below, "The distance transform"). `KMASK.distanceHash` |
| `test-mask-distance.js` | | its node test: exact against a brute force on random masks, each option with a negative, `golden-distance.json` |
| `kmask_distance_test.gd`, `golden-distance.json` | | `KMask.distance` (in `kmask.gd`) in Godot: the golden's hash and samples (passing in Godot 4.7.2, 2026-10-26) |

```
node core/mask/test-mask.js                 # 'all passed'; --write rewrites golden.json after a meant change
python3 godot/tools/sync_core.py && godot --headless --path godot --script res://tests/mask/kmask_test.gd
node core/mask/test-mask-distance.js        # 'all passed'; --write rewrites golden-distance.json
godot --headless --path godot --script res://tests/mask/kmask_distance_test.gd
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
| Voth | 3988 → 4090 (2026-10-08; graves 1734 → 1841, town 1001 → 986, fields 22 → 19) | same placement hash (`6303bde5`) and mask hash (`6b6bc4fd`) on a default, a `--disable-gpu` and a forced-GPU-raster headless load; a real GPU not yet checked |

Voth (`settlements/voth/src/40-ground.js`) was the last city on a real canvas. Its mask is
`KMASK.xform(KMASK.canvas(2080, 2080))` (its field rectangles are painted under translate and rotate); the 400-cell
shore and low-ground grid that was a small canvas drawn up without smoothing is now one `fillRect` per run of shut cells.
Voth reads the mask as `maskAt > 200`, so a pixel the soft-edged canvas covered by about a fifth was already shut: every
mask shape is grown by `MASK_EDGE` (0.55 px across) to keep that buildable area. Without it the hard edge opened
10462 pixels and placement moved far more (a tavern stood in the river, the central shrine found no site); with it
1576 of 4.3 million pixels differ from the old canvas. Its build lists `core/mask` with its other core modules, and
`src/85-probe.js` publishes `window._masks()`.

Moving a city onto the mask moves its rubble once (GODOT-PLAN.md section 7): each move was checked with a screenshot
pair from the same view and the hash baseline rewritten.

## The distance transform (`27-core-mask-distance.js`, opt-in)

A species' reach (`biomes/hyperjungle/PLAN-LANDS.md` H1: the rims' borrowed species, the drylands swap, howl bamboo out of
the Cut) is a weight from the distance to its home polygon, tens of km where an ecotone is a few hundred metres. The
distance has to be the same on a station page, in the open world and in Godot, so it is computed here, in integers.

`KMASK.distance(mask, opt)` is the exact Euclidean distance transform (Meijster, Roerdink and Hesselink, 2000): for every
pixel, the squared distance in pixels from its centre to the nearest inside pixel's centre (`F.d2`, an Int32Array; 0
inside). Two passes, a column pass and a lower envelope of parabolas per row; the only division is a floor division of
integers, written the same way in `kmask.gd` (`_fdiv`). `F.at(i, j)` and `F.sample(x, y)` (bilinear between pixel centres,
clamped at the edge) take a square root, which IEEE 754 rounds the same way in V8 and Godot: the golden compares the
samples' bytes. The mask is a KMASK canvas, an RGBA image or a one-byte grid (inside: `opt.channel`, default 0, at least
`opt.threshold`, default 128), or `opt.inside(i, j)`. No inside pixel: `F.empty`, every distance Infinity (`d2` -1).

`tools/scale-model/extract_region.py` writes the same numbers for the open world: `dist.png`, one band per biome of the
region (its `dist_band`), each pixel the squared distance in map pixels to that biome's drawn polygon in 24 bits (R high).
Its `dist2` is scipy's exact transform turned back into integers; on the same mask it gives `KMASK.distance`'s `d2` value
for value (checked on random masks and a drawn polygon, 2026-10-26). The polygon is drawn `DIST_PAD` (128 map pixels,
256 km) past the box, so every distance up to that is exact.

### Adopting it

1. The build lists `27-core-mask-distance.js` after `25-core-mask.js` (a biome build: beside its `CORE_BIOME`, and
   `25-core-mask.js` if it does not take it yet). It adds `KMASK.distance` and nothing else: a page that lists it and
   calls nothing is drawn as before.
2. The host makes the home polygon's field once, before placement: paint the polygon on `KMASK.canvas(w, h)` in its frame
   (or read the open world's `dist.png` band: `d2 = R << 16 | G << 8 | B`), `const F = KMASK.distance(cv)`.
3. It hands the biome core a distance in metres: `BIO.host.distance = {cut: BIO.reachField(F, {x0, z0, m})}`
   (`core/biome/README.md`, "Reach and kin"). A species with a `reach` then grows out to its km.
4. In Godot, `KMask.distance(bytes, w, h)` and `KMask.distance_sample(d2, w, h, x, y)` give the same numbers.
