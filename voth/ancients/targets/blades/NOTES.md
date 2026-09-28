# The Blades — hand-back notes (IN PROGRESS; kept current)

`src/8ag-blades.js` · `buildBlades(scene,gx,gz,d)` · seed 9640+d (claims 9640-9641
for DECAYS=[0,1]) · target `blades` · intact at x=-2400, ruined at x=+2400.
Prefix `bl`/`BL_` (`BL_SITE`, `MAT.bl*`, `TEX.bl*`, kdefs `bl*`).

## PATH TAKEN: the arcology (NOT the skyI fallback) — the no-go test, first

The question: can one blade carry a double-loaded plan (rooms, corridor, rooms)
at a thickness that still reads as a blade?

* A double-loaded dwelling slab: 2 x 11.5 m room depth + 3.0 m corridor + 2 x
  0.4 m facade = **26.8 m** clear, call it 27 m.
* Blade thickness at the foot: **36-46 m** (six blades), tapering as
  `t(x) = t0 (1 - 0.6 x^1.5)` with x = fraction of the blade's length, so the
  double-loaded plan holds up to x ~= 0.64 (36 m blade) .. 0.75 (46 m blade) —
  the lower two-thirds to three-quarters of every blade. Above that, where the
  blade curls out and thins to 14-18 m, it is single-loaded (rooms + gallery)
  and then sky gardens in the upturned face of the curl.
* Does it still READ as a blade? Measured as ratios against the reference's own
  blades (by eye from the photo: ~1:3 to 1:5 thickness:width in plan, ~6%
  thickness:height):
  - plan, thickness : width at the foot: 46:205 = 1:4.5 (widest) .. 36:130 =
    1:3.6 (narrowest). Same band as the reference.
  - elevation, thickness : height: 46 m / ~850 m = **5.4%**; 36 / ~450 = 8%.
    The reference is ~6%.
  - from 2 km, a 46 m edge subtends 1.3 deg against 24 deg of height: a fin.
* **Result: GO.** At arcology scale the blade is thin RELATIVE to its height
  and width precisely because it is so large; 27 m of rooms is 3-5% of an
  800 m slab. The no-go the handover feared bites at TOWER scale (a 300 m
  skyscraper's blade would be ~10% thick at 27 m and read as a slab tower), not
  here. So this is the arcology, with the reference's blade proportions and no
  quiet thickening.
* Population, as a sanity check that it is a city: six blades, mean width
  ~160 m x mean double-loaded thickness ~32 m x ~150 floors of 4 m over the
  inhabited height ~= 4.6 M m2 gross -> **~90 000 people** at 50 m2 gross each.

(Build details, measured numbers, views and weaknesses follow as they land.)
