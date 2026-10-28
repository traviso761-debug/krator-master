# Brief for Gemini: terrain edits and map modes on the Krator Scale Model

Written 2026-10-28. The page is at version 4.23 (artifact version 90). Read this first, then `README.md` in this
folder, which records every past edit and the reasons for it.

## What the page is

The **Krator Scale Model** is one self-contained HTML page (about 8.9 MB) that the owner views at
https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q. Its terrain and climate live in one JavaScript line,
`const DATA = {...};`, as JSON. In that JSON every raster is a base64 PNG or JPEG. The generator that first made those
rasters is **not** in this repo. Every edit since 4.11 decodes the rasters, changes them with numpy, and writes them
back into a new page. You do the same. Do not try to regenerate the world.

The page is not in the repo. You work on a local copy and hand the edited page back. You cannot publish to the artifact,
so the owner (or Claude) publishes it.

## What you need before you start

1. **The current page.** Ask the owner for it. Claude can save it from the artifact with a `read`.
   When publishing, everything before `<title>` and the closing `</body></html>` is the wrapper the service adds.
   Strip it from the file you hand back (`README.md`, end of "4.15 to 4.19").
2. **The regions**: on the page, **Regions → Copy JSON**. You get a list of
   `{id, name, kind: political|geographic|biome, points: [[px, py], ...], color, notes}`.
3. **The settlements**: on the page, **settlements → Copy JSON**, a list of `{id, name, type, px, py, notes, createdAt}`.
4. Save each one as a `.json` file. `extract_region.docs()` reads either a single JSON list or a folder of one file per
   document.

Python 3 with `numpy`, `scipy` and `Pillow`. Every open of a text file names `encoding='utf-8'`, and every write also
names `newline='\n'`. The page is one huge line, so never print or `cat` it. Read `DATA` with `edit_heights.load()`.

## The grids and the rasters

Two grids, both covering the same 3,098 × 2,786 km:

- **Height grid**: `DATA.w` × `DATA.hh` = 774 × 696, about 4 km a cell.
- **Full grid**: `DATA.fullW` × `DATA.fullH` = 1549 × 1393, 2 km a pixel. **Region points, settlement `px/py`, river
  courses and vents are all in full-grid px.** To get a height cell, multiply by `su = (w-1)/(fullW-1)`,
  `sv = (hh-1)/(fullH-1)`.

| Key | Grid | Format | What it holds |
|---|---|---|---|
| `h` | height | PNG RGB | height = `lo + ((R<<8)|G)/65535*(hi-lo)`; B > 127 = water cell. `lo` -2,600 m, `hi` 27,000 m (step 0.45 m) |
| `wl` | height | PNG RGB | water level, same 16-bit encoding; B > 127 = the cell holds water |
| `z` | full | PNG L | zone index into the page's `ZONES`: basin, highland, outer rim, arctic, lake / sea, salt basin |
| `c` | full | PNG L | climate class index into `DATA.climate.classes` (Köppen plus Krator's X abyssal, H hyperalpine, O) |
| `p` | full | PNG L | annual rain: `byte/255*4000` mm |
| `tm` `th` `tl` `tw` `tc` | full | PNG L | °C = `byte - 90`: annual mean, hottest afternoon, coldest night, warmest month, coldest month. A byte of 0 (-90) means airless, with no air temperature |
| `wd` | height | PNG RGB | wind: R = power `wdmax*(R/255)^wdgam` W/m², G = speed `wdvmax*G/255` m/s, B > 127 = airless |
| `st` | full | JPEG | the **satellite** paint |
| `t` | full | JPEG | the **relief** paint. Also the shading the temp and wind modes multiply by |
| `rt` | full | JPEG | the **rain** map, painted |
| `ct` | full | JPEG | the **climate** map, painted |

Vector data on the same line: `rivers` (871 courses: id, name, kind river|wadi, `px`, per-vertex `q_m3s`, width, depth,
`to`), `basins` (lakes), `outlets`, `vents`, `palaeolakes`, `dams`, `floods`, `hydro` (the water books), `climate`.
Write a list or object with `edit_dams.set_data(line, key, value)`. Write an image by swapping its base64 string in place,
as `edit_423.py` does at the end of its `main()`.

## How each map mode gets its picture

This is what "updating the map modes" means. Some modes are computed in the browser from a data raster. Others are
pictures baked into the page. **A height edit changes neither kind by itself.**

| Button | Source | After a terrain edit |
|---|---|---|
| satellite | `st` (painted) | relight; retint if ground moved over ~150 m; repaint for a new climate (see below) |
| relief | `t` (painted) | relight; retint. Temp and wind take their shading from `t`, so they follow it |
| zones | built in the browser from `z` | write the new `z` (from `reclimate`) |
| rain | `rt` (painted) | write the new `p`, **and** repaint `rt` with `repaint()` and the rain ramp `edit_heights.RAIN_RAMP` |
| climate | `ct` (painted) | write the new `c`, **and** repaint `ct` with `repaint()` and the class colours from `DATA.climate.classes` |
| temp | built in the browser from `tm`/`th`/`tl` | lapse every temperature raster with the surface: −6.5 °C per km of rise (water: its level, not its bed). Do not carry the lapse past ~17 km: hold the mean near −75 °C there (`README.md`, 4.23) |
| wind | built in the browser from `wd` | **no script has ever recomputed `wd`.** Over 9 km the page reads airless, so edits up there need nothing. Elsewhere, say what you did or did not do |
| water | the `h` B bit and `wl` | keep both in step: a water cell needs a level, and no edit raises a lake's bed |

The helpers already exist. Import them and do not rewrite them:

- `edit_heights.load(page)` → `(lines, line_index, DATA)`; `raster(D, key, mode)`; `b64(img, fmt, **kw)`.
- `edit_heights.relight(D, Eo, En, keys=('st','t','rt','ct'))` re-shades the paint where the heights moved.
- `edit_422.retint(...)` recolours the satellite and relief where the ground moved more than 150 m, so a lowered peak
  loses its snow.
- `edit_heights.reclimate(D, E, En, whas, forced)` returns new full-grid rain (mm), class, zone, the changed mask and a
  report. A changed cell takes these values from its nearest unchanged twins (place, height, windward slope under the
  NW wind, temperature). `forced` keeps cells you set yourself, such as a cut's salt basin.
- `edit_heights.repaint(D, key, old_col, new_col, mask)` repaints `rt` or `ct` and keeps the baked shading.
- `edit_422.desert(...)` and `by_climate(...)` repaint the satellite to match a new climate. The Catch was "too green"
  until this pass ran: "the Taklamakan is not this green".
- Encoding back: copy the pattern in `edit_423.py`, `enc` and the re-pack of `h`/`wl` into R, G. Then decode what you
  wrote and assert the error is under one step.

## How to make an edit

1. **Start a new script, `edit_424.py`**, from `edit_423.py`. It is the most recent edit and the shortest. Each
   `edit_4xx.py` is the record of one edit: it takes the previous page and is never run on a later one. Do not
   re-run `edit_rivers.py` (that is 4.21's edit). For a river reroute, use `edit_422.py`'s routing.
2. Find the owner's polygon by name and kind in the regions JSON (`docs(path)`, `r['name']`, `r['kind']`), and make a
   mask with `edit_422.region_mask` or `edit_heights.poly`.
3. Change the heights `E` → `En` on the height grid only inside that mask. Feather every edge with a smoothstep
   (`sstep`) over a few cells, so nothing steps at the outline. Clamp to `[lo, hi]`, because a carve below `lo` wraps.
4. Water: a lowered lake bed stays under its level. A carved lake gets a level at its lowest shore cell, so that it
   holds. Never lift a bed. Take the uplift off lakes and ease it back over 2 cells (4.19).
5. Update the map modes as in the table: temperatures, `reclimate` → `p`/`c`/`z` → repaint `rt`/`ct`, then relight and
   retint `st`/`t`.
6. Rivers: if heights moved across a course, check that it still falls from source to mouth. If it doesn't, reroute it
   (`edit_422.py`) and keep its `id`/`name`. Paint changed courses on `st` and `t` (`edit_422.strokes`).
7. Version label: `scale model 4.23 ·` → `4.24`, by regex, asserting one match. Change the legend only if a range moved.
8. Write `<out>.html` and `<out>.report.json`: cells changed, max rise and cut, rain and class changes, river checks.
   **Deterministic**: fixed seeds (`np.random.RandomState(424)`), no time or dict-order dependence. Running it twice
   must give a byte-identical page.
9. Check that everything outside the `DATA` line and the version label is byte-identical to the input page.
10. Add a `## 4.24` section to `README.md` in the same style: what the owner asked, what the script did, the numbers.

## Checks before you hand it back

- Decode error under one 0.45 m step. No height outside `[lo, hi]`.
- No river course climbs. No lake bed rose. Every water cell has a level.
- Rain and class agree, so no humid rain sits under a desert class. 4.19 found 885 such cells after 4.18.
- Look at the result. Render `st`, `rt`, `ct` and a relief crop of the edited area to PNG. Compare them with the old
  crops: no seams at the polygon edge and no banding. Report what you saw.
- Then list what the edit leaves stale. Regions cut for the open world (`extract_region.py` outputs under `openworld/`
  and `settlements/*/region/`) that hold the edited place need a re-extract, and docs that quote a changed height
  need updating.

## Things not to do

- Do not edit the page's UI or JavaScript unless asked. If you must, patch it with exact-string replacements that
  assert one match (see `patch_ui.py`).
- Do not change regions or settlements in the page's database. The owner edits them in the page.
- Do not paint a procedural texture over a surface without saying so.
- Do not commit the page. It is 9 MB, and the artifact is its home. Commit the script, the report and the README section.
