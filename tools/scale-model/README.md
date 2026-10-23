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
about five minutes. Run it twice: the second time with `--rain <the first run's page>`, so the rivers run on the
rain recomputed for the land they cut (4.21: passes 2 and 3 agree to 0.08 mm on average). The 4.21 audit is kept as `rivers-4.21.report.json` and `rivers-4.21.jpg`.

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
  way, its walls eased half down. The SW lowlands' lake: 200 km to the Ring Sea, cut through 152 km, at most 627 m deep.
  Ancient's Valley's: 180 km into the SW lowlands' lake, at most 476 m deep (without it the lake rises to ~870 m). Both
  stand near their drawn level (-8 m, 22 m) and run out: the great river down the SW gorge carries ~5,700 m3/s. The
  gorges are written as `DATA.outlets` (course, bed) and shaded into the satellite and relief maps.
- **The Iron Republic's lake** (`RESHAPE`; the owner: back to around its drawn size). The model draws it at 3,600 m over
  almost all of its shore (149 of 156 shore cells lower, down to 2,175 m): its outline lies across a deep trough and up
  its sides, so no single level and no staircase of lakes fits it, and left to its water it shrinks to 2,880 km2. It is
  kept to its drawn outline (7,171 km2) at 2,400 m: the bed under the outline is deepened (a glacier-scoured basin, by up
  to ~1,200 m, all under water), the 8 shore cells under 2,400 m are raised as rock bars (by up to 245 m), and its
  outlet is cut by `OUTLETS`: 256 km to the Ancient's Valley lake, through 164 km at most 293 m deep (round a settlement). The river that
  leaves it, *Kaskejt Rivr*, carries ~880 m3/s.
- **The NW lowlands' lake** (`OUTLETS`, `SETTLE`; the owner: it must not rise and drown the river valley north-west of it).
  Closed and gaining ~1,400 m3/s, it would rise ~300 m. Its outlet runs 352 km north-west to the ocean at the map's edge
  (only the edge ocean is its target: to the Ring Sea or the Ancient's Valley lake it would cut the north basin's rims or
  join the lakes), cut through 332 km at most 582 m deep. Drawn at the ocean's own level, a gorge from it is an arm of the
  sea, so the lake stands at 50 m (its hollow holds 28,762 km2 there, against 28,345 at 0 m) and the bed falls evenly to
  just over the ocean's level, never under it (`cut_channel(..., floor)`; the ocean cell at the mouth, drawn as water
  over 109 m of ground, is lowered under it, or it dams the gorge). The lake settles at 46 m (26,985 km2, drawn 26,408)
  and *Farside river* runs out of it, ~1,430 m3/s.
- **The Hyperjungle's lake** (`OUTLETS`, `SETTLE`, `SHALLOWS`; the owner: smaller, off the Empire of Iziz's core). The
  model draws it at -1,160 m over 8,053 km2 with no shore on its west, straight over the salt lake's depression on the
  Iziz plain (down to -2,435 m, under the Ring Sea's level). Its water settles with the depression's as one lake; at their
  pass (-1,393 m) it would stand over Iziz (-1,423 m), so an outlet at -1,495 m runs 200 km to the Ring Sea itself, round
  the depression (an outlet bound for the Ring Sea never crosses dry ground under the sea's level, and no outlet runs
  through a settlement). Then its bed under less than 200 m of water is raised to land, 10 m over the level and rising
  inland (5,487 km2): 7,525 km2 stay at -1,499 m, against ~14,700 shown before (the lake and the salt lake together).
- **The eastern abyss's floor rebuilt** (`ABYSS_LAKES`; the owner: scattered long, snaky lakes, about as much water). The
  floor is a chain of pits between sills 1-3 km high. Its drawn lakes (all but the lake round Locus, where the Yuni river
  ends, which stays) are taken away and the water routed: it settles over 9,193 km2 (a basin whose lake balances under
  its brim holds only that lake; joined water stands at one level). Each of those lakes is laid out
  again in its own basin as a winding lake of its area x 1.15, along the basin's long axis and swinging across its width
  (seeded, deterministic), its bed cut 120 m under its level (cuts up to 490 m), its walls kept over it, the rest of its
  old bed filled to just over the level and falling to it, then blended into the ground round it; three with no room
  stay as they settle. Old lake 18's moat round its island is joined to the lake north of it (`merge`, the owner): at
  that lake's level (-1,817 m) the moat's basin round it and the island's flanks are filled over the level (up to 734
  m), and a channel cut between them; together they balance at -1,915 m over 1,813 km2. In all 6,642 km2 of old beds
  filled; routed again, 8,760 km2 of water in 19 lakes (1,091 km2 off the troughs). The old beds are repainted on the satellite and relief maps from the land
  round them (`inpaint`), so no old shoreline shows. Lake 18's saddle gorge and the settling of the lake north of Locus
  went with the old floor.
- **The rivers west of the abyss run into it** (`ABYSS_WEST_KM`, `ABYSS_CUT_M`; the owner). Every closed hollow on the
  plateau within 300 km west of the abyss floor with at least 2,500 km2 of catchment is cut through to the floor from its
  own floor (`cut_channel`), where that cuts no more than 600 m (as deep as the western outlets): 21 hollows, 1,432 km cut,
  at most 566 m deep. Two are left (`abyss_left`): px 963,170 (806 m) and px 811,290 (1,327 m).
- **The routing:** the Ring Sea (-1,500 m) and the oceans at the edge end flow, and so does every lake the model draws
  below its own spill (as drawn). Every other hollow fills and spills, unless what reaches it is less than its full lake
  would lose: then it is endorheic and its lake stands where the two balance. A hollow whose only way out is over frozen
  ground is closed; if it still gains water it is flagged `unbalanced` (its surplus is the owner's to settle).
- **The audit and the fix:** courses are traced (a river: mean flow 10 m3/s or more; a dry valley: 2,500 km2 of
  catchment carrying less). Wherever one climbs it is crossing a hollow the 4 km grid holds: no deeper than 150 m, the
  grid's (a gorge narrower than a cell), and the course is cut through, falling all the way; deeper, a river fills it,
  so it becomes a lake at its spill (`through lake`). Rounds of routing, cutting and routing again until no course
  climbs; then it asserts that every course falls (or runs level on water) from its source to its mouth.
  4.21: 418 rivers (48 over 100 m3/s, 3 over 1,000) and 445 dry valleys.
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
- **The lakes compared** (`lake_compare.py <4.21 page> <4.20 page> <out dir>`): the lakes of the model's own that
  the audit flags (no outlet at their level and gaining water, or standing over their own shore) have their water taken
  away and the land routed again; where it settles is each lake's answer (balances, fills and overflows, or drains
  away). Basin by basin, with the outlets and the settled lakes, 25 are flagged: 9 grow and 16 shrink (8,920 km2
  flooded, 38,344 km2 laid dry); the rift's terminal seas and the eastern basins' lakes balance. Its water books are on 4.21's
  rain over 4.20's water, as `edit_rivers.py` drew them: on 4.21 the NW outlet joins that lake to the ocean by water, and the books
  read off 4.21 would count it as ocean and import the rain within 300 km of it too (18,600 m3/s, not 6,300). The lake round Locus, left to its water, keeps 1,444 of its
  1,620 km2 (the abyss's rebuilt lakes hold what used to reach it in excess). Kept as
  `lakes-4.21.compare.json` and `lakes-4.21.diff.jpg` (blue both, orange gained, yellow lost); the swipe page is the
  "Krator Lakes in Balance" artifact. Nothing on the model page changes.
- **Region 65 lowered** (`LOWER`; the owner: down to the abyss's level, its edges smoothed). The region's ground goes
  down to the median of its floor (-2,319 m), keeping 4% of its height over it; the land outside eases down to it over
  4 cells (a smoothstep) and the band is blurred, so no step is left; nothing is raised. Its east side was the trench's
  wall (to +433 m): lowered by up to 2,642 m, 6,369 km2 by more than 10 m. It runs before the abyss's lakes are laid out,
  so its new floor takes part in them, and in the rain, rivers and climate.
- **The climate** (step 7): wherever 4.21 moved the ground or a water surface (the gorges, the raised and filled beds,
  the abyss's floor, the dried and settled lakes), the temperatures lapse with it (6.5 C per km) and the rain, climate
  class and zone are recomputed from the unchanged land most like each cell (`edit_heights.reclimate`, as 4.18-4.20
  did); the rain and climate maps are re-lit and repainted. The abyss's rebuilt floor takes its rain from 4.20's own
  lake effect over today's lakes (`lake_rain`; the owner: desert spits between the new lakes). On 4.20 the floor is
  wet beside its lakes (median ~1,460 mm within 4 km, half the wet abyssal class XA) and dry far from them (~200-450
  mm): the floor's rain is a dry background (4.20's rain on floor land far from its water) times the ratio 4.20's floor
  shows at each share of water within ~12 km, made monotone, over the final lakes; `reclimate`'s `force_rain` sets it
  before the class is chosen, so the class follows it. Land between the lakes now reads ~1,500 mm, 62% XA (4.20's own
  spits: ~1,690 mm, 57% XA). The lake effect feeds back on the lakes, so the build runs three times (`--rain`).
- **The Bowl's lakes in their own look** (`LAKE_STYLE`; the owner: all alike, with the rim). The Bowl's lakes grew and
  joined and laid an arm east; today's water there is painted as the Bowl's own 4.20 lakes were, the colour at each
  distance from the shore sampled from them: an ochre salt rim ~5 px inside the shore, a teal core, a pale salt flat
  ~8 px outside fading into the ground by ~14 px (`lake_style`; the rim narrowed on water too narrow for it, the fine
  texture kept), on the satellite and relief maps.
- **The Lake of Shim** (`CARVE`; the owner's to-do and the region's note, 2026-10-18). Carved in its outline (465 km2)
  as features.py carved the Bay of Voth, at the land's level there: the level of the water it opens into, the SW
  lowlands' lake (its lowest shore, so it holds), the bed 3 m under it at the outline and 25 m in the middle, the banks
  outside easing down to 25 m over it within 2 px. It settles with that lake (-9 m) as its north lobe at the outlet, the
  Shim river entering from the lake to the south and leaving north down the outlet's gorge; Shim (382,788) stands dry on
  its eastern shore.
- **Shallow beds the abyss's lakes spread over** (`ABYSS_LAKES['beds']`; the owner: regions 'lower' and 'lower2'). After
  the lakes are laid out, each region is brought down under the level of the largest lake beside it, 2 m at its
  outline and 15 m in the middle, and kept out of the old beds' filling; the water routed onto the floor then fills
  them as far as it reaches: 'lower' about half (the joined island lake balances at ~-1,804 m, under the bed's shallow
  edge), 'lower2' about three-fifths. The abyss's lakes hold ~10,400 km2 (from ~9,500). With the beds the lake effect
  settles more slowly: the fifth pass is kept (rain 0.13 mm from the fourth on average, 131 mm at most).
- **Dip Rivrh, Almua's river** (`NAMED_COURSES`; the owner, 2026-10-18, `settlements/almua/PLAN.md`). The coast cell within
  10 px of Almua (446,553) best drained into the Ring Sea is found, and its main stem traced upstream by catchment; a
  course already drawn down that valley takes the name if it reaches the mouth, else the named course starts below the
  last cell they share (its bed cut to fall 0.5 m a cell where a hollow is crossed). It is the outflow of the lake Drïm
  Rivrh runs through: 89 km from the lake (-1,500 m) to the coast at px 446.6,548.8, ~25,000 km2 of catchment and
  ~38 m3/s at the mouth, the course marked `name_fixed` with its gloss so `river_names.py` keeps the name.
- **The satellite map audited** (`sat_audit.py <4.21 page> <4.20 page> <out dir>`, kept as `satellite-audit-4.21.json`).
  Fixed from it: the water flag in the heights raster now follows the water (9,500 cells of the settled and new lakes
  were water only in the water raster; `extract_region.py` reads that flag); water paint on ground made dry where 4.21
  changed the land (the dried and filled beds, the lowered region, the sea's arms the Beast Riders' grading made land) is
  repainted from dry, unwatered land round it, 2,400 px new since 4.20 down to 400; and water laid where the map painted
  land (the settled, grown and new lakes) takes the colour of the lake paint round it (22,500 px), so with the water
  layer off the satellite shows today's shores. Left as 4.20 had them: ~2,500 px of water paint on dry land outside the
  edits (most round the Iziz plain's salt depression, and the Ring Sea's eastern shore) and 78 cells the heights flag as
  water and the water raster does not. The edited areas' edges are no sharper than the map's own (95th percentile colour
  step 12.7 against 16.0).
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
is the first user (its README.md says how to refresh it). `--add <polygons.json>` (2026-10-15) adds more polygons to
the cut, a JSON list of `{name, map_px}`: the box covers them all and the mask is the union (`region.json` region `added`,
`union_km2`). The isle demo uses it for the two areas its owner added (`openworld/isle-demo/source/added-areas.json`).

## To do on the model (owner's list)

- **Done in 4.21 (the owner asked, 2026-10-19): the Lake of Shim**, above. Still to do from this item: refresh
  `openworld/little-demo/source/` from the live collections. Almua's river is drawn (Dip Rivrh, above).
- **4.22: the Lake of Shim** (when the Shim build is done, settlements/shim/PLAN.md; the owner, 2026-10-18). The region
  polygon "Lake of Shim" (`rshimlake0001`, about 32 by 12 km, px 376-382 by 780-796) is already in the artifact's
  `regions` collection and Shim's point (`sshimrest01`, 382,788) sits on its eastern shore. Carve it as the Bay of Voth
  was carved (`features.py`), but at the land's level there, not the sea's: the bed a few metres under the lake at the
  shore and 20-30 m at the middle, banks eased over about 2 px, the level the lowest shore cell's so it holds. Then
  re-run the river audit (`edit_rivers.py`) so the Shim river (r000) enters from the south and leaves north, record
  the lake with the others, relight, reclimate, repaint, publish, and refresh `openworld/little-demo/source/` from
  the live collections (which have lost the 2026-10-05 export's duplicate settlements and hold Voth at 470,688).
- **4.22: the rain on Pinnacle Rock's knoll** (the owner, 2026-10-23). 4.21 reads a dry island on the knoll (px 755,351):
  ~640 mm within 4 km (BSh 67%, Aw 33%) and ~810 mm within 10 km, against ~1,100-1,400 mm round it and 1,400-1,660 mm
  10-20 km west; Pinnacle Rock's plan had read about 3,000 mm on 2026-10-18. The likely cause is `reclimate`'s twins: the
  knoll stands ~500 m over the floor, so its nearest climate twins are drier upland cells, not a rain shadow. Blend the
  knoll's rain into its ring (radius ~12 km, a smoothstep over ~6 km more) to **~1,100-1,400 mm**, the monsoon-forest and
  savanna country round it, leaving the drier north (toward the painted highlands) as it is; recompute the class there
  (Am/Aw expected), repaint the rain and climate maps, re-run `edit_rivers.py`'s rain pass for the cells it changes,
  publish, and re-cut `settlements/pinnacle-rock/region/`.
- **4.22: the Cut's north mouth** (the owner, 2026-10-23; `biomes/cut/PLAN.md`). The lore opens the Cut to the lowlands
  on the north as well as to the crater; on 4.21 only the south-east (bearings 120-180 deg from the centre, px 460,302) is
  open, and the north lip stands 3.2-4.2 km. The ridge north of the floor is narrow: on x 450-470 it stands 3.4-3.9 km
  between y ~276 and ~248 (about 50 km) and falls to ~500 m by y 220 above Jimjam's lake (y ~212). Cut a mouth on
  bearings ~345-15 deg (px x ~445-475): continue the bowl's curved floor north until it meets the lowland slope, the sill
  at the lowland's own level (~500-800 m, about y 228-236) so Jimjam's lake (~165 m) does not drain into the bowl, ~30 km
  wide at the sill and widening into the bowl, the walls eased (the western outlets' `cut_channel` with a curved floor).
  Then re-route the rivers (the bowl stays endorheic), reclimate, relight, repaint, publish; the pass road runs through it.
  **Done in the same pass as the Cut's floor and climate** (the next item), so the rivers and the climate are redone once.
- **4.22: the Cut's floor and climate** (the owner, 2026-10-23: hot, but habitable year round, and still a little deeper
  than the crater). On 4.21 the floor is -2.2 km and a hothouse (mean +39 °C, warmest month +44, coldest +33, 2.1 atm):
  the lapse rate carried 0.9 km below the crater floor. Two changes:
  1. **Raise the floor ~600 m, to about -1.6 km** (~250 m under the central crater floor, ~0.5 km under the ground outside
     the crater mouth): add 600 m x smoothstep(lip, 0.35 lip) of the radius from the centre (px 460,302), so the walls
     and the lip are untouched and the floor's own relief is kept; the two lakes rise with it (the upper to ~-1,380 m,
     the lower to ~-1,730 m) and the bowl stays endorheic. Dilihan's ground in the crater mouth moves under ~100 m.
     Lapse: about -3.9 °C everywhere on the floor.
  2. **A closed-basin correction** for the climate inside the lip, which the lapse rate alone does not see: **afternoon
     cloud and storms** (the lakes' moisture forced up the walls) cap the highs, -4 to -5 °C on the warmest months'
     afternoons; **night drainage of cold air** off the 3-6 km walls pools on the floor, -3 to -5 °C on the lows; the
     lakes, snowmelt-fed off the lip, soften the extremes by the shore. Weighted by `s` (the warp's own strength field:
     1 at the centre, 0 at the lip), so the walls keep their own climate.
  Target on the floor: **mean ~+31-32 °C, warmest month ~+35-36, coldest ~+26, nights ~+23-26**, air ~1.95 atm; a wider
  day-night swing than 4.21's. Reclimate the class from the new temperatures (XA and Af expected by the lakes, XS and XV
  on the drier floor), relight, repaint; then re-cut any region that holds the Cut.
- **4.22: the great lake at the Rift's western head** (the owner, 2026-10-23; `biomes/riftrim/PLAN.md`). 4.21's river
  audit met a closed hollow 3.3 km deep (floor -2,028 m, px 146-201 by 1001-1058) on a course of ~800 m³/s and, by its
  rule for hollows over 150 m deep, filled it to its spill (1,312 m, a notch at px 194,1059) as a through lake: 8,768 km²,
  the deepest lake on the map, spilling 1.3 km straight down into the Rift past Chimes. By the water books that is right
  (the lake's evaporation never exceeds ~150 m³/s at any level), but the hollow is not: a pit at the Rift's shallow head,
  a notch in a thin ridge, a river that would long since have cut through it. The owner: **not deeper than the Rift
  beside it, shallower, and a gorge that frees land higher than the Rift's floor but lower than most of the rim**:
  1. **Fill the hollow into a basin plain**: inside the 1,312 m contour (the walls above it untouched, eased over 1-2
     cells), the ground rebuilt as a plain rising gently from a new shore at **~+300 m** to ~+1,000-1,300 m at the walls'
     foot, and a lake bed falling from that shore to **~-300 m** at its deepest (the Rift's floor beside it is ~-1,600 to
     -1,850 m within 40 km). Put the lake in the basin's north-west, over the old deepest ground (about px 150-182 by
     1001-1035), **against the north cliff**, so Ledge's cliff still stands over water; ~2,000-2,500 km² of lake, ~6,000
     km² of plain.
  2. **Cut the outlet gorge** (`cut_channel`, as the western outlets): from the lake's outlet across the plain to the
     notch, through it down to ~+300 m (1.2-2 km under the ridge's shoulders, 1.5-2.3 km), and on past **Chimes** (ruined
     arcology, px 196,1062) to the Rift's trough and its lake at px 214,1079 (bed ~-1,930 m), ~60 km, the bed falling all
     the way; the walls eased half down.
  Then re-route (the lake now spills through the gorge at its sill), reclimate the plain (expected Csa, Cfa: a mean of
  ~+16-22 °C, ~1,000-1,300 mm), relight, repaint, publish, and move Ledge's point out of the old lake (to the north
  cliff, px 165,1000, if the owner agrees).
- **4.22: the Bowl's lake effect** (the owner, 2026-10-23). 4.21 grew and joined the Bowl's lakes into one salt lake
  (9,600 km2, px 762-948 by 783-846) but gave it no lake effect: rain beside it is ~280 mm within 4 km against ~250 mm 40
  km away, and the shore is BWh to the water. The eastern abyss's lakes, by the same model, carry ~1,100 mm at the shore
  (~1,290 downwind) against ~520 at 20-40 km. Give the Bowl the abyss's method (`lake_rain`: the floor's background times
  the ratio by share of water within ~12 km), **damped for a hypersaline lake** (salt lowers evaporation, and a real hot
  salt lake gives little rain: the Dead Sea's shore gets ~50-100 mm), to about a third of the abyss's lift: proposed
  ~400-550 mm within ~10 km on the downwind south-east shore, ~300-400 upwind, fading by ~30 km, so the shore turns BSh
  and the deltas and the south-east shore green. Moderate the shore's temperature extremes a little (the lake's thermal
  mass). **Keep the south-west shore's green pockets** (px 831-846 by 812-844, Am and Aw at ~1,000-1,550 mm, where Mantis
  stands at 841,834): take the greater of the new rain and 4.21's there, so the oasis is not washed out to steppe.
  Reclimate the class from the new rain, repaint the rain and climate maps.
