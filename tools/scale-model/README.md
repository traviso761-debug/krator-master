# Scale model tools

Scripts that edit the **Krator Scale Model** artifact
(https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q), now version 4.21. The artifact's rasters live inside the page
(a `DATA` object on one long line); the generator that made them is not in this repo, so these
scripts edit the decoded rasters directly and write a new page.

Working folder: decode every base64 raster from the 4.9 page (`orig.html`) into `<key>.png/.jpg`,
export the regions collection from the artifact's database as JSON, then:

1. `inner_wall_smooth.py 50 6`: soften the Inner Wall's outer flank, about 50 km either side of
   the 'Inner Crater' outline (writes `old_e.npy`, `new_e.npy`). Save `new_e.npy` as `e411.npy`.
2. `features.py <regions> <mesa ids>... --bay <id> --isles <id> 0.2`: weather the mesas in the
   given regions, carve the Bay of Voth off the Ring Sea, and raise geyser islands over 20% of the
   West Ring isles' water (heights, water, levels, geysers, masks).
   For 4.13, save that pass's outputs as `e412.npy`, `water412.npy`, `whas412.npy`, `wlev412.npy`,
   `feat412.npz`, then `features2.py <regions> --water <id> --flatten <id> --border <id> 80
   --join <id>`: region 42 to shallow sea, region 41's plateaus lowered, the cliff on Crag Men's
   northern border eased (80 km either side), Spice isle joined into one landmass.
   For 4.14, save 4.13's outputs as `e413.npy`, `water413.npy`, `whas413.npy`, `wlev413.npy`,
   `feat413.npz` (and its island geysers as `geysers413.json`, copied back to `geysers_new.json`),
   then `features3.py <regions> <4.13 page> --bridge <id> 485,520 575,504 --geysers <id> 5`: the
   land bridge from Spice isle to the volcano (checked connected), and geysers on land placed far
   from every vent and well inside the region (`geysers_land.json`).
3. `assemble.py 4.14 out.html`: write the heights and water, re-shade the textures to the new
   relief, paint the islands from East Ring Isles donors and the bay from the sea, update zones,
   climate class and temperatures, add the geysers to `vents`.
4. `patch_ui.py out.html final.html`: political / geographic / biome region layers, the tabbed
   list, the layer switch on each region, and labels along long, thin regions.

Everything is deterministic (fixed seeds).

## 4.15 to 4.19: `edit_heights.py` (Oct 2026)

`edit_heights.py <4.14 page> <regions.json> <settlements.json> <out page>` edits the 4.14 page in one pass and writes
`<out>.report.json` beside it:

1. **The lakes.** A water body standing more than 600 m over the lower quartile of its shore is lowered to it, unless
   the model records its outlet (`DATA.outlets`, a lake over falls). 4.14 held five such pools in and north of the
   eastern abyss (levels 0, -50 and -900 m over a floor near -2,300 m); 366 cells.
2. **The eastern abyss as an escarpment** (the owner: like the Inner Wall's inner rim). Round the abyss's floor, each
   rim cell is placed between the floor's and the plateau's level there and its share of the rise sharpened: the
   plateau runs level to the edge and drops within about one cell. Steepest step 1,192 -> ~2,400 m per 4 km cell.
3. **The valley of Yuni**: ranges of ridged noise flank an axis from Yuni to the north-west (peaks to ~4.5 km), closed
   by a head ridge south-east of the city; the valley floor stays near 650 m and opens north-west toward the abyss.
4. **Mountains in marked regions** (4.16): every region named in `MOUNTAINS` is filled with ridged peaks that rise from
   its edge to its middle and join the land by the higher of the two. 'Region 61' (the owner's, the valley of Yuni's
   south-eastern head): peaks to ~4.7 km.
5. **4.17, from the owner's marked regions:** `GENTLE` ('east rim', 'Region 64') keep the gentle drop they had in 4.14
   (no escarpment there); the valley of Yuni's mouth runs down its axis to the abyss's floor in one long ramp;
   `HUMPS` ('Region 62') raises the abyss's floor ~750 m into a saddle between the basins north and south of it;
   `CUTS` ('Region 63') cuts the region to the floor (-2,330 m) with a salt lake (-2,305 m) at its middle, a gentle rim
   round it, and its climate class and zone set to abyssal desert and salt basin (the lake: abyssal salt lake).
6. **4.18:** `LEVELS` ('passage') brings a region to an average height (+200 m) with its relief softened and its edge
   blended on every side; then **rain, climate class and zone are recomputed** wherever the heights changed (`reclimate`).
   The generator that made them is not in the repo, so a changed cell takes them from the unchanged land cells most
   like it nearby (place, height, windward slope under the north-west wind, mean temperature: 12 nearest, weighted),
   the rain smoothed and the classes majority-filtered so new ridges are not banded; the rain and climate maps (`rt`,
   `ct`) are repainted where they changed (each pixel scaled by its new colour over its old, keeping the shading).
   4.18 recomputed 18,362 cells; 7,945 changed class.
7. **4.19:**
   - **The class follows the cell's own climate.** 4.18 voted the class apart from the rain, so 885 cells took a humid
     rain (over 1,000 mm) under the abyssal desert class: half inside Region 63, whose cut forced the class but kept the
     rain the land had before. Now a cut's rain is the dry abyss floor's (the median of XW within 40 px, ~220 mm, eased
     4 px into its edge), and each recomputed cell takes its class from its nearest twins in climate (rain, the mean,
     warmest and coldest temperatures, air pressure), only among classes whose 2nd to 98th percentile of rain it falls in.
     A cut's forced cells are no twins. No majority filter on the class (the climate decides it). XW over 1,000 mm: 0.
   - **No edit raises an existing lake's bed:** uplift is taken off the lakes and eased back over 2 cells (the valley's
     north-east range had run its toe into the lake at Locus, lifting 16 cells to +300 m under water at -2,400 m).
   - **Rivers (`RIVERS`):** routed by least cost over the edited heights (climbing dear, low ground cheap) from a source
     to the water cells of a lake (`to`: a region's lake, or `('near', <settlement>)` the lake nearest it), the bed carved
     40 m deep and falling all the way, the banks eased; drawn on the satellite and relief maps along a smoothed,
     gently meandering course; written into `DATA.rivers` (`name`, `px` the course in map px, `to`). The Yuni river:
     from the valley's head (730 m) past Yuni, down the mouth's ramp and into the lake at Locus (-2,400 m).
   - **The region tool (`UI_FIXES`):** `importCityRegions` never closed, so the settlements' hover sat inside it and
     every pointer move threw once it had run; and region handles were picked by ray against spheres a few pixels
     across. Now the function closes, handles are picked in screen space (the nearest within 16 px, the camera's
     matrices refreshed first) and drawn twice the size. Tested in a browser: a drag started 9 px off a corner moves it
     and saves.
   - Heights are clamped to the format's range when written (a carve below -2,600 m wrapped to +17 km).
8. The painted images are re-lit where the heights changed and the temperatures lapse-corrected. The climate class and
   zone rasters are recomputed since 4.18 (step 6).

Publish the result to the artifact's URL (strip the document skeleton the read returns: everything before `<title>`
and the closing `</body></html>`).

## 4.20: `edit_dams.py` (Oct 2026)

`edit_dams.py <4.19 page> <regions.json> <out page>` edits the **4.19** page (not 4.14: it is the next stage, as
`features2.py` followed `features.py`) and writes `<out>.report.json` and `<out>.heights.npz` (the heights before and
after, the old lakes, the dams) beside it. It imports `edit_heights.py`'s helpers (relight, reclimate, repaint).

The owner's north basin (the regions 'dam 2', the east lobe, and 'dam', the west lobe, in "n semiarid"): the Ancients
held two lakes there behind dam arcologies, and in the war that ended them the east dam burst first; its surge
overtopped the west dam, which burst into the long-lake trough and the NW lowlands. The model is the land today:

- **The notches** (`DAMS`): each dam's pass is cut to its foot (lake level + 50 m freeboard - the dam's 250 m), the
  floor ~12 km wide over the pass's own floor, the walls eased on the pass's sides only; beyond the crest the flood
  channel falls until the land falls below it. East dam: lake 1,050 m, pass 1,335 m cut 485 m. West dam: lake 900 m,
  the southern saddle (1,160 m) cut 460 m.
- **The rims:** with the dams standing, every other way out of each lake (to Korona's trenches, the other lake, the
  lowlands) is closed by smooth bumps at the saddle the flood finds. 4.19's east lobe spilled to Korona at 370 m: two
  ridges on its Korona side (~80 km and ~50 km) now stand at 1,120 m.
- **Checks** (asserted): each lake holds with its dam standing and drains through its notch to the foot without it;
  the east lake's breach (~11,500 km³) raises the west lake ~240 m, over its dam's 50 m freeboard.
- **Data:** `DATA.palaeolakes` (each old lake's level, area, volume), `DATA.dams` (site, crest, foot, the cut),
  `DATA.floods` (each breach channel's course in map px and its bed). Rain, class and zone are recomputed where the
  heights changed (4.18's `reclimate`); the channels are tinted as scoured rock on the satellite and relief maps.
- Everything outside the `DATA` line and the version label is byte-identical to 4.19 (checked).

The scablands' own landforms (coulees, dry falls, potholes, current ripples, gravel bars) are under one 4 km cell:
they are for the open world to carve along `DATA.floods`, not for the model.

## 4.21: `edit_rivers.py` and `hydro.py` (Oct 2026): the rivers

`edit_rivers.py <4.20 page> <regions.json> <settlements.json> <out page>` audits the valleys (nothing may flow uphill)
and designates every river and dry valley with its flow and size, for the open world to place. It writes
`<out>.report.json` (the audit) and `<out>.rivers.png` (the network over the relief map) beside the page. Deterministic;
about five minutes. The 4.21 audit is kept as `rivers-4.21.report.json` and `rivers-4.21.jpg`.

- **The water** (`hydro.py`): runoff from rain and the mean temperature by Turc's balance (`L = 300 + 25T + 0.05T^3`
  also taken as open water's evaporation). The airless rim gives nothing; ground whose annual mean is under -10 C
  carries ice, not rivers.
- **The water books, basin by basin** (the owner: a crater sealed by a mostly airless rim, the ocean to the north-west
  its only outside moisture; the eastern basins walled by airless mountains and very dry). The map is cut into basins
  along ground over `BARRIER_M` (5 km: moist air does not cross it). The crater, which touches the ocean, may rain what it
  evaporates plus the rain within `IMPORT_KM` (300 km) of that ocean (~6,300 m3/s); Turc's L alone left ~19,700 m3/s
  over that, so L is scaled until the books close (x1.27). Every other basin is sealed: it may rain only what it
  evaporates, and where the model's rain is more (its generator brought moisture over the rim) the rivers run on less
  of it: the rift 83%, the eastern crater ring 32%, the NE plateaus 42%, the SE plateau 6%. The painted rain map is
  left as it is. Before this, the surplus filled the closed basins (the rift's seas rose 400-1,200 m).
- **The dam lakes settled** (`SETTLE`; the owner: the dams in the north basin held lakes at distinctly different
  heights; the east dam burst first and broke the west one; today the lakes are not joined, and a river runs down each
  breach channel). The model drew all three at 0 m. Each one's water is taken away and the land routed again, and it
  stands where its water settles, in its own basin: the east lake at -64 m (14,568 km2), the west lake at -85 m
  (4,059 km2), the long-lake trough at 426 m (28,494 km2); asserted not joined. A river runs down each breach: 42 m3/s
  from the east notch (838 m) into the west lake, 13 m3/s from the west notch (688 m) into the trough.
- **The western lakes drain to the Ring Sea** (`OUTLETS`; the owner). The western ring catches the ocean's moisture and is
  closed below 957 m, so its two great lakes rose and joined. Each now has an outlet gorge, the course that cuts the
  least ground, its sill at the lake's level (a hollow on the way fills as part of the lake), its bed falling all the
  way, its walls eased half down. The SW lowlands' lake: 204 km to the Ring Sea, cut through 152 km, at most 627 m deep.
  Ancient's Valley's: 180 km into the SW lowlands' lake, at most 476 m deep (without it the lake rises to ~870 m). Both
  stand near their drawn level (-8 m, 22 m) and run out: the great river down the SW gorge carries ~5,700 m3/s. The
  gorges are written as `DATA.outlets` (course, bed) and shaded into the satellite and relief maps.
- **The Iron Republic's lake** (`RESHAPE`; the owner: back to around its drawn size). The model draws it at 3,600 m over
  almost all of its shore (149 of 156 shore cells lower, down to 2,175 m): its outline lies across a deep trough and up
  its sides, so no single level and no staircase of lakes fits it, and left to its water it shrinks to 2,880 km2. It is
  kept to its drawn outline (7,171 km2) at 2,400 m: the bed under the outline is deepened (a glacier-scoured basin, by up
  to ~1,200 m, all under water), the 8 shore cells under 2,400 m are raised as rock bars (by up to 245 m), and its
  outlet is cut by `OUTLETS`: 248 km to the Ancient's Valley lake, through 156 km at most 198 m deep. The river that
  leaves it, *Kaskejt Rivr*, carries ~880 m3/s.
- **The routing:** the Ring Sea (-1,500 m) and the oceans at the edge end flow, and so does every lake the model draws
  below its own spill (as drawn). Every other hollow fills and spills, unless what reaches it is less than its full lake
  would lose: then it is endorheic and its lake stands where the two balance. A hollow whose only way out is over frozen
  ground is closed; if it still gains water it is flagged `unbalanced` (its surplus is the owner's to settle).
- **The audit and the fix:** courses are traced (a river: mean flow 10 m3/s or more; a dry valley: 2,500 km2 of
  catchment carrying less). Wherever one climbs it is crossing a hollow the 4 km grid holds: no deeper than 150 m, the
  grid's (a gorge narrower than a cell), and the course is cut through, falling all the way; deeper, a river fills it,
  so it becomes a lake at its spill (`through lake`). Rounds of routing, cutting and routing again until no course
  climbs; then it asserts that every course falls (or runs level on water) from its source to its mouth.
  4.21: 416 rivers (44 over 100 m3/s, 2 over 1,000) and 438 dry valleys.
- **The Yuni river** keeps its drawn course and the routing is held to it. On the 4.20 heights it climbed four times
  (49, 135, 11 and 459 m: the escarpment's sharpening raised the lip above Locus after 4.19 cut its bed); its bed is
  cut to fall all the way.
- **Beast Riders** (the owner: its river basin lay partly below sea level, better rendered fully as river): the Ring
  Sea's narrow arms up its valleys (water a 2-cell disc does not fit, 517 cells) become land, and every dry cell of the
  region below the sea and joined to it (floors to -2,250 m) is raised to run down to the shore at 3 m per km; the
  painted maps take the land beside them, the temperatures lapse.
- **What the audit found and left** (the report's `lakes` and `basins`): 26 closed lakes gain water (the level-0 lakes
  of the west, the rift's terminal seas, the eastern crater) and would rise to spill; 26 lakes stand over their own
  shore; the south-eastern plateau gains ~1,800 m3/s and has no way out but over the 8 km rim (`unbalanced`): an
  outlet, a rain shadow or a large lake is the owner's call.
- **Data:** `DATA.rivers` (each: `id`, `name` (provisional: the smallest region holding most of it), `kind` river or
  wadi, `order`, `length_km`, `catchment_km2`, `q_mouth_m3s`, `width_m` and `depth_m` at the mouth (w = 4.5 Q^0.5,
  d = 0.35 Q^0.38; a dry valley's flash-flood bed 3 A^0.35), `to` (the sea, a lake, a basin or the river it joins),
  `settlements` within 12 km, and per vertex `px` (one per height cell), `bed_m`, `q_m3s`; the Yuni river's drawn
  course is `drawn_px`). `DATA.basins` (the endorheic and through lakes, `unbalanced` ones), `DATA.hydro` (method and
  thresholds). The page's readout gains a **river** row (the nearest course within 6 km: its flow and width). Rivers are
  painted on the satellite and relief maps, wider with flow.
- **Names** (`river_names.py <4.21 page> <regions.json> <out page>`, run after `edit_rivers.py`): every course lying
  mostly inside a region whose tongue is on record (`lore/tongues-of-krator.html`) is named in it: English words run
  through that tongue's regular changes (Vothic *Tzolt Rivrh* salt river, Izani *Rrivar Rreda*, Dalab *Folriba*,
  Tl'aai *Tl'aa Baatar*, Dasri *Wadi al-Jost*, Xanadui *Alph* for its greatest, Yuni *Saltie Rivvo*...), the word chosen
  from the course itself (salt where it ends in a salt basin, cold, swift, falls, long, red in a dry land, the
  settlement it passes) and then from each tongue's own pool. 317 of 854 named, each with `tongue` and `gloss`: the
  Scyvoi's in Boruntun (*Borun Gulusu*, *Madır Kiriki*; the polity and both 'crater drylands'), Screamer Country's in
  plain English, the caravans' (*Howling Gulch*); the rest keep provisional names (no tongue on record for their region). The list: `river-names-4.21.md`.
- **The lakes compared** (`lake_compare.py <4.21 page> <4.20 page> <out dir>`): the 36 lakes of the model's own that
  the audit flags (no outlet at their level and gaining water, or standing over their own shore) have their water taken
  away and the land routed again; where it settles is each lake's answer (balances, fills and overflows, or drains
  away). Basin by basin, with the western outlets and the settled lakes, 12 grow and 15 shrink (30,338 km2
  flooded, 38,264 km2 laid dry); the rift's terminal seas and the eastern basins' lakes balance. The lake at Locus still rises ~590 m: the ranges round the
  valley of Yuni (4.15-4.17) took 1,000 mm and more of rain from 4.18's recompute, 143 of its 337 m3/s. Kept as
  `lakes-4.21.compare.json` and `lakes-4.21.diff.jpg` (blue both, orange gained, yellow lost); the swipe page is the
  "Krator Lakes in Balance" artifact. Nothing on the model page changes.
- `extract_region.py` now carries every river at its own width and depth with its discharge per vertex (`rivers`), and
  the dry valleys as `valleys` (beds without water); the escarpment is kept off the owner's drawn courses only.
  `openworld/little-demo/data` is still from 4.19: refresh it (its README) to place the rivers there.

## Cutting a region out for the open world

`extract_region.py <page.html> <regions> <settlements> "<region name>" <out dir>` reads the same page (no edit) and
writes what an open-world build reads: the heights and water on their own grid, the climate class, rain, temperature,
the biome overlays (smaller wins an overlap; uncovered pixels take the nearest overlay), the region's mask, the
drainage network, the named rivers (`DATA.rivers`: the course every 4th point with the carved height under it, a
width and a water depth), the settlements inside the polygon and the canyon candidates for each ruin. The escarpment's
sharpening is kept off a named river's corridor (off within 3 cells, back by 6): the river's descent is the owner's. `openworld/little-demo/`
is the first user (its README.md says how to refresh it).
