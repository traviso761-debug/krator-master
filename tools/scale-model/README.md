# Scale model tools

Scripts that edit the **Krator Scale Model** artifact
(https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q), now version 4.22. The artifact's rasters live inside the page
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
- **The west bed's second lake** (px 325,120; checked 2026-10-20, not in `SETTLE`): a closed hollow in the west lobe's
  old bed, drawn at 0 m over 2,534 km2. Settled on its own water as `SETTLE` does (its drawn water taken away, the land
  routed again on the 4.21 page) it stands at +1 m over 2,615 km2, fed by ~26 m3/s: the drawn level holds, so no edit.
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

## 4.22: `edit_422.py` (2026-10-23): six of the owner's edits, the rivers rerouted

`edit_422.py <4.21 page> <regions.json> <settlements.json> <out page> [--rain <page>]` edits the **4.21** page and writes
`<out>.report.json` and `<out>.rivers.png` beside it. Deterministic; about six minutes. Run it twice, the second time
with `--rain <the first run's page>` (4.22: the passes agree to 0.1 mm of rain on average; 6 water cells differ; a third pass is byte-identical to the second). The
4.22 report is kept as `rivers-4.22.report.json` and `rivers-4.22.jpg` (the edited places ringed). Everything outside the `DATA` line and the version label is
byte-identical to 4.21 (checked).

**The rivers: a reroute, not a rerun of `edit_rivers.py`.** `edit_rivers.py` is the 4.21 edit itself (it takes a 4.20 page
and hard-codes 4.21's grading, settling, carving, outlets and paint), so it is kept as 4.21's record and never run on a
later page. `edit_422.py` lifts its routing, audit and designation (the water books, the Yuni river held to its course,
rounds of routing and cutting until no course climbs, the check that every course falls, the records) and runs them on
the 4.22 heights and rain with none of 4.21's edits. Two things had to change for a page that already holds 4.21's
water:
- **4.21's through lakes stay open** (`through_cells`). Drawn now, `edit_rivers.setup` calls a lake closed when its
  basin spills far over it, which in a closed basin is every lake: the Rift spills at 7,121 m, so the Rift river (951
  m³/s), Folriba and the rest below a through lake vanished on the first try. 202,777 km² of 4.21's through lakes are
  kept as through lakes.
- **The sealed basins keep 4.21's rain scale** (`books_422`). 4.21's books were closed on 4.20's water; closed again on
  4.21's own new lakes every sealed basin's scale moves (the south-eastern plateau's from 0.06 to 0.23, and its hollows
  fill). Only the Catch is closed anew (below). The crater's evaporation is calibrated again, as 4.21 does: x1.239
  (4.21: x1.264).
- A course matching a 4.21 course (half of either's cells shared, or the same mouth) keeps its **id, name, tongue and
  gloss**; the great lake's outflow keeps *Chimes Riba* (`r005`) though its gorge runs round Chimes. 853 of 4.21's 864
  courses carry over; 17 are new (ids from `r864`; in a region whose tongue is on record named in it from
  `river_names.py`'s words: *Folbruk*, *Wifbruk* on the great lake's plain, *Diip Baatar* the Hyperjungle lake's outflow
  into the Ring Sea, 3,130 m³/s, which flows now that 4.21's lakes stay open); 10 are gone (the 4.21 Cut wadi, the
  Yeti's old wadis, a few small courses whose flow moved). DATA.basins: 4.21's records outside the edited places, and
  this routing's lakes in them. 497 km² of new water lies outside the edited places (small endorheic lakes the slightly
  lower evaporation lets stand).
- **The paint**: only the rivers whose course or stroke changed are erased (painted from the land round them) and drawn
  again (78 erased, 84 drawn); the satellite and relief maps are re-tinted where the ground moved more than 150 m
  (`retint`: each pixel scaled by the colour of unmoved land of its new height round it over that of its old), not only
  re-lit, so the Cut's mouth and the Yeti's floor lose the snow of the ground they were.
  **The satellite repainted for the new climate** (the owner, 2026-10-23: the Catch looked too green, "the Taklamakan is
  not this green"; then the Bowl): the Catch under 4.5 km (fading out by 5.5 km, snow kept) takes the median colour of
  the map's own land under 150 mm at its height (`desert`), so 4.21's vegetation round Stair and its olive floor go
  (25,242 px); the Bowl, where its rain rose, takes that of the land elsewhere of its rain, height and warmth
  (`by_climate`): its downwind shore turns steppe and savanna (2,426 px), Mantis's pocket, the south wall's wet foot and
  the salt flats round the lake as they were. Each keeps its own brightness detail, so the texture and the shading stay.
  Published as version 86.

**The six edits** (the owner's list of 2026-10-23; the plans hold the reasons):
1. **Pinnacle Rock's knoll** (px 755,351; `settlements/pinnacle-rock/PLAN.md`). Its rain within 12 km (a smoothstep over
   6 km more) blends to the median of its ring 18-32 km out, not the drier north, held in 1,100-1,400 mm: 643 -> **1,380
   mm** within 4 km (847 -> 1,380 within 12 km), the class following (Af and Am).
2. **The Cut** (`biomes/cut/PLAN.md`). The floor raised 600 m on smoothstep(lip, 0.35 lip) of the radius from px 460,302
   (the lip per bearing the crest of the walls, ~37-46 px): the floor's median -2,038 -> **-1,438 m**, ~1.92 atm; Dilihan's
   ground +136 m. **The north mouth**: the bowl's curved floor continued north to a **sill of 700 m on the lip's line**
   (px 460,262), the pass floor running on there, falling 30 m to the lowland slope at px 460,225, ~30 km wide there and
   widening into the bowl, the walls rising 220 m a px; the lip there stood 4,179 m (cut up to 3,674 m). The divide is at
   the lip, not at the lowland end: a floor sloping into the bowl from a sill at the lowland end took the ridge's north
   flank into the bowl (~6,000 km², ~100 m³/s) and its lake spread over most of the floor (4,000 km²). The mouth drains
   north to Jimjam's river; Jimjam's lake (~165 m) cannot reach the bowl. **The closed basin's correction** (x the
   raise's strength): the mean -2.5 °C, warmest month -3.5, coldest -3, the highs -4.5, the nights -1 on top of the lapse
   (-3.9 °C), so the floor reads **+31 (warmest +35, coldest +26, highs +40, nights +23)**, against 4.21's +38 (43/33). The
   bowl keeps 4.21's rain (~1,110 mm on the floor); the class follows the new temperatures (XA, XS, XV and Af by the
   lakes). The lakes settle by the routing: **two salt lakes, 2,663 km² at -1,456 m and 497 km² at -1,608 m**, endorheic under a spill of -383 m
   (asserted: the floor's water ends in the bowl; the mouth's floor stays under its sill). 4.21 drew 2,326 km² there: the
   cooler floor evaporates less. The rain map keeps a faint pale line along the sill's crease (re-lighting).
3. **The great lake at the Rift's western head** (`biomes/riftrim/PLAN.md`). The hollow inside 4.21's 1,312 m spill (8,791
   km², floor -2,028 m) rebuilt: a lake ellipse in its north-west against the north cliff, its shore at +300 m and its bed
   down to -275 m, and a basin plain rising from 310 m to 1,250 m at the walls' foot, its edge eased. The **outlet gorge**
   (`cut_channel`) runs 92 km from the lake across the plain, through a new notch just west of 4.21's (4.21 ground up to
   1,949 m cut to ~282 m, ~1.7 km under shoulders of 2.1-2.7 km), 7 km from Chimes, to the Rift trough's lake at -1,862
   m. Routed: **the lake stands at 298 m over 2,342 km², 573 m deep, a through lake at its sill** (asserted: it holds at
   its sill, no shore under its level off the gorge, and 943 m³/s leave it, 96% of the way down the gorge, to the Rift's
   lake). **6,449 km² of plain**: a mean of +16 °C (25/6), ~1,040 mm, Csa and Cfa. DATA.outlets gains the gorge.
   **Ledge** moved to the north cliff, px 165,1000 (1,638 m, over the water), in the settlements collection.
4. **The Yeti's central valley** (`biomes/nwouterwall/PLAN.md` section 1). Lowered 800 m by height alone (full from 5.8 to
   6.6 km, eased in from 4.4 km and out to the ranges at 7.4 km: the lowering keeps every height's order, so it makes no
   hollow; a smoothstep in from the trough's edge, the first try, left the lake at the range's foot lowered a third and
   closed the trough's ends into new lakes), faded at its box's edge: the trough's floor (19,622 km²) 6,303 -> **5,554 m**,
   ~0.80 atm. The sheltered valley's correction (summer +2 °C, winter -2): **mean -4 °C, warmest month +11, coldest -19**
   (4.21: -9, +4, -22). Rain stays the valley's (~125 mm). The frozen lake settles at **5,680 m** (449 km², a through
   lake): the ground is no longer frozen all year (mean over -10 °C), so the valley carries courses again, all dry valleys
   on its rain.
5. **The Bowl's lake effect** (`biomes/sedesert/PLAN-BOWL.md`). The abyss's method (`edit_rivers.lake_rain`'s table: the
   floor's background times the ratio by the share of water within ~12 km) with the lift damped to 0.22 for a
   hypersaline lake (a third gave ~590 mm, over the plan's 400-550), the water seen 4 px upwind (the north-west wind):
   within 20 km of the shore the downwind (south-east) side **251 -> 560 mm** (BSh, Aw), the upwind **220 -> 313 mm**; never
   under 4.21's, so the south-west shore's green pocket where Mantis stands keeps its Am and Aw (659 -> 864 mm in its box).
   The shore's highs -1.5 °C and lows +1.5 where water is a quarter of the ground round it. The Bowl's drawn lake (9,578
   km²) is closed as 4.21 drew it: it now receives 306 m³/s and would lose 251 more than that (`bowl_lakes`): it holds.
6. **The Catch, a closed basin** (`biomes/catch/PLAN.md` sections 3-4). Under its spill (6,150 m), faded over 20 km inside:
   rain by height, never over 4.21's under 3 km: the floor **298 -> 18 mm**, the foothills 251 -> 71, the inner walls take
   the table (~100-130 mm, 78 -> 115 median; 4.21's walls feed no river at all, and the plan asks ~30 m³/s), falling to
   nothing up the high walls; Stair's hot spot gone. The floor's warmest month +4 °C and coldest -3.5 (+30 -> +34, +9 ->
   +6). Its books: the rain it is given is its own (not scaled to what its land evaporates with no lake yet, 5.5%, which
   feeds no lake ever), the rest of the sealed basin keeping 4.21's scale; Turc's runoff is ~26 m³/s. The routing grows
   **a terminal salt lake at the lowest point, 738 km² at 318 m** (px 763,1062), and three more salt pans on the flat floor
   (497, 257 and 176 km² at 368-400 m), the flats drowned at their balance level by `hydro.route` (the plan's "a few hundred
   km²" would need the fans' losses the model does not carry); a few small tarns on the walls (3.6-6 km). They are painted
   in the Bowl's salt-lake look. Its courses are dry valleys and one stream (~13 m³/s): the oases are the open world's.

Left for later: the Lake of Shim's to-do (it waits on the Shim build), the Ancients' highways layer, re-cutting the
regions that hold the edited places (`settlements/pinnacle-rock/region/`, the Cut, the Catch), and refreshing
`openworld/little-demo/source/`.

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

**Overlays and the old waters (2026-10-20, `biomes/nsemiarid/PLAN.md` section 3).** The regions in `OVERLAYS` (`floodzone`,
`dam`, `dam 2`) are layers that own no ground: they stay out of `biome.png` and are written, as drawn, one bit each to
`overlay.png` (`region.json` `overlays`: bit, name, the build that draws it). The owner's tool polygons (`Region 65`) are
no biome either. Where the page carries `DATA.palaeolakes`, `palaeo.png` (one bit per body, on the height grid, dilated
`PALAEO_PAD` cells: the world's own contour at the level draws the shore) and `region.json` `palaeo` give each dam lake
(level, sill = its notch's floor, the bathtub ring's 30 m, the water over and under the sill, its remnant lakes today),
the **flood lake** (every dam lake's water over its sill pooled where the last breach ends, from that body's level today:
4.21 gives 834 m over 79,930 km2) and the dams and floods' courses in px and metres. Both only when they reach the box,
so the other cuts are unchanged. `openworld/north-basin/` is the first user.

## To do on the model (owner's list)

- **Proposed for 4.23: the Godthrone's summit** (the owner, 2026-10-26; `biomes/godthrone/PLAN.md` section 1). On 4.22 the
  summit is not a peak but the raster's ceiling: a table of 8,416 km² (100 by 108 km, centred on px 575,937) flat at
  17,098 ± 9 m, the volcano cut off at `hi`. The edit:
  - **Raise the ceiling**: `DATA.hi` 17,100 -> 27,000 m and re-encode `h` and `wl` (the step goes from 0.30 to 0.45 m).
    The page, `edit_422.py` and `extract_region.py` read `DATA.lo`/`hi`; `assemble.py`, `edit_heights.py`, `features.py`
    and `inner_wall_smooth.py` hard-code `LO, HI` (records of past edits, never run on a later page: update the
    constants anyway).
  - **Rebuild the top** above ~14 km only (eased in from 14 to 17 km, nothing lower moves): the flanks' own slope carried
    up to a **summit caldera rim at ~25 km** (0.07 atm on the model's formula), an Olympus Mons-style nested caldera
    60-80 km across and 2-3 km deep, its floor ~22 km.
  - **A summit vent** on the caldera floor in `DATA.vents`.
  - **Climate there**: class O over the new ground; rain stays 0, so no river moves. Relight. **Do not carry the lapse
    rate past ~17 km**: 4.22 already reads a mean of -82 °C on the clipped table, and -6.5 °C/km more would put the rim
    near -135 °C. Below ~0.1 atm the ground's temperature is set by sunlight, not by the air (Mars: a mean near -60 °C,
    days to +20, nights to -80), so hold the mean at about -75 °C above 17 km.
  - **The docs**: `LORE.md` (the model's height range, the Godthrone's height, the note below); `biomes/throne/NOTES.md`'s
    pressure table; `biomes/WORLD.md`'s raster line; `biomes/catch/PLAN.md` (its walls run to the new summit);
    `openworld/ANCIENT-ROADS.md` (the summit moves from px 574,909 to ~575,937, and Pluton's tunnels climb ~8 km more
    over the same ~270 km).
  - **A lore note for `LORE.md` §2, "Why Krator is volcanic"** (settled with the owner 2026-10-26): Krator is a moon
    locked to its gas giant, flexed and heated by tides from an orbit kept slightly eccentric by its sibling moons
    (as Io's is), at **2-5x Earth's heat flow** (Io's is ~25x). It has **no plate tectonics: one thick, unmoving shell**
    (a 3,000 km crater survives only on such a world). It loses its heat as a **heat-pipe** world does, through
    long-lived vents, and the buried flows thicken and stiffen the shell; that shell holds up a volcano of **Olympus
    Mons size**, and a plume that never moves builds it. The volcanism is **focused, not global** (Io, at ~1 cm of new
    rock a year, has no craters at all): the Throne fills the crater's centre as lava filled the Moon's basins, the
    Godthrone sits on its plume, and the Rift and the vent fields take the rest; tides crack the shell into rifts
    without moving it. **The Godthrone's lava is titanium-rich** (the owner, 2026-10-26): black, very fluid, and its
    fountain glass orange, as on the Moon.
  - *Candidates, awaiting the owner* (2026-10-26):
    - **The blood river** (`biomes/godthrone/PLAN.md` section 4): Qol Ḍrāi (r442, from ~5.3 km below the Godthrone's
      ice belt) made perennial, fed by the bloodfalls' brine and the ice belt's melt, and carried ~25 km on from its
      4.22 end (px 555,1134, 1,208 m) into the Rift's lake at -717 m (px 541,1156). Rerouted the 4.22 way (`edit_422.py`'s
      routing), its new name the owner's.
    - **A flank vent at Godstep valley's head** (`biomes/godstep/PLAN.md`, station 3): a small cinder cone on the
      Godthrone's north-east flank at ~4-5 km, in `DATA.vents`.
- **Done in 4.22 (2026-10-23)**, above: Pinnacle Rock's knoll, the Cut's floor, climate and north mouth, the great lake at the Rift's head (and Ledge moved to its cliff), the Yeti's valley, the Bowl's lake effect, the Catch as a closed basin. Still to do from them: re-cut `settlements/pinnacle-rock/region/` and any region holding the Cut or the Catch.
- **Done in 4.21 (the owner asked, 2026-10-19): the Lake of Shim**, above. Still to do from this item: refresh
  `openworld/little-demo/source/` from the live collections. Almua's river is drawn (Dip Rivrh, above).
- **The Lake of Shim** (still pending: it waits on the Shim build; not in 4.22. When the Shim build is done, settlements/shim/PLAN.md; the owner, 2026-10-18). The region
  polygon "Lake of Shim" (`rshimlake0001`, about 32 by 12 km, px 376-382 by 780-796) is already in the artifact's
  `regions` collection and Shim's point (`sshimrest01`, 382,788) sits on its eastern shore. Carve it as the Bay of Voth
  was carved (`features.py`), but at the land's level there, not the sea's: the bed a few metres under the lake at the
  shore and 20-30 m at the middle, banks eased over about 2 px, the level the lowest shore cell's so it holds. Then
  re-run the river audit (the reroute, as `edit_422.py` does it; not `edit_rivers.py`, the 4.21 edit) so the Shim river
  (r000) enters from the south and leaves north, record
  the lake with the others, relight, reclimate, repaint, publish, and refresh `openworld/little-demo/source/` from
  the live collections (which have lost the 2026-10-05 export's duplicate settlements and hold Voth at 470,688).
- **The Ancients' highways** (the owner, 2026-10-23; `openworld/ANCIENT-ROADS.md`): a network layer on the model
  (`DATA.ancient_roads`), routed over the heights between the Ancient sites, with its tunnels (the Rift line under the
  Outer Wall, at least one route under the Inner Wall), shown as a layer for the owner to review, and carried by
  `extract_region.py` as the rivers are.
- **Record edits waiting on the owner** (offered 2026-10-23, not done):
  - rename the political region **"Crag Men"** to **"Talovolci"** (`LORE.md` §6.21);
  - rename the biome polygons **`e inner wall` → `e highlands`** and **`e highlands` → `painted highlands`**, so the
    names match the kits (`biomes/WORLD.md`);
  - **the Rift's settlements** reworked (names, places, types) with Arccube fixed (`biomes/riftrim/PLAN.md` section 12);
  - the **Sanctum** (the Eternal State's arcology) placed near Centrum (`LORE.md` §6.19);
  - notes on **Carcosa** (the Yusar's core) and **Henge** (a large Yusar segment), the cybernetics tribe's seats;
  - a region **"Stalker Peaks"** east of the Catch: the ranges between its eastern wall and Hub 01, and the 13-15 km peaks
    round Hub 01's high valley (px ~960-1140 by 950-1180; `biomes/catch/PLAN.md` section 6c).
  Done on the model 2026-10-23: **Ledge** moved to the great lake's north cliff (px 165,1000; with 4.22); **Mantis** moved to the Bowl's oasis (px 841,834); **Daridel** moved into the cloud forest
  (px 528,687); **Stair** moved to the springs' hollow in the Catch's interior hills (px 834,1112), the Hill arcology's site. **`rift rim`** split into **`rift rim N`** (the old record, renamed and trimmed to the w rift highland's border) and **`rift rim S`** (`rmvriftrims01`, with the west bend south of the highland).
