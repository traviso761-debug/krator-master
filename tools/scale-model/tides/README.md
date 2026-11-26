# The scale model's tidal calculator

```
python3 tools/scale-model/tides/bake_tides.py            # writes model/data/tides.json (about 3 minutes)
python3 tools/scale-model/tides/bake_tides.py --quick    # a 1 + 1 day smoke run, to --out somewhere else
```

`bake_tides.py` decodes the model's heights (`model/data/h.png`) and water levels (`wl.png`), cuts each sea basin's
depth at 2 km, and runs `solve_tides.js` on it. The record it writes, `model/data/tides.json` (about 0.8 MB, plain
JSON beside the model's other lists), is what `core/water/tide` (`KTIDE`) reads: per 6 km cell the amplitude and phase
of the D1 (24 h) and D2 (12 h) constituents, the peak current and the depth. Its format and the reader's API are in
`core/water/tide/README.md`; a build inlines a slice of it (`core/water/tide/tide.py --box`).

**Rerun it after any edit that moves the coast or the sea floor** (an `edit_5xx.py` on `h.png` or `wl.png`), commit the
new `tides.json` with the edit, and run `node core/water/tide/test-tide.js`. The solver is deterministic (float64, no
randomness), so an unchanged model bakes the same bytes.

## The physics (`solve_tides.js`)

- **Equations:** 2D barotropic linear shallow water (Laplace's tidal equations) on a C-grid at 6 km (3 model pixels),
  with quadratic bed drag (Cd 0.0022, semi-implicit), Coriolis on an f-plane per cell from the cell's latitude (Scale
  Model 5.1's frame, the globe's), g = 7.4 m/s^2, a minimum depth of 2 m. Open edges (the North-West Ocean's west and
  north) radiate (Flather) against the equilibrium tide; an enclosed sea (the Ring Sea) has only its own body forcing.
- **Forcing (Krator's equilibrium tide):** the moon is locked to the Giant, so the Giant raises no moving tide; what
  is left is D1, its libration from a heat-flow-consistent eccentricity (`E_DYN` 4.5e-5, about 0.8 m of range) and its
  obliquity nod (`INC_DYN` 1.8e-4, about 0.5 m) plus the Day's daily conjunction wave, and D2, solar S2 with the Day's
  close pass and the Four-Day moon. The constants are at the top of the solver with their sources (LORE.md,
  `core/atmos/89-atmos-e-skymodel.js`).
- **Analysis:** 2 Days of spin-up, then a least-squares fit of `A1 cos(w t - p1) + A2 cos(2 w t - p2)` over 2 whole
  Days per wet cell (`--quick`: 1 + 1). t = 0 is the forcing's epoch.
- **Springs and neaps (`inferred`, not solved):** the Week's (6.87 d orbit, phases every 7.0 d) and the Thirteen's
  (12.55 d, every 13.0 d) semidiurnal tides, at 0.28 and 0.17 of D2's forcing (`INFERRED` in `bake_tides.py`, owner's
  numbers), inferred from each cell's D2 response. Springs every 3.5 and 6.5 days; the greatest at the Double Dark
  and the Double Full (every 45.5 days); the semidiurnal tide runs from 0.55 to 1.45 of the mean. Change the ratios and
  `bake_tides.py --inferred-only` rewrites only that list. The Four-Day moon (a 16 h tide) and the Two-Day (24 h) are
  folded into D2 and D1 for now.
- **Basins** (`BASINS` in `bake_tides.py`): a box in model pixels and the band of water levels that is that sea:
  `nwocean` (0, 0, 700 x 720; level 0; open) and `ringsea` (685, 695, 370 x 330; level -1,500; enclosed). A new sea is a
  new entry: its box, its level band, open or not.

## What it gives (the 2026-11-25 bake)

| basin | wet cells | median range | max range | max current |
|---|---|---|---|---|
| North-West Ocean | 26,801 | 1.24 m | 5.85 m | 2.33 m/s |
| Ring Sea | 5,961 | 1.09 m | 3.04 m | 1.69 m/s |

A 6 km grid cannot see a harbour's own funnel (the Arch's 14 m spring range is a ria's resonance): a settlement keeps
the cell's phase and shape and scales it, `KTIDE.load(...).site(p, {range: 14})`.
