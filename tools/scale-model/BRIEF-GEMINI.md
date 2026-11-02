# Brief for Gemini: terrain edits and map modes on the Krator Scale Model

Written 2026-10-28 for the model at version 4.23 (artifact version 90). Read this first, then `README.md` in this folder:
its "Layout" and "Making an edit" sections are the workflow, and its "History" sections record every past edit and why.

## What the model is

The **Krator Scale Model** is a single HTML page, about 8.9 MB, that the owner views at
https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q. It is built from this repo:

- `model/data/`: the terrain and climate, as PNG/JPEG rasters and JSON files (`model/INDEX.md` lists each one);
- `model/src/`: the page's markup, style and script, in fragments;
- `model/build.py`: writes `model/dist/scale-model.html` from the two.

The generator that first made the rasters is not in the repo. An edit therefore loads the data, changes it with numpy
through the `smodel` library, and saves it back. Do not try to regenerate the world. You cannot publish the artifact:
you hand back the changed `model/data/`, your script and its report, and the owner (or Claude) builds and publishes.

## What you need before you start

1. **A checkout with LFS** (`git lfs pull --include="tools/scale-model/model/data/*"`). A raster that is a few hundred
   bytes is an LFS pointer, not the image.
2. **The regions**: on the live page, **Regions → Copy JSON**. You get a list of
   `{id, name, kind: political|geographic|biome, points: [[px, py], ...], color, notes}`.
3. **The settlements**: on the live page, **settlements → Copy JSON**, a list of `{id, name, type, px, py, notes, createdAt}`.
4. Save each one as a `.json` file and read it with `smodel.page.docs(path)`.

Python 3 with `numpy`, `scipy` and `Pillow`. Every open of a text file names `encoding='utf-8'`, and every write also
names `newline='\n'`. First run `python3 tools/scale-model/model/build.py` and `python3 tools/scale-model/tests/test_smodel.py`,
to check your checkout builds and the library passes.

## The grids and the rasters

> **5.1 Unified Grid Note:** As of Scale Model `5.1`, the canvas was expanded northwest by **`(+272, +330)` px** (`smodel.page.LEGACY_SHIFT`) from `1549 × 1393` to **`1821 × 1723` (`3,642 × 3,446 km`)**, and the height grid was promoted to full `2 km/cell` resolution (`D['w'] × D['hh'] = 1821 × 1723`, `su = sv = 1.0`). Use `smodel.page.legacy_px(px, py)` when converting legacy `4.23/4.24` (`1549 × 1393`) coordinates.

In `4.23/4.24`, two grids covered the 3,098 × 2,786 km interior (in `5.1`, both are `1821 × 1723` at 2 km/cell):

- **Height grid**: `D['w']` × `D['hh']` = 1821 × 1723 (2 km a cell in `5.1`; 774 × 696, ~4 km a cell in `4.23`).
- **Full grid**: `D['fullW']` × `D['fullH']` = 1821 × 1723, 2 km a pixel (1549 × 1393 in `4.23`). **Region points, settlement `px/py`, river
  courses and vents are all in full-grid px.** `su, sv = smodel.page.grid(D)` turns a map px into a height cell.

`D` is the `DATA` object the page holds, with each raster as a base64 string. `smodel.page.raster(D, key, mode)`
decodes one; `model/INDEX.md` lists what each key holds. In short:

- `h` and `wl`: heights and water levels on the height grid (16 bits over `lo`..`hi`; read them with `smodel.page.heights` and `water_levels`, write them with `encode_heights` and `encode_levels`).
- `p` rain, `c` climate class, `z` zone, and `tm` `th` `tl` `tw` `tc` temperatures: data rasters on the full grid.
- `wd`: wind, on the height grid.
- `st` satellite, `t` relief, `rt` rain and `ct` climate: **painted** JPEGs on the full grid.

Vector data: `D['rivers']` (871 courses), `basins`, `outlets`, `vents`, `palaeolakes`, `dams`, `floods`, `hydro`, `climate`.
Assign to `D[key]` and `smodel.page.save(D)` writes each to its own file.

## How each map mode gets its picture

This is what "updating the map modes" means. Some modes are computed in the browser from a data raster. Others are
pictures baked into the data. **A height edit changes neither kind by itself.**

| Button | Source | After a terrain edit |
|---|---|---|
| satellite | `st` (painted) | `paint.relight`; `paint.retint` where ground moved over ~150 m; `paint.desert` / `paint.by_climate` for a new climate |
| relief | `t` (painted) | `paint.relight`; `paint.retint`. Temp and wind take their shading from `t`, so they follow it |
| zones | built in the browser from `z` | write the new `z` from `climate.reclimate` |
| rain | `rt` (painted) | write the new `p`, **and** repaint `rt`: `paint.repaint(D, 'rt', paint.ramp(old_mm), paint.ramp(new_mm), changed)` |
| climate | `ct` (painted) | write the new `c`, **and** repaint `ct` with `paint.repaint` and the class colours in `D['climate']['classes']` |
| temp | built in the browser from `tm`/`th`/`tl` | `climate.lapse`: −6.5 °C per km the surface rose. Do not carry it past ~17 km: hold the mean near −75 °C there (`README.md`, 4.23) |
| wind | built in the browser from `wd` | **nothing recomputes `wd`.** Over 9 km the page reads airless, so edits up there need nothing. Elsewhere, say what you did or did not do |
| water | the `h` B flag and `wl` | keep both in step: a water cell needs a level, and no edit raises a lake's bed |

## How to make an edit

1. **Start a new script, `tools/scale-model/edit_424.py`.** Begin it with
   `D = smodel.page.load(); E, water = smodel.page.heights(D); whas, wlev = smodel.page.water_levels(D)`.
   `history/edit_423.py` is the shortest worked example and `history/edit_422.py` the fullest (a river reroute). Read
   them, but do not run them on today's data: they hard-code the old height range.
2. Find the owner's polygon by name and kind in the regions JSON, and make a mask with `smodel.geom.region_mask` or `poly`.
3. Change the heights `E` → `En` on the height grid only inside that mask. Feather every edge with `smodel.geom.sstep`
   over a few cells. `smodel.terrain` has mountains, humps, cuts, levels, lowering a perched lake, and weathering.
   `encode_heights` clamps to `[lo, hi]`.
4. Water: a lowered lake bed stays under its level. A carved lake gets a level at its lowest shore cell. Never lift a
   bed: take the uplift off lakes and ease it back over 2 cells.
5. Update the map modes as in the table: `climate.lapse`, then `climate.reclimate` → `p`/`c`/`z`, repaint `rt`/`ct`,
   then `paint.relight` and `paint.retint` on `st`/`t`.
6. Rivers: if heights moved across a course, check it still falls from source to mouth. If not, reroute it the way
   `history/edit_422.py` does (`smodel.rivers`: `grid_fields`, `setup`, `trace`, `cut_channel`) and keep its `id` and
   `name`. Paint changed courses with `smodel.geom.strokes`.
7. Version label: change `scale model 4.23 ·` to `4.24` in `model/src/10-panel.html`, asserting one match. Change the
   legend there only if a range moved.
8. `smodel.page.save(D)`, then `python3 tools/scale-model/model/build.py`. Write `edit_424.report.json` beside the
   script: cells changed, max rise and cut, rain and class changes, river checks. **Deterministic**: fixed seeds
   (`np.random.RandomState(424)`), so running it twice gives the same data.
9. `git diff --stat tools/scale-model/model` should show only the files you meant to change.
10. Add a `## 4.24` section to `README.md`, under "History", in the same style: what the owner asked, what the script did, the numbers.

## Checks before you hand it back

- No height outside `[lo, hi]`; `encode_heights` asserts the round trip.
- No river course climbs. No lake bed rose. Every water cell has a level.
- Rain and class agree, so no humid rain sits under a desert class. 4.19 found 885 such cells after 4.18.
- Look at the result. Render `st`, `rt`, `ct` and a relief crop of the edited area to PNG. Compare them with the old
  crops: no seams at the polygon edge and no banding. Report what you saw.
- Then list what the edit leaves stale. Regions cut for the open world (`extract_region.py` outputs under `openworld/`
  and `settlements/*/region/`) that hold the edited place need a re-extract, and docs that quote a changed height
  need updating.

## Things not to do

- Do not edit `model/src/` (the page's code) unless asked, beyond the version label.
- Do not change regions or settlements in the page's database. The owner edits them in the page.
- Do not paint a procedural texture over a surface without saying so.
- Do not edit `history/`, and do not commit `model/dist/`.
