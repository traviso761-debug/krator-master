# The scale model page: index

`build.py` puts these together in this order (its `ORDER`) into `dist/scale-model.html`. The script fragments are
consecutive pieces of one `start()` function, which `20-decode.js` opens and `90-ui.js` closes. They share its local
variables, so a fragment can use what an earlier one declared.

## src/

| Fragment | Lines | What |
|---|---|---|
| `00-head.html` | 111 | `<title>`, the fonts, the stylesheet |
| `10-panel.html` | 103 | the panel (readout, legends, map-mode buttons, settlements and regions sections), the draw and measure bars, the hint, the three.js tag and `<script>` |
| *(DATA)* | 1 | `const DATA = {...};`, written from `data/` |
| `20-decode.js` | 22 | `ZONES`, image loading, and `start()`: decodes heights, water, rain, class, temperatures and zones |
| `21-scene.js` | 20 | renderer, camera, lights, the terrain plane, the painted textures (`t`, `rt`, `ct`, `st`) |
| `22-temp-ramp.js` | 9 | the temperature colour ramp |
| `23-wind.js` | 31 | the wind layer, drawn from `wd` and shaded by `t` |
| `24-temp-map.js` | 14 | the temperature layer, drawn from `tm`/`th`/`tl` and shaded by `t` |
| `25-zones.js` | 7 | the zones layer, drawn from `z` |
| `26-overlay.js` | 8 | the region overlay canvas draped on the terrain |
| `27-water.js` | 9 | the water surface mesh (each lake at its own level) |
| `30-vents.js` | 53 | volcanic vents: lava floors, glow, smoke; vertical exaggeration |
| `31-orbit.js` | 50 | orbit controls |
| `32-fly.js` | 27 | WASD fly |
| `33-hover.js` | 44 | picking, the hover readout (elevation, zone, air, rain, class, temperature, wind, river) |
| `40-regions.js` | 8 | the region state |
| `41-region-layers.js` | 27 | political / geographic / biome layers and tabs |
| `42-labels.js` | 64 | region labels, straight or along a long region's spine |
| `43-region-list.js` | 62 | areas, the overlay paint, handles, the list, selecting and editing a region |
| `44-region-draw.js` | 17 | drawing a region; Copy JSON |
| `45-region-status.js` | 3 | the store's status line |
| `50-measure.js` | 90 | the distance ruler and its profile |
| `51-region-store.js` | 19 | regions in the shared store (`db`), with a per-browser fallback |
| `60-settlements.js` | 195 | the settlements layer: glyphs, labels, list, add, import from (city) regions, Copy JSON, store |
| `90-ui.js` | 24 | map-mode buttons (`setMap`), resize, the animation loop; closes `start()` |
| `99-tail.html` | 4 | `</script>` |

## data/

Each key of `DATA`, in the page's order (`model.json`). Grids (unified in `5.1`): *height* 1821 × 1723 (2 km a cell), *full* 1821 × 1723 (2 km a pixel; expanded northwest by `+272, +330` from the 4.23/4.24 `1549 × 1393` canvas).

| File | Grid | What |
|---|---|---|
| `h.png` | height | heights, 16 bits over [`lo`, `hi`] in R, G; B > 127 = water |
| `wl.png` | height | water levels, the same encoding; B > 127 = water here |
| `t.jpg` / `st.jpg` | full | the relief and satellite paint |
| `rt.jpg` / `ct.jpg` | full | the rain and climate maps, painted |
| `p.png` | full | rain, `byte / 255 * 4000` mm a year |
| `z.png` | full | zone index (`ZONES` in `20-decode.js`) |
| `c.png` | full | climate class index into `climate.json`'s `classes` |
| `tm` `th` `tl` `tw` `tc` `.png` | full | °C + 90: mean, hottest afternoon, coldest night, warmest month, coldest month; 0 = airless |
| `wd.png` | height | wind: R power, G speed (scales `wdmax`, `wdgam`, `wdvmax` in `model.json`), B > 127 airless |
| `rivers.json` | | 885 rivers and dry valleys: course in map px, discharge and bed per vertex, width, depth, 5.1 `name` and 4.21/4.23 `old_name` |
| `volc.json` | | the central Volcano (`Throne`) summit caldera coordinates, rim peak, and lava floor |
| `tubes.json` | | 15 subterranean lava tube & cavern systems (`id`, `name`, `system`, `px`, `portals`, `width_m`, `height_m`) |
| `basins.json`, `outlets.json`, `vents.json`, `palaeolakes.json`, `dams.json`, `floods.json` | | lakes, lake outlets, vents, the old dam lakes, dams, breach floods |
| `domes.json` | | the pancake domes (5.1 edit 2): `id`, `name`, `region`, `px`, `d_km`, `base_m`, `top_m`, `h_m`, `rock`, `notes`; the page does not draw them (the heights do) |
| `climate.json`, `hydro.json` | | the class table and assumptions; the water books and thresholds |
| `model.json` | | key order, the scalars (`w`, `hh`, `lo`, `hi`, `fullW`, `fullH`, wind scales, `legacy_shift`, `tsunami_farside`), each key's file |
